import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore } from '../../store/workflowStore';
import CustomNode from '../Nodes/CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

interface WorkflowCanvasProps {
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ onDrop, onDragOver }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
  } = useWorkflowStore();

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      onDrop({ ...event, dataTransfer: { ...event.dataTransfer, getData: () => type } } as any);
      useWorkflowStore.getState().addNode(type, position);
    },
    [reactFlowInstance, onDrop]
  );

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={handleDrop}
        onDragOver={onDragOver}
        onPaneClick={() => selectNode(null)}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
        }}
      >
        <Background color="#e5e7eb" gap={15} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.data?.type) {
              case 'userQuery':
                return '#3b82f6';
              case 'knowledgeBase':
                return '#8b5cf6';
              case 'llmEngine':
                return '#22c55e';
              case 'output':
                return '#f97316';
              default:
                return '#6b7280';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
};

const WorkflowCanvasWrapper: React.FC<WorkflowCanvasProps> = (props) => (
  <ReactFlowProvider>
    <WorkflowCanvas {...props} />
  </ReactFlowProvider>
);

export default WorkflowCanvasWrapper;
