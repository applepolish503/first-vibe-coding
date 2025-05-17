import type { NodeType } from '../types/NodeType';

export const physicalNodeTypes: NodeType[] = [
  {
    id: 'warehouse',
    label: '倉庫',
    backgroundColor: '#4CAF50',
    hasInput: true,
    hasOutput: true,
    icon: '/icons/Warehouse.svg',
    description: '商品を保管する倉庫',
    category: '施設'
  },
  {
    id: 'dock',
    label: 'ドック',
    backgroundColor: '#2196F3',
    hasInput: true,
    hasOutput: true,
    icon: '/icons/Dock.svg',
    description: 'トラックの発着場所',
    category: '施設'
  },
  {
    id: 'sortingArea',
    label: '仕分けエリア',
    backgroundColor: '#FF9800',
    hasInput: true,
    hasOutput: true,
    icon: '/icons/SortingArea.svg',
    description: '商品の仕分けを行うエリア',
    category: 'エリア'
  },
  {
    id: 'storageArea',
    label: '保管エリア',
    backgroundColor: '#9C27B0',
    hasInput: true,
    hasOutput: true,
    icon: '/icons/StorageArea.svg',
    description: '一時的な商品の保管エリア',
    category: 'エリア'
  }
]; 