import { Node, Edge } from 'reactflow';

// Node Types
export type NodeType = 'userQuery' | 'knowledgeBase' | 'llmEngine' | 'output';

// Node Configuration Interfaces
export interface KnowledgeBaseConfig {
  documents: string[];
  embeddingModel: 'openai' | 'gemini';
  topK: number;
}

export interface LLMEngineConfig {
  provider: 'openai' | 'gemini';
  model: string;
  systemPrompt: string;
  temperature: number;
  useWebSearch: boolean;
  webSearchProvider: 'serpapi' | 'brave';
  apiKey?: string;
}

export interface NodeConfig {
  documents?: string[];
  embeddingModel?: string;
  topK?: number;
  provider?: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  useWebSearch?: boolean;
  webSearchProvider?: string;
  apiKey?: string;
}

// Custom Node Data
export interface CustomNodeData {
  label: string;
  type: NodeType;
  config: NodeConfig;
}

export type CustomNode = Node<CustomNodeData>;
export type CustomEdge = Edge;

// Workflow Definition
export interface WorkflowDefinition {
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
}

// Validation
export interface ValidationError {
  code: string;
  message: string;
  nodeId?: string;
}

export interface WorkflowValidation {
  valid: boolean;
  errors: ValidationError[];
}

// Execution
export interface ExecutionStep {
  nodeId: string;
  nodeType: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  output?: unknown;
  error?: string;
  durationMs?: number;
}

export interface WorkflowExecuteResponse {
  success: boolean;
  response?: string;
  error?: string;
  steps: ExecutionStep[];
  totalDurationMs: number;
}

// Document
export interface Document {
  id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  chunkCount: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// Chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    steps?: ExecutionStep[];
    durationMs?: number;
  };
}

// Component Panel Items
export interface ComponentItem {
  type: NodeType;
  label: string;
  description: string;
  icon: string;
  color: string;
}
