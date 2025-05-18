import React, { useState } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { NodeData } from '../types/NodeType';
import { theme } from '../styles/theme';
import HelpModal from './HelpModal';

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

const buttonBaseStyle = {
  padding: theme.components.button.padding,
  borderRadius: theme.components.button.borderRadius,
  fontSize: theme.components.button.fontSize,
  fontWeight: theme.components.button.fontWeight,
  transition: theme.components.button.transition,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: theme.colors.text.primary,
  border: 'none',
  cursor: 'pointer',
  boxShadow: theme.common.shadow.sm,
};

const Header: React.FC<HeaderProps> = ({
  flowNodes,
  flowEdges,
  physicalNodes,
  physicalEdges,
  nodeRelations,
  onFileUpload,
}) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

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
      padding: '16px',
      background: theme.colors.background.secondary,
      boxShadow: theme.common.shadow.md,
      borderBottom: `1px solid ${theme.colors.border.primary}`,
      borderLeft: `1px solid ${theme.colors.border.primary}`,
      borderBottomLeftRadius: theme.common.borderRadius.lg,
      zIndex: 1000,
      display: 'flex',
      gap: '12px',
    }}>
      <button
        onClick={handleFlowDownload}
        style={{
          ...buttonBaseStyle,
          backgroundColor: theme.colors.accent.blue,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.primary;
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = theme.common.shadow.md;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.accent.blue;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = theme.common.shadow.sm;
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        Save Flow
      </button>
      <button
        onClick={handlePhysicalDownload}
        style={{
          ...buttonBaseStyle,
          backgroundColor: theme.colors.accent.purple,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.secondary;
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = theme.common.shadow.md;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.accent.purple;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = theme.common.shadow.sm;
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        Save Physical
      </button>
      <button
        onClick={handleRelationDownload}
        style={{
          ...buttonBaseStyle,
          backgroundColor: theme.colors.accent.green,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.primary;
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = theme.common.shadow.md;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.accent.green;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = theme.common.shadow.sm;
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        Save Relations
      </button>
      <label
        style={{
          ...buttonBaseStyle,
          backgroundColor: theme.colors.accent.blue,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.secondary;
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = theme.common.shadow.md;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.accent.blue;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = theme.common.shadow.sm;
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        Upload Files
        <input
          type="file"
          multiple
          accept=".flow,.physical,.relation"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </label>

      {/* Help button */}
      <button
        onClick={() => setIsHelpModalOpen(true)}
        style={{
          ...buttonBaseStyle,
          backgroundColor: theme.colors.accent.blue,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.primary;
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = theme.common.shadow.md;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.accent.blue;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = theme.common.shadow.sm;
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-1.5a8.5 8.5 0 100-17 8.5 8.5 0 000 17zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"/>
        </svg>
        Help
      </button>

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};

export default Header; 