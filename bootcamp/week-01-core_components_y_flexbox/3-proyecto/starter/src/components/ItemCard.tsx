// ============================================================
// COMPONENT: ItemCard
// ============================================================
// Dominio: Máquinas Expendedoras
// ============================================================

import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { VendingMachine, MachineStatus } from '../types';

interface ItemCardProps {
  item: VendingMachine;
  onPress: (item: VendingMachine) => void;
}

const STATUS_COLORS: Record<MachineStatus, string> = {
  Operativa: '#3fb950',
  'Stock Bajo': '#d29922',
  Mantenimiento: '#db6d28',
  'Fuera de Servicio': '#f85149',
};

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

export function ItemCard({ item, onPress }: ItemCardProps): React.JSX.Element {
  const statusColor = STATUS_COLORS[item.status];

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <Image source={{ uri: item.imageUri }} style={styles.cardImage} resizeMode="cover" />

      <View style={styles.badgeRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

        <View style={styles.footerRow}>
          <View style={styles.footerColumn}>
            <Text style={styles.footerLabel}>Stock</Text>
            <Text style={styles.footerValue}>
              {item.currentStock}/{item.capacity}
            </Text>
          </View>
          <View style={[styles.footerColumn, styles.footerColumnRight]}>
            <Text style={styles.footerLabel}>Ingreso diario</Text>
            <Text style={styles.footerValueRevenue}>
              {formatCOP(item.dailyRevenue)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  cardPressed: {
    opacity: 0.75,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: -14,
  },
  categoryBadge: {
    backgroundColor: '#1f6feb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#0d1117',
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    padding: 16,
    gap: 4,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#8b949e',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
  footerColumn: {
    alignItems: 'flex-start',
  },
  footerColumnRight: {
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontSize: 11,
    color: '#8b949e',
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  footerValueRevenue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3fb950',
  },
});