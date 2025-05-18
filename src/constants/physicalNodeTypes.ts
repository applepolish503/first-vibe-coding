import type { FlowNodeType } from '../types/NodeType';

export const physicalNodeTypes: FlowNodeType[] = [
  {
    id: 'warehouse',
    label: 'Warehouse',
    backgroundColor: '#4CAF50',
    hasInput: false,
    hasOutput: false,
    icon: 'icons/Warehouse.svg',
    description: '商品を保管する倉庫',
    category: 'Facility'
  },
  {
    id: 'carStop',
    label: 'Car Stop',
    backgroundColor: '#2196F3',
    hasInput: false,
    hasOutput: false,
    icon: 'icons/CarStop.svg',
    description: 'CarStop',
    category: 'Facility'
  },
  {
    id: 'pallet',
    label: 'Pallet',
    backgroundColor: '#FF9800',
    hasInput: false,
    hasOutput: false,
    icon: 'icons/Pallet.svg',
    description: 'パレット置き場',
    category: 'Facility'
  },
  {
    id: 'gate',
    label: 'Gate',
    backgroundColor: '#673AB7',
    hasInput: false,
    hasOutput: false,
    icon: 'icons/Gate.svg',
    description: '施設の出入口ゲート',
    category: 'Facility'
  }
]; 