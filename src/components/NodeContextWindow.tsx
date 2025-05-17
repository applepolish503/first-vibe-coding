import React, { useEffect, useRef, useState } from 'react';
import { theme } from '../styles/theme';
import type { FlowNodeType } from '../types/NodeType';
import { physicalNodeTypes } from '../constants/physicalNodeTypes';

interface NodeContextWindowProps {
  node: FlowNodeType;
  position: { x: number; y: number };
  onClose: () => void;
  assignedNodes?: string[];
  onAssignNode?: (nodeId: string) => void;
  onUnassignNode?: (nodeId: string) => void;
}

const NodeContextWindow: React.FC<NodeContextWindowProps> = ({ 
  node, 
  position, 
  onClose,
  assignedNodes = [],
  onAssignNode,
  onUnassignNode
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const [selectedTab, setSelectedTab] = useState<'info' | 'assign'>('info');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (windowRef.current && !windowRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const allowedPhysicalNodes = physicalNodeTypes.filter(
    pNode => node.allowedPhysicalTypes?.includes(pNode.id)
  );

  return (
    <div
      ref={windowRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        backgroundColor: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.secondary}`,
        borderRadius: theme.common.borderRadius.lg,
        padding: '20px',
        minWidth: '300px',
        maxWidth: '400px',
        boxShadow: theme.common.shadow.lg,
        zIndex: 1000,
        color: theme.colors.text.primary,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '0 0 15px 0',
        borderBottom: `1px solid ${theme.colors.border.primary}`,
      }}>
        <img
          src={node.icon}
          alt={node.label}
          style={{
            width: '32px',
            height: '32px',
            marginRight: '12px',
          }}
        />
        <h3 style={{
          margin: 0,
          color: theme.colors.text.primary,
          fontSize: '1.2em',
          flex: 1,
        }}>
          {node.label}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: theme.colors.text.secondary,
            cursor: 'pointer',
            padding: '4px',
            borderRadius: theme.common.borderRadius.sm,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.colors.text.primary;
            e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.colors.text.secondary;
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ✕
        </button>
      </div>

      <div style={{
        marginBottom: '20px',
        color: theme.colors.text.secondary,
        fontSize: '0.9em',
        lineHeight: '1.5',
      }}>
        {node.description}
      </div>

      <div style={{
        backgroundColor: theme.colors.background.tertiary,
        padding: '15px',
        borderRadius: theme.common.borderRadius.md,
        marginBottom: '20px',
      }}>
        <h4 style={{
          margin: '0 0 10px 0',
          color: theme.colors.text.primary,
          fontSize: '1em',
        }}>
          プロパティ
        </h4>
        <div style={{
          display: 'grid',
          gap: '8px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px',
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.common.borderRadius.sm,
          }}>
            <span style={{ color: theme.colors.text.secondary }}>タイプ:</span>
            <span style={{ color: theme.colors.accent.blue }}>{node.id}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px',
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.common.borderRadius.sm,
          }}>
            <span style={{ color: theme.colors.text.secondary }}>カテゴリ:</span>
            <span style={{ color: theme.colors.accent.purple }}>{node.category}</span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
      }}>
        <button
          onClick={onClose}
          style={{
            backgroundColor: theme.colors.background.tertiary,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            padding: '8px 16px',
            borderRadius: theme.common.borderRadius.md,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.background.primary;
            e.currentTarget.style.borderColor = theme.colors.accent.blue;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
            e.currentTarget.style.borderColor = theme.colors.border.primary;
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

export default NodeContextWindow; 