import type { FlowNodeType } from '../types/NodeType';

export const flowNodeTypes: FlowNodeType[] = [
  {
    id: 'truckSource',
    label: 'Truck Source',
    backgroundColor: '#4CAF50',
    hasInput: false,
    hasOutput: true,
    icon: 'icons/TruckSource.svg',
    description: 'トラックの発着点',
    category: 'Source',
    allowedPhysicalTypes: ['warehouse', 'gate']
  },
  {
    id: 'parking',
    label: 'Parking',
    backgroundColor: '#2196F3',
    hasInput: true,
    hasOutput: true,
    icon: 'icons/Parking.svg',
    description: '一時駐車場',
    category: 'Area',
    allowedPhysicalTypes: ['carStop']
  },
  {
    id: 'truckBay',
    label: 'Truck Bay',
    backgroundColor: '#FF9800',
    hasInput: true,
    hasOutput: true,
    icon: 'icons/TruckBay.svg',
    description: 'トラックベイ',
    category: 'Area',
    allowedPhysicalTypes: ['carStop']
  },
  {
    id: 'tmpStorage',
    label: 'Temporary Storage',
    backgroundColor: '#9C27B0',
    hasInput: true,
    hasOutput: true,
    icon: 'icons/TmpStorage.svg',
    description: '一時保管場所',
    category: 'Storage',
    allowedPhysicalTypes: ['pallet']
  },
  {
    id: 'destinations',
    label: 'Destinations',
    backgroundColor: '#E91E63',
    hasInput: true,
    hasOutput: false,
    icon: 'icons/Destinations.svg',
    description: '配送先',
    category: 'Destination',
    allowedPhysicalTypes: ['warehouse', 'gate']
  }
]; 