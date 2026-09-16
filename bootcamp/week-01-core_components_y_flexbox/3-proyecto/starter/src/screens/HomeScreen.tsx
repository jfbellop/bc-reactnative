// ============================================================
// SCREEN: HomeScreen
// ============================================================
// Dominio: Máquinas Expendedoras
// ============================================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { VendingMachine } from '../types';
import { ItemCard } from '../components/ItemCard';
import { MOCK_ITEMS } from '../data/mockData';

export function HomeScreen(): React.JSX.Element {
  const DOMAIN_TITLE = 'VendCorp';
  const DOMAIN_SUBTITLE = 'Panel de Máquinas Expendedoras';

  const total = MOCK_ITEMS.length;
  const operativas = MOCK_ITEMS.filter((m) => m.status === 'Operativa').length;
  const alertas = MOCK_ITEMS.filter(
    (m) => m.status === 'Stock Bajo' || m.status === 'Fuera de Servicio'
  ).length;

  /**
   * Handles item card press.
   * For now, just logs the item name. In week-03 we'll add navigation.
   */
  function handleItemPress(item: VendingMachine): void {
    console.log('Máquina seleccionada:', item.name);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{DOMAIN_TITLE}</Text>
        <Text style={styles.headerSubtitle}>{DOMAIN_SUBTITLE}</Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{total}</Text>
            <Text style={styles.metricLabel}>Total</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={[styles.metricValue, styles.metricOk]}>{operativas}</Text>
            <Text style={styles.metricLabel}>Operativas</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={[styles.metricValue, styles.metricAlert]}>{alertas}</Text>
            <Text style={styles.metricLabel}>Alertas</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_ITEMS.map((item) => (
          <ItemCard key={item.id} item={item} onPress={handleItemPress} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0d1117',
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8b949e',
    marginTop: 4,
  },

  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  metricOk: {
    color: '#3fb950',
  },
  metricAlert: {
    color: '#f85149',
  },
  metricLabel: {
    fontSize: 11,
    color: '#8b949e',
    marginTop: 2,
  },

  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
});