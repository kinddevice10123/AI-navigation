import React from 'react';
import { Move, RotateCw, Clock, GitBranch } from 'lucide-react';

// Icon mapping for block types
const iconMap = {
  move: Move,
  turn: RotateCw,
  wait: Clock,
  condition: GitBranch,
};

const Timeline = ({ nodes, onReorder }) => {
  // Sort nodes by their Y position to create timeline order
  const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex !== dropIndex) {
      onReorder(dragIndex, dropIndex);
    }
  };

  return (
    <div className="timeline">
      <div className="timeline-header">
        <h3 className="timeline-title">Execution Timeline</h3>
        <p className="timeline-description">
          Drag to reorder • {sortedNodes.length} blocks
        </p>
      </div>
      
      <div className="timeline-container">
        {sortedNodes.length === 0 ? (
          <div className="timeline-empty">
            <p>No blocks added yet. Drag blocks from the sidebar to get started.</p>
          </div>
        ) : (
          <div className="timeline-items">
            {sortedNodes.map((node, index) => {
              const IconComponent = iconMap[node.data.blockType] || Move;
              return (
                <div
                  key={node.id}
                  className="timeline-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  style={{ '--item-color': node.data.color }}
                >
                  <div className="timeline-item-number">{index + 1}</div>
                  <div className="timeline-item-icon">
                    <IconComponent size={16} />
                  </div>
                  <div className="timeline-item-content">
                    <div className="timeline-item-label">{node.data.label}</div>
                    <div className="timeline-item-params">
                      {Object.entries(node.data.parameters || {}).map(([key, value]) => (
                        <span key={key} className="param-chip">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;