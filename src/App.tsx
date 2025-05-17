import { ReactFlow, Controls, Background, useNodesState, useEdgesState, addEdge, MiniMap, useReactFlow, ReactFlowProvider, Handle, Position } from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState } from 'react';

const nodeTypes = [
  { id: 'default', label: '基本ノード', backgroundColor: '#fff', hasInput: true, hasOutput: true },
  { id: 'input', label: '入力ノード', backgroundColor: '#6ede87', hasInput: false, hasOutput: true },
  { id: 'output', label: '出力ノード', backgroundColor: '#6865A5', hasInput: true, hasOutput: false },
  { id: 'custom', label: 'カスタムノード', backgroundColor: '#ff0072', hasInput: true, hasOutput: true },
];

interface CustomNodeProps {
  data: { label: string };
  type?: string;
  style?: React.CSSProperties;
}

const CustomNode = ({ data, type = 'default', style }: CustomNodeProps) => {
  const nodeConfig = nodeTypes.find(nt => nt.id === type) || nodeTypes[0];

  return (
    <div style={{
      padding: '10px 20px',
      borderRadius: '5px',
      border: '1px solid #ddd',
      backgroundColor: style?.backgroundColor || nodeConfig.backgroundColor,
      color: nodeConfig.backgroundColor === '#fff' ? '#000' : '#fff',
    }}>
      {nodeConfig.hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#555' }}
        />
      )}
      {data.label}
      {nodeConfig.hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#555' }}
        />
      )}
    </div>
  );
};

const customNodeTypes = {
  default: CustomNode,
  input: CustomNode,
  output: CustomNode,
  custom: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    data: { label: 'ノード 1' },
    type: 'input',
  },
  {
    id: '2',
    position: { x: 100, y: 100 },
    data: { label: 'ノード 2' },
    type: 'default',
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
];

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeType, setSelectedNodeType] = useState(nodeTypes[0]);
  const { screenToFlowPosition } = useReactFlow();

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
      data: { label: `${selectedNodeType.label} ${nodes.length + 1}` },
      type: selectedNodeType.id,
      style: { backgroundColor: selectedNodeType.backgroundColor },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      setNodes((nds) => nds.filter((node) => !node.selected));
      setEdges((eds) => eds.filter((edge) => !edge.selected));
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <div style={{
        width: '200px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #dee2e6'
      }}>
        <h3 style={{ marginBottom: '15px' }}>ノードタイプ</h3>
        {nodeTypes.map((type) => (
          <div
            key={type.id}
            onClick={() => setSelectedNodeType(type)}
            style={{
              padding: '10px',
              marginBottom: '8px',
              backgroundColor: type === selectedNodeType ? type.backgroundColor : '#fff',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              cursor: 'pointer',
              color: type === selectedNodeType ? '#fff' : '#000',
              transition: 'all 0.2s ease'
            }}
          >
            {type.label}
          </div>
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
          onKeyDown={onKeyDown}
          nodeTypes={customNodeTypes}
          fitView
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