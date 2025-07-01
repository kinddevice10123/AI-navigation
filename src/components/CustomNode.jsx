import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Move, RotateCw, Clock, GitBranch } from 'lucide-react';

// Icon mapping for block types
const iconMap = {
  move: Move,
  turn: RotateCw,
  wait: Clock,
  condition: GitBranch,
};

const CustomNode = ({ data, selected }) => {
  const IconComponent = iconMap[data.blockType] || Move;

  return (
    <div 
      className={`custom-node ${selected ? 'selected' : ''}`}
      style={{ '--node-color': data.color }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="node-handle"
        style={{
          background: data.color,
          border: '2px solid white',
          width: '12px',
          height: '12px',
          top: '-6px'
        }}
      />
      
      <div className="node-header">
        <div className="node-icon">
          <IconComponent size={16} />
        </div>
        <div className="node-label">{data.label}</div>
      </div>
      
      <div className="node-parameters">
        {Object.entries(data.parameters || {}).map(([key, value]) => (
          <div key={key} className="parameter">
            <span className="parameter-key">{key}:</span>
            <span className="parameter-value">{value}</span>
          </div>
        ))}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="node-handle"
        style={{
          background: data.color,
          border: '2px solid white',
          width: '12px',
          height: '12px',
          bottom: '-6px'
        }}
      />
    </div>
  );
};

export default memo(CustomNode);