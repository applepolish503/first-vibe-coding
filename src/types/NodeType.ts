/**
 * ノードタイプの定義インターフェース
 */
export interface NodeType {
  /** ノードの一意識別子 */
  id: string;
  /** ノードの表示名 */
  label: string;
  /** ノードの背景色 */
  backgroundColor: string;
  /** 入力コネクタの有無 */
  hasInput: boolean;
  /** 出力コネクタの有無 */
  hasOutput: boolean;
  /** アイコンのパス */
  icon?: string;
  /** ノードの説明 */
  description?: string;
  /** ノードのカテゴリ */
  category: string;
}

/**
 * カスタムノードのプロパティ定義
 */
export interface CustomNodeProps {
  data: {
    label: string;
    icon?: string;
  };
  type?: string;
} 