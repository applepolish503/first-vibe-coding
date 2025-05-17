import { ReactFlow, Controls, Background, useNodesState, useEdgesState, addEdge, MiniMap, useReactFlow, ReactFlowProvider, Handle, Position } from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/react';
import type { NodeType, CustomNodeProps } from './types/NodeType';
import { nodeTypes } from './constants/nodeTypes';
import NodeContextWindow from './components/NodeContextWindow';
import '@xyflow/react/dist/style.css';
import { useState, useEffect, useCallback } from 'react';

interface NodeCategoryProps {
  category: string;
  nodes: NodeType[];
  selectedNodeType: NodeType;
  onSelectNodeType: (nodeType: NodeType) => void;
}

const CustomNode = ({ data, type = 'default' }: CustomNodeProps) => {
  const nodeConfig = nodeTypes.find(nt => nt.id === type) || nodeTypes[0];

  return (
    <div style={{
      position: 'relative',
      width: '128px',
      height: '128px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'move',
    }} className="react-flow__node-default">
      {nodeConfig.hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: '#555',
            width: '16px',
            height: '16px',
            left: '-8px',
            zIndex: 100,
          }}
        />
      )}
      <div style={{
        width: '128px',
        height: '128px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {nodeConfig.icon && (
          <img
            src={nodeConfig.icon}
            alt={data.label}
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'contain',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        )}
        <div style={{
          position: 'absolute',
          bottom: '-24px',
          width: '100%',
          textAlign: 'center',
          fontSize: '12px',
          color: '#666',
        }}>
          {data.label}
        </div>
      </div>
      {nodeConfig.hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: '#555',
            width: '16px',
            height: '16px',
            right: '-8px',
            zIndex: 100,
          }}
        />
      )}
    </div>
  );
};

const customNodeTypes = {
  truckSource: CustomNode,
  parking: CustomNode,
  truckBay: CustomNode,
  tmpStorage: CustomNode,
  destinations: CustomNode,
};

const NodeCategory = ({ category, nodes, selectedNodeType, onSelectNodeType }: NodeCategoryProps) => {
  const categoryNodes = nodes.filter(node => node.category === category);
  
  return (
    <div style={{ marginBottom: '30px' }}>
      <h4 style={{ 
        marginBottom: '15px', 
        color: '#666',
        fontSize: '1.2em',
        paddingBottom: '8px',
        borderBottom: '1px solid #dee2e6'
      }}>{category}</h4>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        justifyContent: 'center'
      }}>
        {categoryNodes.map((type) => (
          <div
            key={type.id}
            onClick={() => onSelectNodeType(type)}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: '128px',
              height: '128px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: type === selectedNodeType ? type.backgroundColor : 'transparent',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              border: type === selectedNodeType ? '2px solid ' + type.backgroundColor : '2px solid transparent',
            }}>
              {type.icon && (
                <img
                  src={type.icon}
                  alt={type.label}
                  style={{ width: '128px', height: '128px' }}
                />
              )}
            </div>
            <div style={{
              marginTop: '8px',
              fontSize: '0.9em',
              fontWeight: 'bold',
              color: type === selectedNodeType ? type.backgroundColor : '#666',
              textAlign: 'center',
            }}>
              {type.label}
            </div>
            {/* ホバー時の説明ツールチップ */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '100%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.9em',
              maxWidth: '200px',
              visibility: 'hidden',
              opacity: 0,
              transition: 'all 0.2s ease',
              zIndex: 1000,
              pointerEvents: 'none',
              marginLeft: '10px',
            }} className="node-tooltip">
              {type.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: { label: 'Truck Source' },
    type: 'truckSource',
  },
  {
    id: '2',
    position: { x: 300, y: 100 },
    data: { label: 'Parking' },
    type: 'parking',
  },
  {
    id: '3',
    position: { x: 500, y: 100 },
    data: { label: 'Truck Bay' },
    type: 'truckBay',
  },
  {
    id: '4',
    position: { x: 700, y: 100 },
    data: { label: 'Temporary Storage' },
    type: 'tmpStorage',
  },
  {
    id: '5',
    position: { x: 900, y: 100 },
    data: { label: 'Destinations' },
    type: 'destinations',
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e4-5', source: '4', target: '5' },
];

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeType, setSelectedNodeType] = useState(nodeTypes[0]);
  const { screenToFlowPosition } = useReactFlow();
  const [contextWindow, setContextWindow] = useState<{
    node: NodeType;
    position: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .react-flow__node {
        background: none !important;
        border: none !important;
        border-radius: 0 !important;
        padding: 0 !important;
        width: 128px !important;
        height: 128px !important;
      }
      .react-flow__node-default {
        background: none !important;
        border: none !important;
        border-radius: 0 !important;
        padding: 0 !important;
        width: 128px !important;
        height: 128px !important;
      }
      .react-flow__node.selected {
        box-shadow: none !important;
      }
      .react-flow__node:focus {
        outline: none !important;
      }
      .react-flow__handle {
        pointer-events: all !important;
      }
      /* ホバー時のツールチップ表示 */
      *:hover > .node-tooltip {
        visibility: visible !important;
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete') {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setNodes, setEdges]);

  const onConnect = (params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  };

  const onPaneClick = (event: React.MouseEvent) => {
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode: Node = {
      id: `${nodes.length + 1}`,
      position,
      data: { 
        label: `${selectedNodeType.label} ${nodes.length + 1}`,
        icon: selectedNodeType.icon
      },
      type: selectedNodeType.id,
      style: { 
        background: 'none',
        border: 'none',
        padding: 0,
        width: '128px',
        height: '128px',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    const nodeType = nodeTypes.find(type => type.id === node.type);
    if (nodeType) {
      setContextWindow({
        node: nodeType,
        position: {
          x: event.clientX,
          y: event.clientY
        }
      });
    }
  }, []);

  // ユニークなカテゴリのリストを取得
  const categories = Array.from(new Set(nodeTypes.map(node => node.category)));

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <div style={{
        width: '360px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #dee2e6',
        overflowY: 'auto'
      }}>
        <h3 style={{ 
          marginBottom: '25px',
          fontSize: '1.4em',
          color: '#333',
          paddingBottom: '10px',
          borderBottom: '2px solid #dee2e6'
        }}>Blocks</h3>
        {categories.map(category => (
          <NodeCategory
            key={category}
            category={category}
            nodes={nodeTypes}
            selectedNodeType={selectedNodeType}
            onSelectNodeType={setSelectedNodeType}
          />
        ))}
      </div>
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={onPaneClick}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={customNodeTypes}
          fitView
          deleteKeyCode="Delete"
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor="#6865A5"
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
        </ReactFlow>
      </div>

      {contextWindow && (
        <NodeContextWindow
          node={contextWindow.node}
          position={contextWindow.position}
          onClose={() => setContextWindow(null)}
        />
      )}
    </div>
  );
}

function FlowWithProvider() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}

export default FlowWithProvider;