import React, { useEffect, useRef } from 'react';
import type { NodeType } from '../types/NodeType';

interface NodeContextWindowProps {
  node: NodeType;
  position: { x: number; y: number };
  onClose: () => void;
}

const NodeContextWindow: React.FC<NodeContextWindowProps> = ({ node, position, onClose }) => {
  const windowRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={windowRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        backgroundColor: 'white',
        border: `2px solid ${node.backgroundColor}`,
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        minWidth: '250px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <img src={node.icon} alt={node.label} style={{ width: '32px', height: '32px', marginRight: '12px' }} />
        <h3 style={{ margin: 0, color: node.backgroundColor }}>{node.label}</h3>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <p style={{ margin: '0 0 8px 0', color: '#666' }}>{node.description}</p>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#888' }}>
        <div>
          入力ポート: {node.hasInput ? '有り' : '無し'}
        </div>
        <div>
          出力ポート: {node.hasOutput ? '有り' : '無し'}
        </div>
      </div>
    </div>
  );
};

export default NodeContextWindow; 