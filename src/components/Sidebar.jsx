import React from 'react';
import { Move, RotateCw, Clock, GitBranch } from 'lucide-react';

// Define the available block types with their properties
const blockTypes = [
  {
    id: 'move',
    label: 'Move',
    icon: Move,
    color: '#3B82F6',
    description: 'Move robot forward/backward'
  },
  {
    id: 'turn',
    label: 'Turn',
    icon: RotateCw,
    color: '#14B8A6',
    description: 'Turn robot left/right'
  },
  {
    id: 'wait',
    label: 'Wait',
    icon: Clock,
    color: '#F97316',
    description: 'Wait for specified time'
  },
  {
    id: 'condition',
    label: 'If/Then',
    icon: GitBranch,
    color: '#8B5CF6',
    description: 'Conditional logic block'
  }
];

const Sidebar = () => {
  // Handle drag start for blocks
  const onDragStart = (event, blockType) => {
    console.log('Drag started for block:', blockType); // Debug log
    
    // Set the drag data
    const blockData = JSON.stringify(blockType);
    event.dataTransfer.setData('application/reactflow', blockData);
    event.dataTransfer.effectAllowed = 'move';
    
    console.log('Drag data set:', blockData); // Debug log
  };

  // Handle drag end
  const onDragEnd = (event) => {
    console.log('Drag ended'); // Debug log
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">Logic Blocks</h3>
        <p className="sidebar-description">Drag blocks to the canvas to build your robot logic</p>
      </div>
      
      <div className="blocks-container">
        {blockTypes.map((block) => {
          const IconComponent = block.icon;
          return (
            <div
              key={block.id}
              className="draggable-block"
              draggable={true}
              onDragStart={(event) => onDragStart(event, block)}
              onDragEnd={onDragEnd}
              style={{ '--block-color': block.color }}
            >
              <div className="block-icon">
                <IconComponent size={20} />
              </div>
              <div className="block-content">
                <div className="block-label">{block.label}</div>
                <div className="block-description">{block.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;