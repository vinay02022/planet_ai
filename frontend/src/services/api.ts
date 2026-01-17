import axios from 'axios';
import { WorkflowDefinition, WorkflowValidation, WorkflowExecuteResponse, Document } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Workflow APIs
export const workflowApi = {
  validate: async (workflow: WorkflowDefinition): Promise<WorkflowValidation> => {
    const response = await api.post('/workflows/validate', workflow);
    return response.data;
  },

  execute: async (workflow: WorkflowDefinition, query: string, sessionId?: string): Promise<WorkflowExecuteResponse> => {
    const response = await api.post('/workflows/execute', {
      workflow,
      query,
      session_id: sessionId,
    });
    return response.data;
  },

  save: async (name: string, description: string, workflow: WorkflowDefinition) => {
    const response = await api.post('/workflows', {
      name,
      description,
      definition: workflow,
    });
    return response.data;
  },

  list: async () => {
    const response = await api.get('/workflows');
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/workflows/${id}`);
    return response.data;
  },
};

// Document APIs
export const documentApi = {
  upload: async (file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  list: async (): Promise<{ documents: Document[]; total: number }> => {
    const response = await api.get('/documents');
    return response.data;
  },

  get: async (id: string): Promise<Document> => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};

// LLM APIs
export const llmApi = {
  generate: async (params: {
    query: string;
    context?: string;
    systemPrompt?: string;
    provider?: string;
    model?: string;
    temperature?: number;
  }) => {
    const response = await api.post('/llm/generate', {
      query: params.query,
      context: params.context,
      system_prompt: params.systemPrompt,
      provider: params.provider || 'gemini',
      model: params.model,
      temperature: params.temperature || 0.7,
    });
    return response.data;
  },
};

// Search APIs
export const searchApi = {
  web: async (query: string, numResults = 5, provider = 'serpapi') => {
    const response = await api.post('/search/web', {
      query,
      num_results: numResults,
      provider,
    });
    return response.data;
  },

  knowledge: async (query: string, documentIds?: string[], topK = 5) => {
    const response = await api.post('/search/knowledge', {
      query,
      document_ids: documentIds,
      top_k: topK,
    });
    return response.data;
  },
};

// Chat APIs
export const chatApi = {
  saveMessage: async (sessionId: string, role: string, content: string, metadata?: object) => {
    const response = await api.post('/chat/messages', {
      session_id: sessionId,
      role,
      content,
      metadata,
    });
    return response.data;
  },

  getHistory: async (sessionId: string) => {
    const response = await api.get(`/chat/sessions/${sessionId}`);
    return response.data;
  },

  clearHistory: async (sessionId: string) => {
    const response = await api.delete(`/chat/sessions/${sessionId}`);
    return response.data;
  },
};

export default api;
