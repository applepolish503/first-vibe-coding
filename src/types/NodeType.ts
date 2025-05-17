import type { Node } from '@xyflow/react';

/**
 * ノードタイプの定義インターフェース
 */
export interface FlowNodeType {
  /** ノードの一意識別子 */
  id: string;
  /** ノードの表示名 */
  label: string;
  /** ノードの背景色 */
  backgroundColor: string;
  /** 入力コネクタの有無 */
  hasInput?: boolean;
  /** 出力コネクタの有無 */
  hasOutput?: boolean;
  /** アイコンのパス */
  icon?: string;
  /** ノードの説明 */
  description?: string;
  /** ノードのカテゴリ */
  category: string;
  /** 割り当て可能なPhysicalノードタイプのID配列 */
  allowedPhysicalTypes?: string[];
}

export interface NodeData extends Record<string, unknown> {
  label: string;
  icon?: string;
  isHighlighted?: boolean;
  dimmed?: boolean;
  allowedPhysicalTypes?: string[];
  onNodeHover?: (nodeType: string | null) => void;
}

/**
 * カスタムノードのプロパティ定義
 */
export interface CustomNodeProps {
  data: NodeData;
  type?: string;
}

export interface PhysicalNodeType {
  id: string;
  label: string;
  icon?: string;
  category: string;
  backgroundColor: string;
  hasInput?: boolean;
  hasOutput?: boolean;
  description?: string;
  allowedPhysicalTypes?: string[];
}

export type CustomNode = Node<NodeData>; 