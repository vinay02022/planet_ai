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
  userQuery: <MessageSquare className="w-4 h-4" />,
  knowledgeBase: <Database className="w-4 h-4" />,
  llmEngine: <Cpu className="w-4 h-4" />,
  output: <MonitorPlay className="w-4 h-4" />,
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
        relative w-[140px] rounded-lg shadow-sm border-2 transition-all
        ${colors.bg} ${colors.border}
        ${selected ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
        hover:shadow-md cursor-pointer
      `}
      onClick={() => selectNode({ id, data, position: { x: 0, y: 0 }, type: 'custom' } as any)}
    >
      {/* Input Handle */}
      {data.type !== 'userQuery' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-2.5 h-2.5 !bg-gray-400 border-2 border-white"
        />
      )}

      {/* Node Content */}
      <div className="p-2">
        <div className="flex items-center justify-between mb-1">
          <div className={`${colors.icon}`}>
            {nodeIcons[data.type]}
          </div>
          <button
            onClick={handleDelete}
            className="p-0.5 hover:bg-red-100 rounded text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
        <h3 className="font-medium text-gray-800 text-xs leading-tight">{data.label}</h3>

        {/* Config Preview */}
        {data.type === 'llmEngine' && data.config.provider && (
          <div className="mt-1 text-[10px] bg-white/60 rounded px-1.5 py-0.5 text-gray-600 truncate">
            {data.config.provider}
          </div>
        )}
        {data.type === 'knowledgeBase' && (
          <div className="mt-1 text-[10px] bg-white/60 rounded px-1.5 py-0.5 text-gray-600">
            {data.config.documents?.length || 0} docs
          </div>
        )}
      </div>

      {/* Output Handle */}
      {data.type !== 'output' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-2.5 h-2.5 !bg-indigo-500 border-2 border-white"
        />
      )}
    </div>
  );
};

export default CustomNode;
