import React, { useEffect, useRef, useState } from 'react';
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
        backgroundColor: 'white',
        border: `2px solid ${node.backgroundColor}`,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 1000,
        minWidth: '320px',
        maxWidth: '400px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ 
          backgroundColor: node.backgroundColor + '20',
          padding: '8px',
          borderRadius: '8px',
          marginRight: '12px'
        }}>
          <img src={node.icon} alt={node.label} style={{ width: '32px', height: '32px' }} />
        </div>
        <h3 style={{ margin: 0, color: node.backgroundColor, fontSize: '1.4em' }}>{node.label}</h3>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '12px',
            top: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            color: '#666',
            padding: '4px',
            borderRadius: '4px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          ✕
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '16px',
        borderBottom: '1px solid #eee',
        paddingBottom: '8px'
      }}>
        <button
          onClick={() => setSelectedTab('info')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            background: selectedTab === 'info' ? node.backgroundColor + '20' : 'transparent',
            color: selectedTab === 'info' ? node.backgroundColor : '#666',
            cursor: 'pointer',
            fontWeight: selectedTab === 'info' ? 'bold' : 'normal',
            transition: 'all 0.2s ease',
          }}
        >
          情報
        </button>
        <button
          onClick={() => setSelectedTab('assign')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            background: selectedTab === 'assign' ? node.backgroundColor + '20' : 'transparent',
            color: selectedTab === 'assign' ? node.backgroundColor : '#666',
            cursor: 'pointer',
            fontWeight: selectedTab === 'assign' ? 'bold' : 'normal',
            transition: 'all 0.2s ease',
          }}
        >
          割り当て管理
        </button>
      </div>
      
      {selectedTab === 'info' ? (
        <>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 12px 0', color: '#444', lineHeight: '1.5' }}>{node.description}</p>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            fontSize: '14px', 
            color: '#666',
            backgroundColor: '#f8f8f8',
            padding: '12px',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%',
                backgroundColor: node.hasInput ? '#4CAF50' : '#ff5252'
              }} />
              入力ポート: {node.hasInput ? '有り' : '無し'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%',
                backgroundColor: node.hasOutput ? '#4CAF50' : '#ff5252'
              }} />
              出力ポート: {node.hasOutput ? '有り' : '無し'}
            </div>
          </div>
        </>
      ) : (
        <div>
          <p style={{ margin: '0 0 16px 0', color: '#666' }}>
            このノードに割り当て可能な物理ブロック:
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px'
          }}>
            {allowedPhysicalNodes.map(pNode => {
              const isAssigned = assignedNodes.includes(pNode.id);
              return (
                <div
                  key={pNode.id}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${isAssigned ? pNode.backgroundColor : '#ddd'}`,
                    backgroundColor: isAssigned ? pNode.backgroundColor + '10' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => {
                    if (isAssigned) {
                      onUnassignNode?.(pNode.id);
                    } else {
                      onAssignNode?.(pNode.id);
                    }
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    <img src={pNode.icon} alt={pNode.label} style={{ width: '24px', height: '24px' }} />
                    <span style={{ 
                      color: isAssigned ? pNode.backgroundColor : '#444',
                      fontWeight: isAssigned ? 'bold' : 'normal'
                    }}>
                      {pNode.label}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    marginTop: '4px'
                  }}>
                    {isAssigned ? '割り当て済み' : '未割り当て'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeContextWindow; 