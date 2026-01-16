from typing import Dict, Any, List, Optional
from collections import defaultdict
import time

from app.services.embedding import EmbeddingService
from app.services.llm import LLMService
from app.services.search import WebSearchService
from app.schemas.workflow import (
    WorkflowDefinition,
    WorkflowValidation,
    ValidationError,
    WorkflowExecuteResponse,
    ExecutionStep,
)


class WorkflowExecutor:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.llm_service = LLMService()
        self.search_service = WebSearchService()

    def validate_workflow(self, workflow: WorkflowDefinition) -> WorkflowValidation:
        """Validate workflow structure and connections."""
        errors = []
        nodes = workflow.nodes
        edges = workflow.edges

        # Create lookup maps
        node_map = {node.id: node for node in nodes}
        node_types = [node.data.type for node in nodes]

        # Rule 1: Must have exactly one User Query node
        user_query_count = node_types.count("userQuery")
        if user_query_count == 0:
            errors.append(ValidationError(
                code="MISSING_USER_QUERY",
                message="Workflow must have a User Query component as entry point"
            ))
        elif user_query_count > 1:
            errors.append(ValidationError(
                code="MULTIPLE_USER_QUERY",
                message="Workflow can only have one User Query component"
            ))

        # Rule 2: Must have exactly one Output node
        output_count = node_types.count("output")
        if output_count == 0:
            errors.append(ValidationError(
                code="MISSING_OUTPUT",
                message="Workflow must have an Output component"
            ))
        elif output_count > 1:
            errors.append(ValidationError(
                code="MULTIPLE_OUTPUT",
                message="Workflow can only have one Output component"
            ))

        # Rule 3: Must have at least one processing node (LLM or KnowledgeBase)
        has_llm = "llmEngine" in node_types
        has_kb = "knowledgeBase" in node_types
        if not has_llm and not has_kb:
            errors.append(ValidationError(
                code="NO_PROCESSING",
                message="Workflow must have at least one LLM Engine or Knowledge Base component"
            ))

        # Build adjacency lists
        outgoing = defaultdict(list)
        incoming = defaultdict(list)
        for edge in edges:
            outgoing[edge.source].append(edge.target)
            incoming[edge.target].append(edge.source)

        # Rule 4: Check all nodes are connected
        for node in nodes:
            if node.data.type == "userQuery":
                if not outgoing.get(node.id):
                    errors.append(ValidationError(
                        code="DISCONNECTED_USER_QUERY",
                        message="User Query must be connected to next component",
                        node_id=node.id
                    ))
            elif node.data.type == "output":
                if not incoming.get(node.id):
                    errors.append(ValidationError(
                        code="DISCONNECTED_OUTPUT",
                        message="Output must receive input from a component",
                        node_id=node.id
                    ))
            else:
                # Middle nodes should have both incoming and outgoing
                if not incoming.get(node.id) and not outgoing.get(node.id):
                    errors.append(ValidationError(
                        code="ORPHAN_NODE",
                        message=f"Component '{node.data.label}' is not connected",
                        node_id=node.id
                    ))

        # Rule 5: Check for cycles (using DFS)
        if not errors:  # Only check if basic structure is valid
            has_cycle = self._detect_cycle(nodes, edges)
            if has_cycle:
                errors.append(ValidationError(
                    code="CYCLE_DETECTED",
                    message="Workflow cannot contain cycles"
                ))

        return WorkflowValidation(
            valid=len(errors) == 0,
            errors=errors
        )

    def _detect_cycle(self, nodes: List, edges: List) -> bool:
        """Detect cycles using DFS."""
        graph = defaultdict(list)
        for edge in edges:
            graph[edge.source].append(edge.target)

        visited = set()
        rec_stack = set()

        def dfs(node_id: str) -> bool:
            visited.add(node_id)
            rec_stack.add(node_id)

            for neighbor in graph.get(node_id, []):
                if neighbor not in visited:
                    if dfs(neighbor):
                        return True
                elif neighbor in rec_stack:
                    return True

            rec_stack.remove(node_id)
            return False

        for node in nodes:
            if node.id not in visited:
                if dfs(node.id):
                    return True

        return False

    def _topological_sort(self, nodes: List, edges: List) -> List:
        """Sort nodes in execution order using topological sort."""
        graph = defaultdict(list)
        in_degree = defaultdict(int)

        node_map = {node.id: node for node in nodes}

        for node in nodes:
            in_degree[node.id] = 0

        for edge in edges:
            graph[edge.source].append(edge.target)
            in_degree[edge.target] += 1

        # Find starting nodes (in_degree = 0)
        queue = [node_id for node_id, degree in in_degree.items() if degree == 0]
        sorted_nodes = []

        while queue:
            node_id = queue.pop(0)
            sorted_nodes.append(node_map[node_id])

            for neighbor in graph[node_id]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        return sorted_nodes

    async def execute(
        self,
        workflow: WorkflowDefinition,
        user_query: str,
    ) -> WorkflowExecuteResponse:
        """Execute the workflow with the given query."""
        start_time = time.time()
        steps = []

        # Validate first
        validation = self.validate_workflow(workflow)
        if not validation.valid:
            return WorkflowExecuteResponse(
                success=False,
                error="Workflow validation failed: " + "; ".join(
                    [e.message for e in validation.errors]
                ),
                steps=[],
            )

        try:
            # Sort nodes in execution order
            sorted_nodes = self._topological_sort(workflow.nodes, workflow.edges)

            # Build edge map for data passing
            edge_map = {}
            for edge in workflow.edges:
                if edge.target not in edge_map:
                    edge_map[edge.target] = []
                edge_map[edge.target].append(edge.source)

            # Context for passing data between nodes
            node_outputs = {}
            final_response = None

            # Execute each node in order
            for node in sorted_nodes:
                step_start = time.time()
                step = ExecutionStep(
                    node_id=node.id,
                    node_type=node.data.type,
                    status="running",
                )

                try:
                    # Gather inputs from connected nodes
                    inputs = {"query": user_query}
                    for source_id in edge_map.get(node.id, []):
                        if source_id in node_outputs:
                            inputs.update(node_outputs[source_id])

                    # Execute based on node type
                    output = await self._execute_node(node, inputs)
                    node_outputs[node.id] = output

                    step.status = "completed"
                    step.output = output
                    step.duration_ms = int((time.time() - step_start) * 1000)

                    # Capture final response from output node
                    if node.data.type == "output":
                        final_response = output.get("response", output.get("context", ""))

                except Exception as e:
                    step.status = "error"
                    step.error = str(e)
                    step.duration_ms = int((time.time() - step_start) * 1000)
                    steps.append(step)
                    raise

                steps.append(step)

            total_duration = int((time.time() - start_time) * 1000)

            return WorkflowExecuteResponse(
                success=True,
                response=final_response,
                steps=steps,
                total_duration_ms=total_duration,
            )

        except Exception as e:
            total_duration = int((time.time() - start_time) * 1000)
            return WorkflowExecuteResponse(
                success=False,
                error=str(e),
                steps=steps,
                total_duration_ms=total_duration,
            )

    async def _execute_node(self, node, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single node."""
        node_type = node.data.type
        config = node.data.config or {}

        if node_type == "userQuery":
            return {"query": inputs.get("query", "")}

        elif node_type == "knowledgeBase":
            query = inputs.get("query", "")
            document_ids = config.documents if config.documents else None
            top_k = config.top_k or 5
            embedding_model = config.embedding_model or "openai"

            results = await self.embedding_service.search_similar(
                query=query,
                document_ids=document_ids,
                top_k=top_k,
                model=embedding_model,
            )

            # Format context from results
            context = "\n\n".join([
                f"[From {r['document_name']}]:\n{r['content']}"
                for r in results
            ])

            return {
                "query": query,
                "context": context,
                "search_results": results,
            }

        elif node_type == "llmEngine":
            query = inputs.get("query", "")
            context = inputs.get("context", "")

            # Add web search results if enabled
            if config.use_web_search:
                search_results = await self.search_service.search(
                    query=query,
                    num_results=5,
                    provider=config.web_search_provider or "serpapi",
                )
                if search_results["success"]:
                    web_context = self.search_service.format_search_results_as_context(
                        search_results["results"]
                    )
                    context = f"{context}\n\n{web_context}" if context else web_context

            # Call LLM
            result = await self.llm_service.generate(
                query=query,
                context=context if context else None,
                system_prompt=config.system_prompt,
                provider=config.provider or "openai",
                model=config.model,
                temperature=config.temperature or 0.7,
            )

            if result["success"]:
                return {
                    "query": query,
                    "response": result["response"],
                    "llm_metadata": {
                        "provider": result["provider"],
                        "model": result["model"],
                        "usage": result.get("usage"),
                    },
                }
            else:
                raise Exception(f"LLM Error: {result.get('error')}")

        elif node_type == "output":
            # Pass through the response
            return {
                "response": inputs.get("response", inputs.get("context", "")),
                "query": inputs.get("query", ""),
            }

        else:
            raise ValueError(f"Unknown node type: {node_type}")
