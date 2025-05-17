import { ReactFlow, Controls, Background, useNodesState, useEdgesState, addEdge, MiniMap, ReactFlowProvider, Handle, Position } from '@xyflow/react';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from '@xyflow/react';
import type { NodeType, CustomNodeProps, NodeData } from './types/NodeType';
import { nodeTypes } from './constants/nodeTypes';
import { physicalNodeTypes } from './constants/physicalNodeTypes';
import NodeContextWindow from './components/NodeContextWindow';
import '@xyflow/react/dist/style.css';
import { useState, useEffect, useCallback } from 'react';

interface NodeCategoryProps {
  category: string;
  nodes: NodeType[];
  selectedNodeType: NodeType;
  onSelectNodeType: (nodeType: NodeType) => void;
}

// アニメーションのキーフレームスタイルを定義するコンポーネント
const AnimationStyles = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes rotate-highlight {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .node-highlight-container {
        position: relative;
      }

      .node-highlight-border {
        position: absolute;
        top: 0;
        left: 0;
        width: 128px;
        height: 128px;
        border: 3px dashed #6865A5;
        border-radius: 50%;
        animation: rotate-highlight 10s linear infinite;
        pointer-events: none;
      }

      .node-highlight-glow {
        position: absolute;
        top: 0;
        left: 0;
        width: 128px;
        height: 128px;
        border-radius: 50%;
        box-shadow: 0 0 15px rgba(104, 101, 165, 0.5);
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

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
    }} className="node-highlight-container react-flow__node-default">
      {data.isHighlighted && (
        <>
          <div className="node-highlight-border" />
          <div className="node-highlight-glow" />
        </>
      )}
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
        opacity: data.isHighlighted ? 1 : data.dimmed ? 0.4 : 1,
        transform: data.isHighlighted ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.3s ease',
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
          fontWeight: data.isHighlighted ? 'bold' : 'normal',
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
  warehouse: CustomNode,
  dock: CustomNode,
  sortingArea: CustomNode,
  storageArea: CustomNode,
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

const initialFlowNodes: Node[] = [
  {
    id: 'f1',
    position: { x: 100, y: 100 },
    data: { label: 'Truck Source' },
    type: 'truckSource',
  },
  {
    id: 'f2',
    position: { x: 300, y: 100 },
    data: { label: 'Parking' },
    type: 'parking',
  },
  {
    id: 'f3',
    position: { x: 500, y: 100 },
    data: { label: 'Truck Bay' },
    type: 'truckBay',
  },
  {
    id: 'f4',
    position: { x: 700, y: 100 },
    data: { label: 'Temporary Storage' },
    type: 'tmpStorage',
  },
  {
    id: 'f5',
    position: { x: 900, y: 100 },
    data: { label: 'Destinations' },
    type: 'destinations',
  },
];

const initialFlowEdges: Edge[] = [
  { id: 'e1-2', source: 'f1', target: 'f2' },
  { id: 'e2-3', source: 'f2', target: 'f3' },
  { id: 'e3-4', source: 'f3', target: 'f4' },
  { id: 'e4-5', source: 'f4', target: 'f5' },
];

const initialPhysicalNodes: Node[] = [
  {
    id: 'p1',
    position: { x: 100, y: 50 },
    data: { label: '倉庫' },
    type: 'warehouse',
  },
];

const initialPhysicalEdges: Edge[] = [];

type ViewType = 'flow' | 'physical';

type NodeRelation = {
  flowNodeId: string;
  physicalNodeIds: string[];
};

type NodeAssignmentModalProps = {
  onClose: () => void;
  onAssign: (nodeType: NodeType) => void;
  position: { x: number; y: number };
};

const NodeAssignmentModal: React.FC<NodeAssignmentModalProps> = ({ onClose, onAssign, position }) => {
  const [selectedType, setSelectedType] = useState<NodeType | null>(null);

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        backgroundColor: 'white',
        border: '2px solid #6865A5',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        minWidth: '250px',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '16px' }}>物理ブロックの割り当て</h3>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {physicalNodeTypes.map(type => (
          <div
            key={type.id}
            onClick={() => setSelectedType(type)}
            style={{
              padding: '8px',
              margin: '4px 0',
              border: `2px solid ${selectedType?.id === type.id ? type.backgroundColor : 'transparent'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <img src={type.icon} alt={type.label} style={{ width: '24px', height: '24px' }} />
            <span>{type.label}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: '#f0f0f0',
          }}
        >
          キャンセル
        </button>
        <button
          onClick={() => selectedType && onAssign(selectedType)}
          disabled={!selectedType}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: selectedType ? 'pointer' : 'not-allowed',
            backgroundColor: selectedType ? '#6865A5' : '#ccc',
            color: 'white',
          }}
        >
          割り当て
        </button>
      </div>
    </div>
  );
};

function FlowView({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onPaneClick,
  onNodeDoubleClick,
  isActive,
}: {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;
  onPaneClick: (event: React.MouseEvent) => void;
  onNodeDoubleClick: (event: React.MouseEvent, node: Node) => void;
  isActive: boolean;
}) {
  return (
    <ReactFlowProvider>
      <div 
        style={{ 
          height: '50vh',
          borderBottom: '1px solid #dee2e6',
          position: 'relative',
          backgroundColor: isActive ? '#f8f9fa' : '#fff',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          padding: '4px 8px',
          backgroundColor: isActive ? '#6865A5' : '#ccc',
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 5,
        }}>
          Flow View
        </div>
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
          <MiniMap nodeColor="#6865A5" nodeStrokeWidth={3} zoomable pannable />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}

function PhysicalView({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onPaneClick,
  onNodeDoubleClick,
  isActive,
}: {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;
  onPaneClick: (event: React.MouseEvent) => void;
  onNodeDoubleClick: (event: React.MouseEvent, node: Node) => void;
  isActive: boolean;
}) {
  return (
    <ReactFlowProvider>
      <div 
        style={{ 
          height: '50vh',
          position: 'relative',
          backgroundColor: isActive ? '#f8f9fa' : '#fff',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          padding: '4px 8px',
          backgroundColor: isActive ? '#6865A5' : '#ccc',
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 5,
        }}>
          Physical View
        </div>
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
          <MiniMap nodeColor="#6865A5" nodeStrokeWidth={3} zoomable pannable />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}

function Flow() {
  const [flowNodes, setFlowNodes, onFlowNodesChange] = useNodesState(initialFlowNodes);
  const [flowEdges, setFlowEdges, onFlowEdgesChange] = useEdgesState(initialFlowEdges);
  const [physicalNodes, setPhysicalNodes, onPhysicalNodesChange] = useNodesState(initialPhysicalNodes);
  const [physicalEdges, setPhysicalEdges, onPhysicalEdgesChange] = useEdgesState(initialPhysicalEdges);
  
  const [selectedFlowNodeType, setSelectedFlowNodeType] = useState(nodeTypes[0]);
  const [selectedPhysicalNodeType, setSelectedPhysicalNodeType] = useState(physicalNodeTypes[0]);
  const [activeView, setActiveView] = useState<ViewType>('flow');
  const [contextWindow, setContextWindow] = useState<{
    node: NodeType;
    position: { x: number; y: number };
  } | null>(null);

  // 関係性の管理
  const [nodeRelations, setNodeRelations] = useState<NodeRelation[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<{
    flowNodeId: string | null;
    physicalNodeIds: string[];
  }>({
    flowNodeId: null,
    physicalNodeIds: [],
  });
  const [showAssignmentModal, setShowAssignmentModal] = useState<{
    flowNodeId: string;
    position: { x: number; y: number };
  } | null>(null);

  // ノードスタイルの更新
  const getNodeStyle = useCallback((nodeId: string, isFlow: boolean) => {
    const isHighlighted = isFlow
      ? nodeId === highlightedNodes.flowNodeId
      : highlightedNodes.physicalNodeIds.includes(nodeId);

    return {
      background: 'none',
      border: 'none',
      padding: 0,
      width: '128px',
      height: '128px',
    };
  }, [highlightedNodes]);

  // ノードの更新を処理
  useEffect(() => {
    setFlowNodes(nodes =>
      nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          isHighlighted: node.id === highlightedNodes.flowNodeId,
          dimmed: highlightedNodes.flowNodeId !== null && node.id !== highlightedNodes.flowNodeId,
        },
        style: getNodeStyle(node.id, true),
      }))
    );

    setPhysicalNodes(nodes =>
      nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          isHighlighted: highlightedNodes.physicalNodeIds.includes(node.id),
          dimmed: highlightedNodes.flowNodeId !== null && !highlightedNodes.physicalNodeIds.includes(node.id),
        },
        style: getNodeStyle(node.id, false),
      }))
    );
  }, [highlightedNodes, getNodeStyle, setFlowNodes, setPhysicalNodes]);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    
    if (node.type && nodeTypes.find(type => type.id === node.type)) {
      // Flow Viewのノードがダブルクリックされた場合
      const relation = nodeRelations.find(rel => rel.flowNodeId === node.id);
      
      if (relation) {
        // 既に関係性が存在する場合、ハイライトを表示
        setHighlightedNodes({
          flowNodeId: node.id,
          physicalNodeIds: relation.physicalNodeIds,
        });
      } else {
        // 関係性が存在しない場合、割り当てモーダルを表示
        setShowAssignmentModal({
          flowNodeId: node.id,
          position: {
            x: event.clientX,
            y: event.clientY,
          },
        });
      }
    }
  }, [nodeRelations]);

  const onConnect = useCallback((params: Connection, viewType: ViewType) => {
    if (viewType === 'flow') {
      setFlowEdges((eds) => addEdge(params, eds));
    } else {
      setPhysicalEdges((eds) => addEdge(params, eds));
    }
  }, [setFlowEdges, setPhysicalEdges]);

  const onPaneClick = useCallback((event: React.MouseEvent, viewType: ViewType) => {
    const selectedType = viewType === 'flow' ? selectedFlowNodeType : selectedPhysicalNodeType;
    const newNode: Node = {
      id: viewType === 'flow' ? `f${flowNodes.length + 1}` : `p${physicalNodes.length + 1}`,
      position: {
        x: event.clientX - event.currentTarget.getBoundingClientRect().left,
        y: event.clientY - event.currentTarget.getBoundingClientRect().top,
      },
      data: { 
        label: `${selectedType.label}`,
        icon: selectedType.icon
      },
      type: selectedType.id,
      style: getNodeStyle(
        viewType === 'flow' ? `f${flowNodes.length + 1}` : `p${physicalNodes.length + 1}`,
        viewType === 'flow'
      ),
    };

    if (viewType === 'flow') {
      setFlowNodes((nds) => [...nds, newNode]);
    } else {
      setPhysicalNodes((nds) => [...nds, newNode]);
    }
  }, [flowNodes.length, physicalNodes.length, selectedFlowNodeType, selectedPhysicalNodeType, setFlowNodes, setPhysicalNodes, getNodeStyle]);

  // クリックイベントでハイライトをクリア
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isModalClick = target.closest('[role="dialog"]') || target.closest('[data-type="assignment-modal"]');
      
      if (!isModalClick) {
        setHighlightedNodes({ flowNodeId: null, physicalNodeIds: [] });
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // 割り当てモーダルでの選択を処理
  const handleAssignment = useCallback((nodeType: NodeType) => {
    if (!showAssignmentModal) return;

    const newPhysicalNode: Node = {
      id: `p${physicalNodes.length + 1}`,
      position: {
        x: Math.random() * 500 + 100,
        y: Math.random() * 200 + 100,
      },
      data: { 
        label: nodeType.label,
        icon: nodeType.icon
      },
      type: nodeType.id,
      style: getNodeStyle(`p${physicalNodes.length + 1}`, false),
    };

    setPhysicalNodes(nodes => [...nodes, newPhysicalNode]);
    setNodeRelations(relations => [
      ...relations,
      {
        flowNodeId: showAssignmentModal.flowNodeId,
        physicalNodeIds: [newPhysicalNode.id],
      },
    ]);
    setHighlightedNodes({
      flowNodeId: showAssignmentModal.flowNodeId,
      physicalNodeIds: [newPhysicalNode.id],
    });
    setShowAssignmentModal(null);
  }, [showAssignmentModal, physicalNodes.length, getNodeStyle, setPhysicalNodes]);

  // アクティブなビューに応じてノードタイプを切り替え
  const currentNodeTypes = activeView === 'flow' ? nodeTypes : physicalNodeTypes;
  const selectedNodeType = activeView === 'flow' ? selectedFlowNodeType : selectedPhysicalNodeType;
  const setSelectedNodeType = activeView === 'flow' ? setSelectedFlowNodeType : setSelectedPhysicalNodeType;
  const categories = Array.from(new Set(currentNodeTypes.map(node => node.category)));

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <AnimationStyles />
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
        }}>{activeView === 'flow' ? 'Flow View Blocks' : 'Physical View Blocks'}</h3>
        {categories.map(category => (
          <NodeCategory
            key={category}
            category={category}
            nodes={currentNodeTypes}
            selectedNodeType={selectedNodeType}
            onSelectNodeType={setSelectedNodeType}
          />
        ))}
      </div>
      <div 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        <div onClick={() => setActiveView('flow')}>
          <FlowView
            nodes={flowNodes}
            edges={flowEdges}
            onNodesChange={onFlowNodesChange}
            onEdgesChange={onFlowEdgesChange}
            onConnect={(params) => onConnect(params, 'flow')}
            onPaneClick={(event) => onPaneClick(event, 'flow')}
            onNodeDoubleClick={onNodeDoubleClick}
            isActive={activeView === 'flow'}
          />
        </div>
        <div onClick={() => setActiveView('physical')}>
          <PhysicalView
            nodes={physicalNodes}
            edges={physicalEdges}
            onNodesChange={onPhysicalNodesChange}
            onEdgesChange={onPhysicalEdgesChange}
            onConnect={(params) => onConnect(params, 'physical')}
            onPaneClick={(event) => onPaneClick(event, 'physical')}
            onNodeDoubleClick={onNodeDoubleClick}
            isActive={activeView === 'physical'}
          />
        </div>
      </div>

      {contextWindow && (
        <NodeContextWindow
          node={contextWindow.node}
          position={contextWindow.position}
          onClose={() => setContextWindow(null)}
        />
      )}

      {showAssignmentModal && (
        <NodeAssignmentModal
          position={showAssignmentModal.position}
          onClose={() => setShowAssignmentModal(null)}
          onAssign={handleAssignment}
        />
      )}
    </div>
  );
}

function FlowWithProvider() {
  return (
    <Flow />
  );
}

export default FlowWithProvider;