import type { FlowNodeType } from '../types/NodeType';

export const physicalNodeTypes: FlowNodeType[] = [
  {
    id: 'warehouse',
    label: 'Warehouse',
    backgroundColor: '#4CAF50',
    hasInput: false,
    hasOutput: false,
    icon: '/icons/Warehouse.svg',
    description: '商品を保管する倉庫',
    category: 'Facility'
  },
  {
    id: 'carStop',
    label: 'Car Stop',
    backgroundColor: '#2196F3',
    hasInput: false,
    hasOutput: false,
    icon: '/icons/CarStop.svg',
    description: 'CarStop',
    category: 'Facility'
  },
  {
    id: 'pallet',
    label: 'Pallet',
    backgroundColor: '#FF9800',
    hasInput: false,
    hasOutput: false,
    icon: '/icons/Pallet.svg',
    description: 'パレット置き場',
    category: 'Facility'
  },
  {
    id: 'storageArea',
    label: 'Storage Area',
    backgroundColor: '#9C27B0',
    hasInput: false,
    hasOutput: false,
    icon: '/icons/StorageArea.svg',
    description: 'Storage Area',
    category: 'Area'
  }
]; 