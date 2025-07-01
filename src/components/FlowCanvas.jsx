import React, { useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  ConnectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';

// Define custom node types
const nodeTypes = {
  customNode: CustomNode,
};

// Connection line style
const connectionLineStyle = {
  strokeWidth: 2,
  stroke: '#3B82F6',
};

// Default edge options
const defaultEdgeOptions = {
  style: { strokeWidth: 2, stroke: '#3B82F6' },
  type: 'smoothstep',
  markerEnd: {
    type: 'arrowclosed',
    color: '#3B82F6',
  },
};

const FlowCanvasContent = ({ onNodesChange: onNodesChangeCallback, onEdgesChange: onEdgesChangeCallback, nodes, edges }) => {
  const reactFlowWrapper = useRef(null);
  const [nodesState, setNodes, onNodesChange] = useNodesState(nodes);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(edges);
  const { screenToFlowPosition } = useReactFlow();

  // Sync with parent nodes only when they actually change
  useEffect(() => {
    if (JSON.stringify(nodes) !== JSON.stringify(nodesState)) {
      setNodes(nodes);
    }
  }, [nodes, setNodes, nodesState]);

  // Sync with parent edges only when they actually change
  useEffect(() => {
    if (JSON.stringify(edges) !== JSON.stringify(edgesState)) {
      setEdges(edges);
    }
  }, [edges, setEdges, edgesState]);

  // Handle new connections between nodes
  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge({
        ...params,
        ...defaultEdgeOptions,
      }, edgesState);
      setEdges(newEdges);
    },
    [edgesState, setEdges]
  );

  // Handle drag over canvas - CRITICAL for drop to work
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop of new blocks onto canvas
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      console.log('Drop event triggered'); // Debug log

      // Get the dragged data
      const blockDataString = event.dataTransfer.getData('application/reactflow');
      console.log('Block data:', blockDataString); // Debug log
      
      if (!blockDataString) {
        console.log('No block data found');
        return;
      }

      try {
        const block = JSON.parse(blockDataString);
        console.log('Parsed block:', block); // Debug log

        // Get the position where the block was dropped
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        console.log('Drop position:', position); // Debug log

        // Generate unique ID
        const uniqueId = `${block.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const newNode = {
          id: uniqueId,
          type: 'customNode',
          position,
          data: {
            label: block.label,
            blockType: block.id,
            icon: block.icon,
            color: block.color,
            parameters: getDefaultParameters(block.id)
          },
          dragHandle: '.node-header',
        };

        console.log('Creating new node:', newNode); // Debug log

        // Add the new node to the existing nodes
        setNodes((nds) => {
          const updatedNodes = [...nds, newNode];
          console.log('Updated nodes:', updatedNodes); // Debug log
          return updatedNodes;
        });

      } catch (error) {
        console.error('Error parsing dropped block data:', error);
      }
    },
    [screenToFlowPosition, setNodes]
  );

  // Get default parameters for each block type
  const getDefaultParameters = (blockType) => {
    switch (blockType) {
      case 'move':
        return { direction: 'forward', distance: '10cm' };
      case 'turn':
        return { direction: 'left', angle: '90°' };
      case 'wait':
        return { duration: '1s' };
      case 'condition':
        return { condition: 'sensor > 50', action: 'continue' };
      default:
        return {};
    }
  };

  // Debounced update to parent component when nodes change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onNodesChangeCallback(nodesState);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [nodesState, onNodesChangeCallback]);

  // Debounced update to parent component when edges change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onEdgesChangeCallback) {
        onEdgesChangeCallback(edgesState);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [edgesState, onEdgesChangeCallback]);

  // Handle node deletion
  const onNodesDelete = useCallback(
    (deleted) => {
      setNodes((nds) => nds.filter((node) => !deleted.find((d) => d.id === node.id)));
    },
    [setNodes]
  );

  // Handle edge deletion
  const onEdgesDelete = useCallback(
    (deleted) => {
      setEdges((eds) => eds.filter((edge) => !deleted.find((d) => d.id === edge.id)));
    },
    [setEdges]
  );

  return (
    <div className="flow-canvas" ref={reactFlowWrapper}>
      {/* Instructions overlay */}
      <div className="connection-instructions">
        <h4>How to use:</h4>
        <ul>
          <li>Drag blocks from sidebar to canvas</li>
          <li>Connect blocks by dragging from bottom to top handles</li>
          <li>Select and delete with Backspace/Delete</li>
          <li>Use mouse wheel to zoom</li>
        </ul>
      </div>

      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        connectionLineStyle={connectionLineStyle}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        attributionPosition="top-right"
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Meta', 'Ctrl']}
        panOnDrag={true}
        panOnScroll={false}
        zoomOnScroll={true}
        zoomOnPinch={true}
        preventScrolling={true}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
      >
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={true}
          position="top-left"
        />
        <MiniMap 
          nodeStrokeColor={(n) => n.data.color}
          nodeColor={(n) => n.data.color}
          nodeBorderRadius={8}
          position="bottom-right"
        />
        <Background 
          variant="dots" 
          gap={20} 
          size={1}
          color="#94A3B8"
        />
      </ReactFlow>
    </div>
  );
};

const FlowCanvas = (props) => (
  <ReactFlowProvider>
    <FlowCanvasContent {...props} />
  </ReactFlowProvider>
);

export default FlowCanvas;