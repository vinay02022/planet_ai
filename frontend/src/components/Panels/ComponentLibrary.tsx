import React from 'react';
import {
  MessageSquare,
  Database,
  Cpu,
  MonitorPlay
} from 'lucide-react';
import { ComponentItem } from '../../types';

const components: ComponentItem[] = [
  {
    type: 'userQuery',
    label: 'User Query',
    description: 'Entry point for user questions',
    icon: 'MessageSquare',
    color: 'blue',
  },
  {
    type: 'knowledgeBase',
    label: 'Knowledge Base',
    description: 'Upload and query documents',
    icon: 'Database',
    color: 'purple',
  },
  {
    type: 'llmEngine',
    label: 'LLM Engine',
    description: 'AI-powered response generation',
    icon: 'Cpu',
    color: 'green',
  },
  {
    type: 'output',
    label: 'Output',
    description: 'Display final response',
    icon: 'MonitorPlay',
    color: 'orange',
  },
];

const iconMap: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare className="w-5 h-5" />,
  Database: <Database className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />,
  MonitorPlay: <MonitorPlay className="w-5 h-5" />,
};

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-300' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-300' },
  green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-300' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-300' },
};

interface ComponentLibraryProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ onDragStart }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Components</h2>
      <p className="text-sm text-gray-500 mb-4">
        Drag components onto the canvas to build your workflow
      </p>

      <div className="space-y-3">
        {components.map((component) => {
          const colors = colorClasses[component.color];

          return (
            <div
              key={component.type}
              className={`
                p-3 rounded-lg border-2 cursor-grab
                ${colors.bg} ${colors.border}
                hover:shadow-md transition-all
                active:cursor-grabbing
              `}
              draggable
              onDragStart={(e) => onDragStart(e, component.type)}
            >
              <div className="flex items-center gap-3">
                <div className={colors.text}>
                  {iconMap[component.icon]}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 text-sm">
                    {component.label}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {component.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComponentLibrary;
