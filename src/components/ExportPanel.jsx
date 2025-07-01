import React, { useState } from 'react';
import { Download, FileJson, FileText, File, CheckCircle, AlertTriangle } from 'lucide-react';
import yaml from 'js-yaml';

const ExportPanel = ({ nodes, edges }) => {
  const [exportStatus, setExportStatus] = useState(null);
  const [errors, setErrors] = useState([]);

  // Validate the flow before export
  const validateFlow = () => {
    const validationErrors = [];
    
    if (nodes.length === 0) {
      validationErrors.push('No blocks added to the flow');
      setErrors(validationErrors);
      return false;
    }
    
    // For single node, no connection validation needed
    if (nodes.length === 1) {
      setErrors([]);
      return true;
    }
    
    // Check for disconnected nodes only when there are multiple nodes
    const connectedNodeIds = new Set();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    
    // A node is considered disconnected if it has no connections AND there are other nodes
    const disconnectedNodes = nodes.filter(node => !connectedNodeIds.has(node.id));
    
    // Only report disconnected nodes if there are edges (meaning some nodes are connected)
    // or if there are multiple nodes but no edges at all
    if (disconnectedNodes.length > 0 && (edges.length > 0 || nodes.length > 1)) {
      // If there are no edges but multiple nodes, all nodes are disconnected
      if (edges.length === 0 && nodes.length > 1) {
        validationErrors.push(`All ${nodes.length} blocks are disconnected. Connect them to create a flow.`);
      } else if (disconnectedNodes.length === nodes.length) {
        // All nodes are disconnected despite having edges (shouldn't happen, but just in case)
        validationErrors.push('All blocks are disconnected from the flow');
      } else {
        // Some nodes are disconnected
        validationErrors.push(`${disconnectedNodes.length} block(s) are disconnected from the main flow`);
      }
    }
    
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  // Convert flow to exportable data structure
  const convertFlowToData = () => {
    return {
      metadata: {
        name: 'SentraCore Robot Logic',
        created: new Date().toISOString(),
        version: '1.0',
        totalBlocks: nodes.length,
        totalConnections: edges.length
      },
      blocks: nodes.map(node => ({
        id: node.id,
        type: node.data.blockType,
        label: node.data.label,
        parameters: node.data.parameters,
        position: node.position
      })),
      connections: edges.map(edge => ({
        from: edge.source,
        to: edge.target,
        type: edge.type || 'default'
      }))
    };
  };

  // Export as JSON
  const exportAsJSON = () => {
    if (!validateFlow()) return;
    
    const data = convertFlowToData();
    const jsonString = JSON.stringify(data, null, 2);
    downloadFile(jsonString, 'sentracore-logic.json', 'application/json');
    setExportStatus('JSON exported successfully!');
  };

  // Export as CSV
  const exportAsCSV = () => {
    if (!validateFlow()) return;
    
    const data = convertFlowToData();
    let csvContent = 'Block ID,Type,Label,Parameters,Position X,Position Y\n';
    
    data.blocks.forEach(block => {
      const params = JSON.stringify(block.parameters).replace(/"/g, '""');
      csvContent += `"${block.id}","${block.type}","${block.label}","${params}",${block.position.x},${block.position.y}\n`;
    });
    
    csvContent += '\n\nConnections\n';
    csvContent += 'From,To,Type\n';
    data.connections.forEach(conn => {
      csvContent += `"${conn.from}","${conn.to}","${conn.type}"\n`;
    });
    
    downloadFile(csvContent, 'sentracore-logic.csv', 'text/csv');
    setExportStatus('CSV exported successfully!');
  };

  // Export as YAML
  const exportAsYAML = () => {
    if (!validateFlow()) return;
    
    const data = convertFlowToData();
    const yamlString = yaml.dump(data, {
      indent: 2,
      lineWidth: 120,
      noCompatMode: true
    });
    
    downloadFile(yamlString, 'sentracore-logic.yaml', 'application/x-yaml');
    setExportStatus('YAML exported successfully!');
  };

  // Utility function to download files
  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setTimeout(() => setExportStatus(null), 3000);
  };

  return (
    <div className="export-panel">
      <div className="export-header">
        <h3 className="export-title">Export Logic</h3>
        <p className="export-description">Download your robot logic in various formats</p>
      </div>

      {errors.length > 0 && (
        <div className="validation-errors">
          <div className="error-header">
            <AlertTriangle size={16} />
            <span>Validation Errors</span>
          </div>
          <ul className="error-list">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {exportStatus && (
        <div className="export-status">
          <CheckCircle size={16} />
          <span>{exportStatus}</span>
        </div>
      )}

      <div className="export-buttons">
        <button 
          className="export-button json"
          onClick={exportAsJSON}
          disabled={nodes.length === 0}
        >
          <FileJson size={18} />
          <span>Export JSON</span>
        </button>
        
        <button 
          className="export-button csv"
          onClick={exportAsCSV}
          disabled={nodes.length === 0}
        >
          <FileText size={18} />
          <span>Export CSV</span>
        </button>
        
        <button 
          className="export-button yaml"
          onClick={exportAsYAML}
          disabled={nodes.length === 0}
        >
          <File size={18} />
          <span>Export YAML</span>
        </button>
      </div>

      <div className="flow-stats">
        <div className="stat">
          <span className="stat-label">Blocks:</span>
          <span className="stat-value">{nodes.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Connections:</span>
          <span className="stat-value">{edges.length}</span>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;