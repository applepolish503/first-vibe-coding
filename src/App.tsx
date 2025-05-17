/**
 * ロジスティクスプロセスを視覚的に設計・編集するためのエディタアプリケーション
 * Flow ViewとPhysical Viewの2つのビューを持ち、それぞれのノードを関連付けることができます。
 */

import { ReactFlow, Controls, Background, useNodesState, useEdgesState, addEdge, MiniMap, ReactFlowProvider, Handle, Position, applyNodeChanges } from '@xyflow/react';
import type { Node, Edge, Connection, NodeChange, EdgeChange, OnNodesChange } from '@xyflow/react';
import type { FlowNodeType, CustomNodeProps, NodeData } from './types/NodeType';
import { flowNodeTypes } from './constants/nodeTypes';
import { physicalNodeTypes } from './constants/physicalNodeTypes';
import NodeContextWindow from './components/NodeContextWindow';
import '@xyflow/react/dist/style.css';
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * ノードカテゴリのプロパティ定義
 */
interface NodeCategoryProps {
  category: string;
  nodes: FlowNodeType[];
  selectedNodeType: FlowNodeType;
  onSelectNodeType: (nodeType: FlowNodeType) => void;
}

/**
 * アニメーションのキーフレームスタイルを定義するコンポーネント
 * ノードのハイライト効果に使用されます
 */
const AnimationStyles = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes highlight-glow {
        0% { opacity: 0.3; }
        50% { opacity: 0.5; }
        100% { opacity: 0.3; }
      }

      .node-highlight-container {
        position: relative;
      }

      .node-highlight-background {
        position: absolute;
        top: -8px;
        left: -8px;
        width: calc(100% + 16px);
        height: calc(100% + 16px);
        background-color: #FFE082;
        border-radius: 16px;
        opacity: 0.3;
        animation: highlight-glow 2s ease-in-out infinite;
        pointer-events: none;
        z-index: -1;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

/**
 * カスタムノードコンポーネント
 * Flow ViewとPhysical Viewの両方で使用される共通のノード表示コンポーネント
 */
const CustomNode = ({ data, type = 'default' }: CustomNodeProps) => {
  // Flow ViewとPhysical Viewのノードタイプを結合して、現在のノードの設定を取得
  const nodeConfig = [...flowNodeTypes, ...physicalNodeTypes].find(nt => nt.id === type) || flowNodeTypes[0];

  // ホバー時のハイライト処理
  const handleMouseEnter = useCallback(() => {
    if (data.onNodeHover) {
      data.onNodeHover(type);
    }
  }, [data.onNodeHover, type]);

  const handleMouseLeave = useCallback(() => {
    if (data.onNodeHover) {
      data.onNodeHover(null);
    }
  }, [data.onNodeHover]);

  return (
    <div 
      style={{
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
      }} 
      className="node-highlight-container react-flow__node-default"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ハイライト表示用の背景 */}
      {data.isHighlighted && (
        <div className="node-highlight-background" />
      )}
      
      {/* 入力コネクタ */}
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

      {/* ノードの本体部分 */}
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
        {/* ノードのアイコン */}
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
        
        {/* ノードのラベル */}
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

      {/* 出力コネクタ */}
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

/**
 * 利用可能なノードタイプの定義
 * 各ノードタイプに対してCustomNodeコンポーネントを使用
 */
const customNodeTypes = {
  truckSource: CustomNode,
  parking: CustomNode,
  truckBay: CustomNode,
  tmpStorage: CustomNode,
  destinations: CustomNode,
  warehouse: CustomNode,
  carStop: CustomNode,
  pallet: CustomNode,
  storageArea: CustomNode,
};

/**
 * ノードカテゴリコンポーネント
 * サイドバーに表示されるノードタイプの一覧を管理
 */
const NodeCategory = ({ category, nodes, selectedNodeType, onSelectNodeType }: NodeCategoryProps) => {
  // 指定されたカテゴリに属するノードをフィルタリング
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
            {/* ノードタイプの表示 */}
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

/**
 * Flow Viewの初期ノード設定
 */
const initialFlowNodes: Node<NodeData>[] = [
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

/**
 * Flow Viewの初期エッジ設定
 */
const initialFlowEdges: Edge[] = [
  { id: 'e1-2', source: 'f1', target: 'f2' },
  { id: 'e2-3', source: 'f2', target: 'f3' },
  { id: 'e3-4', source: 'f3', target: 'f4' },
  { id: 'e4-5', source: 'f4', target: 'f5' },
];

/**
 * Physical Viewの初期ノード設定
 */
const initialPhysicalNodes: Node<NodeData>[] = [
  {
    id: 'p1',
    position: { x: 100, y: 50 },
    data: { label: 'Warehouse' },
    type: 'warehouse',
  },
];

/**
 * Physical Viewの初期エッジ設定
 */
const initialPhysicalEdges: Edge[] = [];

// ビューの種類を定義
type ViewType = 'flow' | 'physical';

// ノード間の関係性を定義
type NodeRelation = {
  flowNodeId: string;
  physicalNodeIds: string[];
};

/**
 * ノード割り当てモーダルのプロパティ定義
 */
type NodeAssignmentModalProps = {
  onClose: () => void;
  onAssign: (nodeType: FlowNodeType) => void;
  onRemove: (physicalNodeId: string) => void;
  position: { x: number; y: number };
  existingAssignments: string[];
  flowNodeId: string;
  physicalNodes: Node[];
};

/**
 * ノード割り当てモーダルコンポーネント
 * Flow ViewのノードにPhysical Viewのノードを割り当てるためのモーダル
 */
const NodeAssignmentModal: React.FC<NodeAssignmentModalProps> = ({ 
  onClose, 
  onAssign, 
  onRemove,
  position, 
  existingAssignments,
  flowNodeId,
  physicalNodes
}) => {
  const [selectedType, setSelectedType] = useState<FlowNodeType | null>(null);
  const [assignedNodes, setAssignedNodes] = useState<Node<NodeData>[]>([]);

  // 現在のFlowノードの取得
  const currentFlowNode = useCallback(() => {
    const flowNode = initialFlowNodes.find(fn => fn.id === flowNodeId);
    if (!flowNode) return null;

    // ノードタイプの定義を取得
    const nodeTypeInfo = flowNodeTypes.find(nt => nt.id === flowNode.type);
    if (!nodeTypeInfo) return null;

    return {
      ...nodeTypeInfo,
      id: flowNode.id,
      position: flowNode.position,
      data: {
        ...flowNode.data,
        allowedPhysicalTypes: nodeTypeInfo.allowedPhysicalTypes
      }
    };
  }, [flowNodeId])();

  // 選択可能なPhysicalノードタイプのフィルタリング
  const availablePhysicalTypes = physicalNodeTypes.filter(
    type => currentFlowNode?.allowedPhysicalTypes?.includes(type.id)
  );

  // 割り当て済みノードの情報を取得
  useEffect(() => {
    const nodes = existingAssignments
      .map(id => physicalNodes.find((n: Node<NodeData>) => n.id === id))
      .filter((n): n is Node<NodeData> => n !== undefined);
    setAssignedNodes(nodes);
  }, [existingAssignments, physicalNodes]);

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
        minWidth: '300px',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Physical Block Assignment</h3>
      
      {/* 現在のFlowノードタイプの表示 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          fontSize: '14px', 
          color: '#666',
          padding: '8px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <img 
            src={currentFlowNode?.icon} 
            alt={currentFlowNode?.label} 
            style={{ width: '24px', height: '24px' }} 
          />
          <span>{currentFlowNode?.label}</span>
        </div>
      </div>

      {/* 新規割り当て用のノードタイプ選択 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px' }}>New Assignment</h4>
        {availablePhysicalTypes.length > 0 ? (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {availablePhysicalTypes.map(type => (
              <div
                key={type.id}
                style={{
                  padding: '8px',
                  margin: '4px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: selectedType?.id === type.id ? '#f8f9fa' : 'transparent',
                  borderRadius: '4px',
                }}
              >
                <div
                  onClick={() => setSelectedType(type)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <img src={type.icon} alt={type.label} style={{ width: '24px', height: '24px' }} />
                  <span>{type.label}</span>
                </div>
                <button
                  onClick={() => onAssign(type)}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: '#6865A5',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            padding: '12px', 
            textAlign: 'center', 
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}>
            No physical blocks available for assignment
          </div>
        )}
      </div>

      {/* 既存の割り当て一覧 */}
      {assignedNodes.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ marginTop: 0, marginBottom: '8px', fontSize: '14px' }}>Current Assignments</h4>
          <div style={{ 
            maxHeight: '100px', 
            overflowY: 'auto',
            border: '1px solid #eee',
            borderRadius: '4px',
            padding: '8px'
          }}>
            {assignedNodes.map(node => (
              <div
                key={node.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px',
                  marginBottom: '4px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img 
                    src={physicalNodeTypes.find(t => t.id === node.type)?.icon || ''} 
                    alt={node.data?.label || ''} 
                    style={{ width: '20px', height: '20px' }} 
                  />
                  <span>{node.data?.label || ''}</span>
                </div>
                <button
                  onClick={() => onRemove(node.id)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#dc3545',
                    cursor: 'pointer',
                    padding: '4px',
                    fontSize: '12px'
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* モーダルのフッター */}
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
          Close
        </button>
      </div>
    </div>
  );
};

/**
 * Flow Viewコンポーネント
 * プロセスフローを表示・編集するためのビュー
 */
function FlowView({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onPaneClick,
  onNodeDoubleClick,
  isActive,
  onPaneMouseEnter,
}: {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange<NodeData>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;
  onPaneClick: (event: React.MouseEvent) => void;
  onNodeDoubleClick: (event: React.MouseEvent, node: Node<NodeData>) => void;
  isActive: boolean;
  onPaneMouseEnter: () => void;
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
          onPaneMouseEnter={onPaneMouseEnter}
          nodeTypes={customNodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.1 }}
          deleteKeyCode="Delete"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}

/**
 * Physical Viewコンポーネント
 * 物理的なレイアウトを表示・編集するためのビュー
 */
function PhysicalView({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onPaneClick,
  onNodeDoubleClick,
  isActive,
  onPaneMouseEnter,
}: {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange<NodeData>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;
  onPaneClick: (event: React.MouseEvent) => void;
  onNodeDoubleClick: (event: React.MouseEvent, node: Node<NodeData>) => void;
  isActive: boolean;
  onPaneMouseEnter: () => void;
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
          onPaneMouseEnter={onPaneMouseEnter}
          nodeTypes={customNodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.1 }}
          deleteKeyCode="Delete"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}

/**
 * メインのFlowコンポーネント
 * アプリケーション全体の状態管理とロジックを担当
 */
function Flow() {
  // ノードとエッジの状態管理
  const [flowNodes, setFlowNodes, onFlowNodesChange] = useNodesState(initialFlowNodes);
  const [flowEdges, setFlowEdges, onFlowEdgesChange] = useEdgesState(initialFlowEdges);
  const [physicalNodes, setPhysicalNodes, onPhysicalNodesChange] = useNodesState(initialPhysicalNodes);
  const [physicalEdges, setPhysicalEdges, onPhysicalEdgesChange] = useEdgesState(initialPhysicalEdges);
  
  // 前回のノードIDを保持するref
  const prevNodeIdsRef = useRef<string[]>([]);

  // 選択されているノードタイプの状態管理
  const [selectedFlowNodeType, setSelectedFlowNodeType] = useState(flowNodeTypes[0]);
  const [selectedPhysicalNodeType, setSelectedPhysicalNodeType] = useState(physicalNodeTypes[0]);
  const [activeView, setActiveView] = useState<ViewType>('flow');
  const [contextWindow, setContextWindow] = useState<{
    node: FlowNodeType;
    position: { x: number; y: number };
  } | null>(null);

  // ノード間の関係性管理
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

  // flowNodesの変更を監視して、削除されたノードを検出
  useEffect(() => {
    const currentNodeIds = flowNodes.map(node => node.id);
    
    // 削除されたノードを検出
    const deletedNodeIds = prevNodeIdsRef.current.filter(id => !currentNodeIds.includes(id));
    
    // 削除されたノードがある場合、nodeRelationsからも削除
    if (deletedNodeIds.length > 0) {
      setNodeRelations(prevRelations => 
        prevRelations.filter(relation => 
          !deletedNodeIds.includes(relation.flowNodeId)
        )
      );
      // ハイライトもクリア
      setHighlightedNodes({
        flowNodeId: null,
        physicalNodeIds: [],
      });
    }

    // 現在のノードIDを保存
    prevNodeIdsRef.current = currentNodeIds;
  }, [flowNodes]);

  // ホバー時のハイライト処理
  const handleNodeHover = useCallback((nodeId: string | null, isFlow: boolean) => {
    if (!nodeId) {
      requestAnimationFrame(() => {
        setHighlightedNodes({
          flowNodeId: null,
          physicalNodeIds: [],
        });
      });
      return;
    }

    requestAnimationFrame(() => {
      if (isFlow) {
        const relation = nodeRelations.find(rel => rel.flowNodeId === nodeId);
        if (relation) {
          setHighlightedNodes({
            flowNodeId: nodeId,
            physicalNodeIds: relation.physicalNodeIds,
          });
        } else {
          setHighlightedNodes({
            flowNodeId: null,
            physicalNodeIds: [],
          });
        }
      } else {
        const relation = nodeRelations.find(rel => rel.physicalNodeIds.includes(nodeId));
        if (relation) {
          setHighlightedNodes({
            flowNodeId: relation.flowNodeId,
            physicalNodeIds: relation.physicalNodeIds,
          });
        } else {
          setHighlightedNodes({
            flowNodeId: null,
            physicalNodeIds: [],
          });
        }
      }
    });
  }, [nodeRelations]);

  // ノードの更新処理
  useEffect(() => {
    const updateNodes = () => {
      setFlowNodes(nodes =>
        nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            isHighlighted: node.id === highlightedNodes.flowNodeId,
            dimmed: highlightedNodes.flowNodeId !== null && node.id !== highlightedNodes.flowNodeId,
            onNodeHover: (nodeType: string | null) => handleNodeHover(node.id, true),
          },
        }))
      );

      setPhysicalNodes(nodes =>
        nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            isHighlighted: highlightedNodes.physicalNodeIds.includes(node.id),
            dimmed: highlightedNodes.flowNodeId !== null && !highlightedNodes.physicalNodeIds.includes(node.id),
            onNodeHover: (nodeType: string | null) => handleNodeHover(node.id, false),
          },
        }))
      );
    };

    requestAnimationFrame(updateNodes);
  }, [highlightedNodes, handleNodeHover, setFlowNodes, setPhysicalNodes]);

  // ノードのダブルクリック処理
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node<NodeData>) => {
    event.preventDefault();
    
    if (node.type && flowNodeTypes.find(type => type.id === node.type)) {
      // Flow Viewのノードがダブルクリックされた場合
      const relation = nodeRelations.find(rel => rel.flowNodeId === node.id);
      
      setShowAssignmentModal({
        flowNodeId: node.id,
        position: {
          x: event.clientX,
          y: event.clientY,
        },
      });
      
      if (relation) {
        setHighlightedNodes({
          flowNodeId: node.id,
          physicalNodeIds: relation.physicalNodeIds,
        });
      }
    } else if (node.type && physicalNodeTypes.find(type => type.id === node.type)) {
      // Physical Viewのノードがダブルクリックされた場合
      const relation = nodeRelations.find(rel => rel.physicalNodeIds.includes(node.id));
      if (relation) {
        setHighlightedNodes({
          flowNodeId: relation.flowNodeId,
          physicalNodeIds: relation.physicalNodeIds,
        });
      }
    }
  }, [nodeRelations]);

  // エッジの接続処理
  const onConnect = useCallback((params: Connection, viewType: ViewType) => {
    if (viewType === 'flow') {
      setFlowEdges((eds) => addEdge(params, eds));
    } else {
      setPhysicalEdges((eds) => addEdge(params, eds));
    }
  }, [setFlowEdges, setPhysicalEdges]);

  // ペインのクリック処理（新規ノード作成）
  const onPaneClick = useCallback((event: React.MouseEvent, viewType: ViewType) => {
    const selectedType = viewType === 'flow' ? selectedFlowNodeType : selectedPhysicalNodeType;
    
    // 新規ノードの作成
    const newNode: Node<NodeData> = {
      id: viewType === 'flow' ? `f${flowNodes.length + 1}` : `p${physicalNodes.length + 1}`,
      position: {
        x: event.clientX - event.currentTarget.getBoundingClientRect().left,
        y: event.clientY - event.currentTarget.getBoundingClientRect().top,
      },
      data: { 
        label: selectedType.label,
        icon: selectedType.icon,
        allowedPhysicalTypes: viewType === 'flow' ? selectedType.allowedPhysicalTypes : undefined
      },
      type: selectedType.id,
    };

    if (viewType === 'flow') {
      setFlowNodes((nds) => [...nds, newNode]);
    } else {
      setPhysicalNodes((nds) => [...nds, newNode]);
    }

    // 追加
    initialFlowNodes.push(newNode);

  }, [flowNodes.length, physicalNodes.length, selectedFlowNodeType, selectedPhysicalNodeType, setFlowNodes, setPhysicalNodes]);

  // クリックイベントでハイライトをクリア
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isModalClick = target.closest('[role="dialog"]') || target.closest('[data-type="assignment-modal"]');
      const isNodeClick = target.closest('.react-flow__node');
      
      if (!isModalClick && !isNodeClick) {
        requestAnimationFrame(() => {
          setHighlightedNodes({ flowNodeId: null, physicalNodeIds: [] });
        });
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // 割り当てモーダルでの選択を処理
  const handleAssignment = useCallback((nodeType: FlowNodeType) => {
    if (!showAssignmentModal) return;

    // シリアル番号生成
    const getNextSerialNumber = (typeId: string): string => {
      const typeNodes = physicalNodes.filter(n => n.type === typeId);
      const existingNumbers = typeNodes
        .map(n => {
          const match = n.data.label.match(/-(\d{3})$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => !isNaN(n));

      if (existingNumbers.length === 0) {
        return '001';
      }

      const maxNumber = Math.max(...existingNumbers);
      return String(maxNumber + 1).padStart(3, '0');
    };

    const serialNumber = getNextSerialNumber(nodeType.id);
    const nodeLabel = `${nodeType.label}-${serialNumber}`;

    // 新規Physical Nodeの作成
    const newPhysicalNode: Node<NodeData> = {
      id: `p${physicalNodes.length + 1}`,
      position: {
        x: Math.random() * 500 + 100,
        y: Math.random() * 200 + 100,
      },
      data: { 
        label: nodeLabel,
        icon: nodeType.icon
      },
      type: nodeType.id,
    };

    setPhysicalNodes(nodes => [...nodes, newPhysicalNode]);

    // 既存の関係性を確認
    const existingRelation = nodeRelations.find(rel => rel.flowNodeId === showAssignmentModal.flowNodeId);
    
    if (existingRelation) {
      // 既存の関係性に新しいノードを追加
      setNodeRelations(relations =>
        relations.map(rel =>
          rel.flowNodeId === showAssignmentModal.flowNodeId
            ? { ...rel, physicalNodeIds: [...rel.physicalNodeIds, newPhysicalNode.id] }
            : rel
        )
      );
    } else {
      // 新しい関係性を作成
      setNodeRelations(relations => [
        ...relations,
        {
          flowNodeId: showAssignmentModal.flowNodeId,
          physicalNodeIds: [newPhysicalNode.id],
        },
      ]);
    }

    setHighlightedNodes({
      flowNodeId: showAssignmentModal.flowNodeId,
      physicalNodeIds: existingRelation 
        ? [...existingRelation.physicalNodeIds, newPhysicalNode.id]
        : [newPhysicalNode.id],
    });
  }, [showAssignmentModal, physicalNodes, nodeRelations]);

  // 割り当ての削除を処理
  const handleRemoveAssignment = useCallback((physicalNodeId: string) => {
    if (!showAssignmentModal) return;

    setNodeRelations(relations =>
      relations.map(rel =>
        rel.flowNodeId === showAssignmentModal.flowNodeId
          ? { ...rel, physicalNodeIds: rel.physicalNodeIds.filter(id => id !== physicalNodeId) }
          : rel
      ).filter(rel => rel.physicalNodeIds.length > 0)
    );

    setHighlightedNodes(prev => ({
      flowNodeId: prev.flowNodeId,
      physicalNodeIds: prev.physicalNodeIds.filter(id => id !== physicalNodeId),
    }));
  }, [showAssignmentModal]);

  // ペインにマウスが入った時のハイライト消去
  const handlePaneMouseEnter = useCallback(() => {
    requestAnimationFrame(() => {
      setHighlightedNodes({
        flowNodeId: null,
        physicalNodeIds: [],
      });
    });
  }, []);

  // アクティブなビューに応じてノードタイプを切り替え
  const currentNodeTypes = activeView === 'flow' ? flowNodeTypes : physicalNodeTypes;
  const selectedNodeType = activeView === 'flow' ? selectedFlowNodeType : selectedPhysicalNodeType;
  const setSelectedNodeType = activeView === 'flow' ? setSelectedFlowNodeType : setSelectedPhysicalNodeType;
  const categories = Array.from(new Set(currentNodeTypes.map(node => node.category)));

  // ノード削除時のハンドラー
  const handleNodeDelete = useCallback((nodeId: string) => {
    // nodeRelationsから削除されたノードの関係を削除
    setNodeRelations(prevRelations => 
      prevRelations.filter(relation => relation.flowNodeId !== nodeId)
    );
    // ハイライトもクリア
    setHighlightedNodes({
      flowNodeId: null,
      physicalNodeIds: [],
    });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <AnimationStyles />
      {/* サイドバー */}
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
      {/* メインコンテンツ */}
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
            onPaneMouseEnter={handlePaneMouseEnter}
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
            onPaneMouseEnter={handlePaneMouseEnter}
          />
        </div>
      </div>

      {/* コンテキストウィンドウ */}
      {contextWindow && (
        <NodeContextWindow
          node={contextWindow.node}
          position={contextWindow.position}
          onClose={() => setContextWindow(null)}
        />
      )}

      {/* 割り当てモーダル */}
      {showAssignmentModal && (
        <NodeAssignmentModal
          position={showAssignmentModal.position}
          onClose={() => setShowAssignmentModal(null)}
          onAssign={handleAssignment}
          onRemove={handleRemoveAssignment}
          existingAssignments={
            nodeRelations.find(rel => rel.flowNodeId === showAssignmentModal.flowNodeId)?.physicalNodeIds || []
          }
          flowNodeId={showAssignmentModal.flowNodeId}
          physicalNodes={physicalNodes}
        />
      )}
    </div>
  );
}

/**
 * ReactFlowProviderでラップしたメインコンポーネント
 */
function FlowWithProvider() {
  return (
    <Flow />
  );
}

export default FlowWithProvider;