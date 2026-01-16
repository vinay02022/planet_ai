import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from '../../types';
import {
  MessageSquare,
  Database,
  Cpu,
  MonitorPlay,
  Trash2
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

const nodeIcons: Record<string, React.ReactNode> = {
  userQuery: <MessageSquare className="w-5 h-5" />,
  knowledgeBase: <Database className="w-5 h-5" />,
  llmEngine: <Cpu className="w-5 h-5" />,
  output: <MonitorPlay className="w-5 h-5" />,
};

const nodeColors: Record<string, { bg: string; border: string; icon: string }> = {
  userQuery: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    icon: 'text-blue-600',
  },
  knowledgeBase: {
    bg: 'bg-purple-50',
    border: 'border-purple-400',
    icon: 'text-purple-600',
  },
  llmEngine: {
    bg: 'bg-green-50',
    border: 'border-green-400',
    icon: 'text-green-600',
  },
  output: {
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    icon: 'text-orange-600',
  },
};

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ id, data, selected }) => {
  const { deleteNode, selectNode } = useWorkflowStore();
  const colors = nodeColors[data.type] || nodeColors.userQuery;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  return (
    <div
      className={`
        relative min-w-[180px] rounded-lg shadow-md border-2 transition-all
        ${colors.bg} ${colors.border}
        ${selected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
        hover:shadow-lg cursor-pointer
      `}
      onClick={() => selectNode({ id, data, position: { x: 0, y: 0 }, type: 'custom' } as any)}
    >
      {/* Input Handle */}
      {data.type !== 'userQuery' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-gray-400 border-2 border-white"
        />
      )}

      {/* Node Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`${colors.icon}`}>
            {nodeIcons[data.type]}
          </div>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <h3 className="font-semibold text-gray-800 text-sm">{data.label}</h3>
        <p className="text-xs text-gray-500 mt-1 capitalize">
          {data.type.replace(/([A-Z])/g, ' $1').trim()}
        </p>

        {/* Config Preview */}
        {data.type === 'llmEngine' && data.config.provider && (
          <div className="mt-2 text-xs bg-white/50 rounded px-2 py-1">
            {data.config.provider} / {data.config.model}
          </div>
        )}
        {data.type === 'knowledgeBase' && data.config.documents && (
          <div className="mt-2 text-xs bg-white/50 rounded px-2 py-1">
            {data.config.documents.length} document(s)
          </div>
        )}
      </div>

      {/* Output Handle */}
      {data.type !== 'output' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-indigo-500 border-2 border-white"
        />
      )}
    </div>
  );
};

export default CustomNode;
