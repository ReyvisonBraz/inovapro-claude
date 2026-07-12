import {
  Smartphone, Monitor, Printer, Laptop, Cpu, Gamepad2, Tablet, MonitorCheck, HardDrive,
  Watch, Camera, Speaker, Headphones, Tv, MousePointer2, Keyboard, Radio, Mic, Battery, Wifi,
  Box, Layers, Layout, Grid, List as ListIcon,
} from 'lucide-react';
import type { EquipmentType } from '../../types';

export const AVAILABLE_ICONS = [
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Tablet', icon: Tablet },
  { name: 'Laptop', icon: Laptop },
  { name: 'Monitor', icon: Monitor },
  { name: 'Cpu', icon: Cpu },
  { name: 'Printer', icon: Printer },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Watch', icon: Watch },
  { name: 'Camera', icon: Camera },
  { name: 'Speaker', icon: Speaker },
  { name: 'Headphones', icon: Headphones },
  { name: 'Tv', icon: Tv },
  { name: 'MousePointer2', icon: MousePointer2 },
  { name: 'Keyboard', icon: Keyboard },
  { name: 'Radio', icon: Radio },
  { name: 'Mic', icon: Mic },
  { name: 'Battery', icon: Battery },
  { name: 'Wifi', icon: Wifi },
  { name: 'MonitorCheck', icon: MonitorCheck },
  { name: 'HardDrive', icon: HardDrive },
  { name: 'Box', icon: Box },
  { name: 'Layers', icon: Layers },
  { name: 'Layout', icon: Layout },
  { name: 'Grid', icon: Grid },
  { name: 'List', icon: ListIcon },
];

export const getIconForType = (type: EquipmentType) => {
  if (type.icon) {
    const found = AVAILABLE_ICONS.find(i => i.name === type.icon);
    if (found) return found.icon;
  }
  const name = type.name.toLowerCase();
  if (name.includes('notebook') || name.includes('laptop')) return Laptop;
  if (name.includes('desktop') || name.includes('pc')) return Cpu;
  if (name.includes('gamer')) return Gamepad2;
  if (name.includes('impressora')) return Printer;
  if (name.includes('monitor')) return Monitor;
  if (name.includes('smartphone') || name.includes('celular')) return Smartphone;
  if (name.includes('tablet')) return Tablet;
  if (name.includes('console') || name.includes('video game')) return Gamepad2;
  return MonitorCheck;
};
