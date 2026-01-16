from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from uuid import UUID


class NodePosition(BaseModel):
    x: float
    y: float


class NodeConfig(BaseModel):
    """Configuration for each node type."""
    # KnowledgeBase config
    documents: Optional[List[str]] = None
    embedding_model: Optional[str] = "openai"
    top_k: Optional[int] = 5

    # LLM Engine config
    provider: Optional[str] = "openai"
    model: Optional[str] = "gpt-4o-mini"
    system_prompt: Optional[str] = None
    temperature: Optional[float] = 0.7
    use_web_search: Optional[bool] = False
    web_search_provider: Optional[str] = "serpapi"

    # API Keys (optional, can use defaults)
    api_key: Optional[str] = None


class NodeData(BaseModel):
    label: str
    type: Literal["userQuery", "knowledgeBase", "llmEngine", "output"]
    config: Optional[NodeConfig] = NodeConfig()


class Node(BaseModel):
    id: str
    type: str
    position: NodePosition
    data: NodeData


class EdgeData(BaseModel):
    source: str
    target: str
    source_handle: Optional[str] = None
    target_handle: Optional[str] = None


class WorkflowDefinition(BaseModel):
    nodes: List[Node]
    edges: List[EdgeData]


class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    definition: WorkflowDefinition


class WorkflowResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    definition: Dict[str, Any]
    is_valid: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ValidationError(BaseModel):
    code: str
    message: str
    node_id: Optional[str] = None


class WorkflowValidation(BaseModel):
    valid: bool
    errors: List[ValidationError] = []


class WorkflowExecute(BaseModel):
    workflow: WorkflowDefinition
    query: str
    session_id: Optional[str] = None


class ExecutionStep(BaseModel):
    node_id: str
    node_type: str
    status: str  # pending, running, completed, error
    output: Optional[Any] = None
    error: Optional[str] = None
    duration_ms: Optional[int] = None


class WorkflowExecuteResponse(BaseModel):
    success: bool
    response: Optional[str] = None
    error: Optional[str] = None
    steps: List[ExecutionStep] = []
    total_duration_ms: int = 0
