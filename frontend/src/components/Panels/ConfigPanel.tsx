import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, RefreshCw } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { documentApi } from '../../services/api';
import { Document } from '../../types';

const ConfigPanel: React.FC = () => {
  const { selectedNode, updateNodeData, selectNode, documents, setDocuments, addDocument, removeDocument } = useWorkflowStore();
  const [uploading, setUploading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoadingDocs(true);
    try {
      const response = await documentApi.list();
      setDocuments(response.documents);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
    setLoadingDocs(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const doc = await documentApi.upload(file);
      addDocument(doc);
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document');
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await documentApi.delete(docId);
      removeDocument(docId);

      // Remove from node config if selected
      if (selectedNode?.data.config.documents?.includes(docId)) {
        updateNodeData(selectedNode.id, {
          config: {
            ...selectedNode.data.config,
            documents: selectedNode.data.config.documents.filter((id: string) => id !== docId),
          },
        });
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const toggleDocumentSelection = (docId: string) => {
    if (!selectedNode) return;

    const currentDocs = selectedNode.data.config.documents || [];
    const newDocs = currentDocs.includes(docId)
      ? currentDocs.filter((id: string) => id !== docId)
      : [...currentDocs, docId];

    updateNodeData(selectedNode.id, {
      config: {
        ...selectedNode.data.config,
        documents: newDocs,
      },
    });
  };

  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Configuration</h2>
        <p className="text-sm text-gray-500">
          Select a component on the canvas to configure it
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedNode.data.label}
        </h2>
        <button
          onClick={() => selectNode(null)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* User Query Config */}
      {selectedNode.data.type === 'userQuery' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            This component accepts user queries as the entry point for your workflow.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={selectedNode.data.label}
              onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Knowledge Base Config */}
      {selectedNode.data.type === 'knowledgeBase' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={selectedNode.data.label}
              onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Embedding Model
            </label>
            <select
              value={selectedNode.data.config.embeddingModel || 'openai'}
              onChange={(e) => updateNodeData(selectedNode.id, {
                config: { ...selectedNode.data.config, embeddingModel: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="openai">OpenAI</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Top K Results
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={selectedNode.data.config.topK || 5}
              onChange={(e) => updateNodeData(selectedNode.id, {
                config: { ...selectedNode.data.config, topK: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Documents
              </label>
              <button
                onClick={loadDocuments}
                className="p-1 hover:bg-gray-100 rounded"
                disabled={loadingDocs}
              >
                <RefreshCw className={`w-4 h-4 text-gray-500 ${loadingDocs ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Upload Button */}
            <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-indigo-500 transition-colors mb-3">
              <Upload className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {uploading ? 'Uploading...' : 'Upload PDF'}
              </span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {/* Document List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`
                    flex items-center justify-between p-2 rounded border
                    ${selectedNode.data.config.documents?.includes(doc.id)
                      ? 'bg-indigo-50 border-indigo-300'
                      : 'bg-gray-50 border-gray-200'
                    }
                  `}
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={selectedNode.data.config.documents?.includes(doc.id) || false}
                      onChange={() => toggleDocumentSelection(doc.id)}
                      className="rounded text-indigo-600"
                    />
                    <span className="text-sm truncate" title={doc.originalFilename}>
                      {doc.originalFilename}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      doc.status === 'ready' ? 'bg-green-100 text-green-700' :
                      doc.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                      doc.status === 'error' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {doc.status}
                    </span>
                  </label>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              ))}
              {documents.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  No documents uploaded
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LLM Engine Config */}
      {selectedNode.data.type === 'llmEngine' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={selectedNode.data.label}
              onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider
            </label>
            <select
              value={selectedNode.data.config.provider || 'openai'}
              onChange={(e) => updateNodeData(selectedNode.id, {
                config: { ...selectedNode.data.config, provider: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="openai">OpenAI</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              value={selectedNode.data.config.model || 'gpt-4o-mini'}
              onChange={(e) => updateNodeData(selectedNode.id, {
                config: { ...selectedNode.data.config, model: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {selectedNode.data.config.provider === 'gemini' ? (
                <>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </>
              ) : (
                <>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System Prompt
            </label>
            <textarea
              value={selectedNode.data.config.systemPrompt || ''}
              onChange={(e) => updateNodeData(selectedNode.id, {
                config: { ...selectedNode.data.config, systemPrompt: e.target.value }
              })}
              placeholder="Enter a system prompt to guide the AI's behavior..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature: {selectedNode.data.config.temperature || 0.7}
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={selectedNode.data.config.temperature || 0.7}
              onChange={(e) => updateNodeData(selectedNode.id, {
                config: { ...selectedNode.data.config, temperature: parseFloat(e.target.value) }
              })}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="useWebSearch"
              checked={selectedNode.data.config.useWebSearch || false}
              onChange={(e) => updateNodeData(selectedNode.id, {
                config: { ...selectedNode.data.config, useWebSearch: e.target.checked }
              })}
              className="rounded text-indigo-600"
            />
            <label htmlFor="useWebSearch" className="text-sm font-medium text-gray-700">
              Enable Web Search
            </label>
          </div>

          {selectedNode.data.config.useWebSearch && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Provider
              </label>
              <select
                value={selectedNode.data.config.webSearchProvider || 'serpapi'}
                onChange={(e) => updateNodeData(selectedNode.id, {
                  config: { ...selectedNode.data.config, webSearchProvider: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="serpapi">SerpAPI</option>
                <option value="brave">Brave Search</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Output Config */}
      {selectedNode.data.type === 'output' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            This component displays the final response from your workflow in a chat interface.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={selectedNode.data.label}
              onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPanel;
