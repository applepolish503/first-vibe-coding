import React from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { NodeData } from '../types/NodeType';

interface HeaderProps {
  flowNodes: Node<NodeData>[];
  flowEdges: Edge[];
  physicalNodes: Node<NodeData>[];
  physicalEdges: Edge[];
  nodeRelations: { flowNodeId: string; physicalNodeIds: string[] }[];
  onFileUpload: (data: {
    flow?: { nodes: Node<NodeData>[]; edges: Edge[] };
    physical?: { nodes: Node<NodeData>[]; edges: Edge[] };
    relations?: { flowNodeId: string; physicalNodeIds: string[] }[];
  }) => void;
}

const Header: React.FC<HeaderProps> = ({
  flowNodes,
  flowEdges,
  physicalNodes,
  physicalEdges,
  nodeRelations,
  onFileUpload,
}) => {
  // ダウンロード処理
  const handleDownload = (data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Flow Viewのダウンロード
  const handleFlowDownload = () => {
    handleDownload(
      { nodes: flowNodes, edges: flowEdges },
      'Genba.flow'
    );
  };

  // Physical Viewのダウンロード
  const handlePhysicalDownload = () => {
    handleDownload(
      { nodes: physicalNodes, edges: physicalEdges },
      'Genba.physical'
    );
  };

  // Relationのダウンロード
  const handleRelationDownload = () => {
    handleDownload(nodeRelations, 'Genba.relation');
  };

  // ファイルアップロード処理
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const flowFile = Array.from(files).find(file => file.name.endsWith('.flow'));
    const physicalFile = Array.from(files).find(file => file.name.endsWith('.physical'));
    const relationFile = Array.from(files).find(file => file.name.endsWith('.relation'));

    const uploadData: {
      flow?: { nodes: Node<NodeData>[]; edges: Edge[] };
      physical?: { nodes: Node<NodeData>[]; edges: Edge[] };
      relations?: { flowNodeId: string; physicalNodeIds: string[] }[];
    } = {};

    const fileReadPromises = [];

    if (flowFile) {
      fileReadPromises.push(
        new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              uploadData.flow = JSON.parse(e.target.result as string);
            }
            resolve();
          };
          reader.readAsText(flowFile);
        })
      );
    }

    if (physicalFile) {
      fileReadPromises.push(
        new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              uploadData.physical = JSON.parse(e.target.result as string);
            }
            resolve();
          };
          reader.readAsText(physicalFile);
        })
      );
    }

    if (relationFile) {
      fileReadPromises.push(
        new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              uploadData.relations = JSON.parse(e.target.result as string);
            }
            resolve();
          };
          reader.readAsText(relationFile);
        })
      );
    }

    Promise.all(fileReadPromises).then(() => {
      onFileUpload(uploadData);
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      padding: '10px',
      background: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      zIndex: 1000,
      display: 'flex',
      gap: '10px'
    }}>
      <button
        onClick={handleFlowDownload}
        style={{
          padding: '8px 16px',
          backgroundColor: '#6865A5',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Flow保存
      </button>
      <button
        onClick={handlePhysicalDownload}
        style={{
          padding: '8px 16px',
          backgroundColor: '#6865A5',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Physical保存
      </button>
      <button
        onClick={handleRelationDownload}
        style={{
          padding: '8px 16px',
          backgroundColor: '#6865A5',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Relation保存
      </button>
      <label
        style={{
          padding: '8px 16px',
          backgroundColor: '#6865A5',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ファイルアップロード
        <input
          type="file"
          multiple
          accept=".flow,.physical,.relation"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
};

export default Header; 