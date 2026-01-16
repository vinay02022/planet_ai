import { create } from 'zustand';
import {
  Node,
  Edge,
  Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import { CustomNodeData, WorkflowValidation, ChatMessage, Document } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface WorkflowState {
  // Canvas State
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  selectedNode: Node<CustomNodeData> | null;

  // Validation State
  isValid: boolean;
  validationErrors: WorkflowValidation['errors'];

  // Chat State
  chatMessages: ChatMessage[];
  isChatOpen: boolean;
  isExecuting: boolean;
  sessionId: string;

  // Documents
  documents: Document[];

  // Actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<CustomNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  selectNode: (node: Node<CustomNodeData> | null) => void;
  setValidation: (validation: WorkflowValidation) => void;
  clearCanvas: () => void;

  // Chat Actions
  openChat: () => void;
  closeChat: () => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  setExecuting: (executing: boolean) => void;

  // Document Actions
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  removeDocument: (documentId: string) => void;

  // Workflow Actions
  getWorkflowDefinition: () => {
    nodes: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      data: CustomNodeData;
    }>;
    edges: Array<{
      source: string;
      target: string;
      sourceHandle?: string;
      targetHandle?: string;
    }>;
  };
  loadWorkflow: (nodes: Node<CustomNodeData>[], edges: Edge[]) => void;
}

const defaultNodeData: Record<string, CustomNodeData> = {
  userQuery: {
    label: 'User Query',
    type: 'userQuery',
    config: {},
  },
  knowledgeBase: {
    label: 'Knowledge Base',
    type: 'knowledgeBase',
    config: {
      documents: [],
      embeddingModel: 'openai',
      topK: 5,
    },
  },
  llmEngine: {
    label: 'LLM Engine',
    type: 'llmEngine',
    config: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      systemPrompt: '',
      temperature: 0.7,
      useWebSearch: false,
      webSearchProvider: 'serpapi',
    },
  },
  output: {
    label: 'Output',
    type: 'output',
    config: {},
  },
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Initial State
  nodes: [],
  edges: [],
  selectedNode: null,
  isValid: false,
  validationErrors: [],
  chatMessages: [],
  isChatOpen: false,
  isExecuting: false,
  sessionId: uuidv4(),
  documents: [],

  // Node/Edge Changes
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
        },
        get().edges
      ),
    });
  },

  addNode: (type, position) => {
    const newNode: Node<CustomNodeData> = {
      id: uuidv4(),
      type: 'custom',
      position,
      data: { ...defaultNodeData[type] },
    };

    set({
      nodes: [...get().nodes, newNode],
    });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data, config: { ...node.data.config, ...data.config } } }
          : node
      ),
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
      selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode,
    });
  },

  selectNode: (node) => {
    set({ selectedNode: node });
  },

  setValidation: (validation) => {
    set({
      isValid: validation.valid,
      validationErrors: validation.errors,
    });
  },

  clearCanvas: () => {
    set({
      nodes: [],
      edges: [],
      selectedNode: null,
      isValid: false,
      validationErrors: [],
    });
  },

  // Chat Actions
  openChat: () => set({ isChatOpen: true }),
  closeChat: () => set({ isChatOpen: false }),

  addChatMessage: (message) => {
    set({
      chatMessages: [...get().chatMessages, message],
    });
  },

  clearChat: () => {
    set({
      chatMessages: [],
      sessionId: uuidv4(),
    });
  },

  setExecuting: (executing) => set({ isExecuting: executing }),

  // Document Actions
  setDocuments: (documents) => set({ documents }),

  addDocument: (document) => {
    set({
      documents: [...get().documents, document],
    });
  },

  removeDocument: (documentId) => {
    set({
      documents: get().documents.filter((doc) => doc.id !== documentId),
    });
  },

  // Workflow Actions
  getWorkflowDefinition: () => {
    const { nodes, edges } = get();

    return {
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type || 'custom',
        position: node.position,
        data: node.data,
      })),
      edges: edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
      })),
    };
  },

  loadWorkflow: (nodes, edges) => {
    set({
      nodes,
      edges,
      selectedNode: null,
    });
  },
}));
