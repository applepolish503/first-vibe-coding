import type { NodeType } from '../types/NodeType';

export const nodeTypes: NodeType[] = [
  {
    id: 'truckSource',
    label: 'Truck Source',
    backgroundColor: '#6ede87',
    hasInput: false,
    hasOutput: true,
    icon: '/icons/TruckSource.svg',
    description: 'トラックの発生点となるノード',
    category: '入力'
  },
  {
    id: 'parking',
    label: 'Parking',
    backgroundColor: '#4a90e2',
    hasInput: true,
    hasOutput: true,
    icon: '/icons/Parking.svg',
    description: 'トラックの一時駐車場',
    category: 'Processes'
  },
  {
    id: 'truckBay',
    label: 'Truck Bay',
    backgroundColor: '#4a90e2',
    hasInput: true,
    hasOutput: true,
    icon: '/icons/TruckBay.svg',
    description: 'トラックの荷積み・荷降ろし場所',
    category: 'Processes'
  },
  {
    id: 'tmpStorage',
    label: 'Temporary Storage',
    backgroundColor: '#4a90e2',
    hasInput: true,
    hasOutput: true,
    icon: '/icons/TmpStorage.svg',
    description: '一時保管場所',
    category: 'Processes'
  },
  {
    id: 'destinations',
    label: 'Destinations',
    backgroundColor: '#6865A5',
    hasInput: true,
    hasOutput: false,
    icon: '/icons/Destinations.svg',
    description: '配送先となるノード',
    category: 'Output'
  },
]; 