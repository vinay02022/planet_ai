import React, { useCallback } from 'react';
import WorkflowCanvas from './components/Canvas/WorkflowCanvas';
import ComponentLibrary from './components/Panels/ComponentLibrary';
import ConfigPanel from './components/Panels/ConfigPanel';
import Toolbar from './components/common/Toolbar';
import ChatModal from './components/Chat/ChatModal';

function App() {
  const onDragStart = useCallback((event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar */}
      <Toolbar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Component Library Panel */}
        <ComponentLibrary onDragStart={onDragStart} />

        {/* Canvas */}
        <WorkflowCanvas />

        {/* Config Panel */}
        <ConfigPanel />
      </div>

      {/* Chat Modal */}
      <ChatModal />
    </div>
  );
}

export default App;
