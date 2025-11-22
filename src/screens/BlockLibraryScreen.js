import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from '../store';
import { BlockType, getBlockTimingSummary } from '../types';
import { useTheme } from '../theme';

export default function BlockLibraryScreen({ navigation }) {
  const colors = useTheme();
  const blockTemplates = useStore((state) => state.blockTemplates);
  const deleteBlockTemplate = useStore((state) => state.deleteBlockTemplate);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load data on mount
    const initialize = useStore.getState().initialize;
    initialize();
  }, []);

  const handleDelete = (blockId, blockLabel) => {
    Alert.alert(
      'Delete Activity',
      `Are you sure you want to delete "${blockLabel}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteBlockTemplate(blockId);
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await useStore.getState().initialize();
    setRefreshing(false);
  };

  const styles = getStyles(colors);

  const renderBlockItem = ({ item }) => {
    const typeLabels = {
      [BlockType.ACTIVITY]: 'Activity',
      [BlockType.REST]: 'Rest',
      [BlockType.TRANSITION]: 'Transition',
    };

    return (
      <TouchableOpacity
        style={styles.blockItem}
        onPress={() => navigation.navigate('BlockEdit', { blockId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.blockContent}>
          <Text style={styles.blockLabel}>{item.label}</Text>
          <View style={styles.blockMeta}>
            <Text style={styles.blockType}>{typeLabels[item.type] || item.type}</Text>
            <Text style={styles.blockTiming}>{getBlockTimingSummary(item)}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id, item.label)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={blockTemplates}
        renderItem={renderBlockItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No activities yet</Text>
            <Text style={styles.emptySubtext}>Tap "+ New Activity" to create one</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('BlockEdit', { blockId: null })}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+ New Activity</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  blockItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  blockContent: {
    flex: 1,
  },
  blockLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  blockMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  blockType: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  blockTiming: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  deleteButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});
