import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from '../store';
import { BlockType, getBlockTimingSummary, getBlockTypeColor } from '../types';
import { useTheme } from '../theme';

export default function BlockLibraryScreen({ navigation }) {
  const colors = useTheme();
  const blockTemplates = useStore((state) => state.blockTemplates);
  const deleteBlockTemplate = useStore((state) => state.deleteBlockTemplate);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(null); // null = all types

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

  // Filter blocks based on search query and selected type
  const filteredBlocks = useMemo(() => {
    return blockTemplates.filter((block) => {
      // Filter by type
      if (selectedType !== null && block.type !== selectedType) {
        return false;
      }
      
      // Filter by search query (case-insensitive)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return block.label.toLowerCase().includes(query);
      }
      
      return true;
    });
  }, [blockTemplates, searchQuery, selectedType]);

  const renderBlockItem = ({ item }) => {
    const blockTypeColor = getBlockTypeColor(item.type, colors);
    
    return (
      <TouchableOpacity
        style={[styles.blockItem, { borderLeftWidth: 4, borderLeftColor: blockTypeColor }]}
        onPress={() => navigation.navigate('BlockEdit', { blockId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.blockContent}>
          <Text style={styles.blockLabel}>{item.label}</Text>
          <View style={styles.blockMeta}>
            <Text style={[styles.blockType, { color: blockTypeColor }]}>
              {typeLabels[item.type] || item.type}
            </Text>
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

  const typeLabels = {
    [BlockType.ACTIVITY]: 'Activity',
    [BlockType.REST]: 'Rest',
    [BlockType.TRANSITION]: 'Transition',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Type Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedType === null && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedType(null)}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedType === null && styles.filterButtonTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {Object.entries(BlockType).map(([key, value]) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.filterButton,
              selectedType === value && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedType(value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedType === value && styles.filterButtonTextActive,
              ]}
            >
              {typeLabels[value]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredBlocks}
        renderItem={renderBlockItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || selectedType !== null
                ? 'No activities match your filters'
                : 'No activities yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedType !== null
                ? 'Try adjusting your search or filters'
                : 'Tap "+ New Activity" to create one'}
            </Text>
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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  searchInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.textLight,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  blockItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 16,
    paddingLeft: 12, // Account for border
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
