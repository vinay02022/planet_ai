import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { workflowApi } from '../../services/api';
import { v4 as uuidv4 } from 'uuid';

const ChatModal: React.FC = () => {
  const {
    isChatOpen,
    closeChat,
    chatMessages,
    addChatMessage,
    clearChat,
    isExecuting,
    setExecuting,
    getWorkflowDefinition,
    isValid,
    validationErrors,
  } = useWorkflowStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || isExecuting) return;

    const userMessage = {
      id: uuidv4(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date(),
    };

    addChatMessage(userMessage);
    setInput('');
    setExecuting(true);

    try {
      const workflow = getWorkflowDefinition();
      const response = await workflowApi.execute(workflow, userMessage.content);

      if (response.success && response.response) {
        addChatMessage({
          id: uuidv4(),
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
          metadata: {
            steps: response.steps,
            durationMs: response.totalDurationMs,
          },
        });
      } else {
        addChatMessage({
          id: uuidv4(),
          role: 'assistant',
          content: `Error: ${response.error || 'Failed to execute workflow'}`,
          timestamp: new Date(),
        });
      }
    } catch (error: any) {
      addChatMessage({
        id: uuidv4(),
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to execute workflow'}`,
        timestamp: new Date(),
      });
    }

    setExecuting(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isChatOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Chat with Workflow</h2>
            <p className="text-sm text-gray-500">
              Ask questions and get responses from your workflow
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-500"
              title="Clear chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={closeChat}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Validation Warning */}
        {!isValid && validationErrors.length > 0 && (
          <div className="mx-6 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800">Workflow has issues:</p>
            <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <p className="text-lg mb-2">No messages yet</p>
                <p className="text-sm">Start by asking a question below</p>
              </div>
            </div>
          ) : (
            chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.metadata?.durationMs && (
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-indigo-200' : 'text-gray-400'
                    }`}>
                      Completed in {message.metadata.durationMs}ms
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
          {isExecuting && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              rows={1}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isExecuting}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isExecuting}
              className={`p-3 rounded-xl transition-colors ${
                input.trim() && !isExecuting
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
