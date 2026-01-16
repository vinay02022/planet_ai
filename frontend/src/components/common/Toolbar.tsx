import React, { useState } from 'react';
import {
  Play,
  MessageCircle,
  Save,
  FolderOpen,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { workflowApi } from '../../services/api';

const Toolbar: React.FC = () => {
  const {
    nodes,
    edges,
    isValid,
    validationErrors,
    setValidation,
    clearCanvas,
    openChat,
    getWorkflowDefinition,
  } = useWorkflowStore();

  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');

  const handleValidate = async () => {
    if (nodes.length === 0) {
      setValidation({
        valid: false,
        errors: [{ code: 'EMPTY_WORKFLOW', message: 'Add at least one component to the workflow' }],
      });
      return;
    }

    setIsValidating(true);
    try {
      const workflow = getWorkflowDefinition();
      const result = await workflowApi.validate(workflow);
      setValidation(result);

      if (result.valid) {
        alert('Workflow is valid! You can now chat with your workflow.');
      }
    } catch (error: any) {
      setValidation({
        valid: false,
        errors: [{ code: 'VALIDATION_ERROR', message: error.message || 'Failed to validate workflow' }],
      });
    }
    setIsValidating(false);
  };

  const handleSave = async () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    setIsSaving(true);
    try {
      const workflow = getWorkflowDefinition();
      await workflowApi.save(workflowName, workflowDescription, workflow);
      alert('Workflow saved successfully!');
      setShowSaveModal(false);
      setWorkflowName('');
      setWorkflowDescription('');
    } catch (error: any) {
      alert(`Failed to save workflow: ${error.message}`);
    }
    setIsSaving(false);
  };

  const handleChatClick = async () => {
    // Validate before opening chat
    if (nodes.length === 0) {
      alert('Add at least one component to the workflow before chatting.');
      return;
    }

    setIsValidating(true);
    try {
      const workflow = getWorkflowDefinition();
      const result = await workflowApi.validate(workflow);
      setValidation(result);

      if (result.valid) {
        openChat();
      } else {
        alert('Please fix the workflow errors before chatting:\n' +
          result.errors.map(e => `- ${e.message}`).join('\n'));
      }
    } catch (error: any) {
      alert(`Validation failed: ${error.message}`);
    }
    setIsValidating(false);
  };

  return (
    <>
      <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">Workflow Builder</h1>

          {/* Validation Status */}
          {nodes.length > 0 && (
            <div className="flex items-center gap-2">
              {isValid ? (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Valid
                </span>
              ) : validationErrors.length > 0 ? (
                <span className="flex items-center gap-1 text-red-600 text-sm" title={validationErrors.map(e => e.message).join(', ')}>
                  <XCircle className="w-4 h-4" />
                  {validationErrors.length} error(s)
                </span>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Build Stack Button */}
          <button
            onClick={handleValidate}
            disabled={isValidating || nodes.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isValidating || nodes.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            {isValidating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Build Stack
          </button>

          {/* Chat with Stack Button */}
          <button
            onClick={handleChatClick}
            disabled={isValidating || nodes.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isValidating || nodes.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Chat with Stack
          </button>

          {/* Save Button */}
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={nodes.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              nodes.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Save className="w-4 h-4" />
            Save
          </button>

          {/* Clear Button */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear the canvas?')) {
                clearCanvas();
              }
            }}
            disabled={nodes.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              nodes.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Save Workflow</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Workflow Name *
                </label>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Enter workflow name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Enter description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setWorkflowName('');
                  setWorkflowDescription('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !workflowName.trim()}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isSaving || !workflowName.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Toolbar;
