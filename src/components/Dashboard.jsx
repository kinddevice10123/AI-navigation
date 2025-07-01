import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import FlowCanvas from './FlowCanvas';
import Timeline from './Timeline';
import ExportPanel from './ExportPanel';

const Dashboard = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Handle nodes change from flow canvas with debouncing
  const handleNodesChange = useCallback((newNodes) => {
    setNodes(newNodes);
  }, []);

  // Handle edges change from flow canvas with debouncing
  const handleEdgesChange = useCallback((newEdges) => {
    setEdges(newEdges);
  }, []);

  // Handle timeline reordering
  const handleTimelineReorder = useCallback((dragIndex, dropIndex) => {
    const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);
    
    if (dragIndex >= 0 && dropIndex >= 0 && dragIndex < sortedNodes.length && dropIndex < sortedNodes.length) {
      const draggedNode = sortedNodes[dragIndex];
      const targetNode = sortedNodes[dropIndex];
      
      // Update the Y position of the dragged node to match the target position
      const updatedNodes = nodes.map(node => {
        if (node.id === draggedNode.id) {
          return {
            ...node,
            position: {
              ...node.position,
              y: targetNode.position.y + (dragIndex < dropIndex ? 50 : -50)
            }
          };
        }
        return node;
      });
      
      setNodes(updatedNodes);
    }
  }, [nodes]);

  return (
    <div className="dashboard">
      <div className="dashboard-layout">
        {/* Left Sidebar - Draggable Blocks */}
        <div className="dashboard-sidebar">
          <Sidebar />
        </div>
        
        {/* Main Canvas Area */}
        <div className="dashboard-main">
          <FlowCanvas 
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
          />
        </div>
        
        {/* Right Panel - Export & Controls */}
        <div className="dashboard-right">
          <ExportPanel nodes={nodes} edges={edges} />
        </div>
      </div>
      
      {/* Bottom Timeline */}
      <div className="dashboard-bottom">
        <Timeline 
          nodes={nodes} 
          onReorder={handleTimelineReorder}
        />
      </div>
    </div>
  );
};

export default Dashboard;