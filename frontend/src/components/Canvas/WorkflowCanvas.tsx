import React, { useCallback, useRef, useState } from 'react';
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

const WorkflowCanvas: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
    addNode,
  } = useWorkflowStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) {
        console.log('No wrapper or instance');
        return;
      }

      const type = event.dataTransfer.getData('application/reactflow');
      console.log('Dropped type:', type);

      if (!type) {
        console.log('No type found in dataTransfer');
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      console.log('Adding node at position:', position);
      addNode(type, position);
    },
    [reactFlowInstance, addNode]
  );

  return (
    <div
      ref={reactFlowWrapper}
      className="flex-1 h-full"
      style={{ width: '100%', height: '100%' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={() => selectNode(null)}
        onNodeClick={(_, node) => selectNode(node)}
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

const WorkflowCanvasWrapper: React.FC = () => (
  <ReactFlowProvider>
    <WorkflowCanvas />
  </ReactFlowProvider>
);

export default WorkflowCanvasWrapper;
