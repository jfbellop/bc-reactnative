// ============================================================
// MOCK DATA — src/data/mockData.ts
// ============================================================
// Dominio: Máquinas Expendedoras
//
// Las imágenes son fotos reales de máquinas expendedoras servidas por
// Wikimedia Commons (URL pública, sin necesidad de descargar archivos).
// Si algún día quieres usar fotos locales, cambia cada imageUri por:
//     require('../../assets/vm-001.jpg')
// ============================================================

import { VendingMachine } from '../types';

export const MOCK_ITEMS: VendingMachine[] = [
  {
    id: '1',
    name: 'Expendedora Snacks — Edificio A',
    subtitle: 'Torre A, Piso 3',
    imageUri:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Book_vending_machine_2011.jpg?width=900',
    category: 'Snacks',
    location: 'Torre A, Piso 3, junto a cafetería',
    status: 'Operativa',
    capacity: 60,
    currentStock: 52,
    dailyRevenue: 185000,
  },
  {
    id: '2',
    name: 'Expendedora Bebidas — Lobby',
    subtitle: 'Lobby Principal',
    imageUri:
      'https://commons.wikimedia.org/wiki/Special:FilePath/SZ_%E6%B7%B1%E5%9C%B3_Shenzhen_%E7%A6%8F%E7%94%B0_Futian_%E6%9C%83%E5%B1%95%E4%B8%AD%E5%BF%83%E7%AB%99_Metro_CEC_Station_concourse_drink_bottles_beverage_vending_machine_June_2025_R12S_01.jpg?width=900',
    category: 'Bebidas',
    location: 'Lobby Principal, Recepción',
    status: 'Stock Bajo',
    capacity: 80,
    currentStock: 14,
    dailyRevenue: 220000,
  },
  {
    id: '3',
    name: 'Café Express — Sala de Juntas',
    subtitle: 'Piso 5',
    imageUri:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Aire_de_Ceignes-Cerdon_-_Machine_%C3%A0_caf%C3%A9_et_micro-ondes_%28juil_2018%29.jpg?width=900',
    category: 'Café',
    location: 'Piso 5, Zona de Salas de Juntas',
    status: 'Fuera de Servicio',
    capacity: 40,
    currentStock: 0,
    dailyRevenue: 0,
  },
  {
    id: '4',
    name: 'Opciones Saludables — Gimnasio',
    subtitle: 'Piso 1',
    imageUri:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Big_button_coke_machine_%283691019133%29.jpg?width=900',
    category: 'Saludable',
    location: 'Piso 1, Gimnasio Corporativo',
    status: 'Operativa',
    capacity: 45,
    currentStock: 38,
    dailyRevenue: 96000,
  },
];