import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import useStore from '../store';
import { BlockType, BlockMode, getBlockTimingSummary } from '../types';
import { generateId } from '../utils/id';

export default function AddBlockModal({ visible, onClose, onAddBlock }) {
  const blockTemplates = useStore((state) => state.blockTemplates);
  const [tab, setTab] = useState('library'); // 'library' or 'custom'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState(null);

  // Custom block form state
  const [customLabel, setCustomLabel] = useState('');
  const [customType, setCustomType] = useState(BlockType.ACTIVITY);
  const [customMode, setCustomMode] = useState(BlockMode.DURATION);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [customSeconds, setCustomSeconds] = useState(30);
  const [customReps, setCustomReps] = useState(10);
  const [customPerRepSeconds, setCustomPerRepSeconds] = useState(5);

  const filteredTemplates = blockTemplates.filter((template) => {
    const matchesSearch =
      !searchQuery ||
      template.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || template.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddFromLibrary = (template) => {
    const blockInstance = {
      id: generateId(),
      templateId: template.id,
      label: template.label,
      type: template.type,
      mode: template.mode,
      ...(template.mode === BlockMode.DURATION
        ? { durationSeconds: template.durationSeconds }
        : {
            reps: template.reps,
            perRepSeconds: template.perRepSeconds,
          }),
    };
    onAddBlock(blockInstance);
    onClose();
  };

  const handleAddCustom = () => {
    if (!customLabel.trim()) {
      Alert.alert('Validation Error', 'Please enter a name for this block.');
      return;
    }

    let durationSeconds = 0;
    if (customMode === BlockMode.DURATION) {
      durationSeconds = customMinutes * 60 + customSeconds;
      if (durationSeconds <= 0) {
        Alert.alert(
          'Validation Error',
          'Duration must be greater than 0 seconds.'
        );
        return;
      }
    } else if (customMode === BlockMode.REPS) {
      if (customReps <= 0 || customPerRepSeconds <= 0) {
        Alert.alert(
          'Validation Error',
          'Reps and seconds per rep must be greater than 0.'
        );
        return;
      }
    }

    const blockInstance = {
      id: generateId(),
      templateId: null, // Custom block, not from library
      label: customLabel.trim(),
      type: customType,
      mode: customMode,
      ...(customMode === BlockMode.DURATION
        ? { durationSeconds }
        : {
            reps: customReps,
            perRepSeconds: customPerRepSeconds,
          }),
    };

    onAddBlock(blockInstance);
    
    // Reset form
    setCustomLabel('');
    setCustomType(BlockType.ACTIVITY);
    setCustomMode(BlockMode.DURATION);
    setCustomMinutes(0);
    setCustomSeconds(30);
    setCustomReps(10);
    setCustomPerRepSeconds(5);
    
    onClose();
  };

  const renderLibraryItem = ({ item }) => {
    const typeLabels = {
      [BlockType.ACTIVITY]: 'Activity',
      [BlockType.REST]: 'Rest',
      [BlockType.TRANSITION]: 'Transition',
    };

    return (
      <TouchableOpacity
        style={styles.libraryItem}
        onPress={() => handleAddFromLibrary(item)}
      >
        <View style={styles.libraryItemContent}>
          <Text style={styles.libraryItemLabel}>{item.label}</Text>
          <View style={styles.libraryItemMeta}>
            <Text style={styles.libraryItemType}>
              {typeLabels[item.type] || item.type}
            </Text>
            <Text style={styles.libraryItemTiming}>
              {getBlockTimingSummary(item)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Block</Text>
          <View style={styles.closeButton} />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, tab === 'library' && styles.tabActive]}
            onPress={() => setTab('library')}
          >
            <Text
              style={[styles.tabText, tab === 'library' && styles.tabTextActive]}
            >
              From Library
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'custom' && styles.tabActive]}
            onPress={() => setTab('custom')}
          >
            <Text
              style={[styles.tabText, tab === 'custom' && styles.tabTextActive]}
            >
              Custom Block
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'library' ? (
          <View style={styles.libraryContent}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search activities..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterType === null && styles.filterButtonActive,
                ]}
                onPress={() => setFilterType(null)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterType === null && styles.filterButtonTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {Object.values(BlockType).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterButton,
                    filterType === type && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilterType(type)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filterType === type && styles.filterButtonTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <FlatList
              data={filteredTemplates}
              renderItem={renderLibraryItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No activities found</Text>
                  <Text style={styles.emptySubtext}>
                    Try a different search or create a custom block
                  </Text>
                </View>
              }
            />
          </View>
        ) : (
          <View style={styles.customContent}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={customLabel}
              onChangeText={setCustomLabel}
              placeholder="e.g., Custom exercise"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Type *</Text>
            <View style={styles.buttonRow}>
              {Object.values(BlockType).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    customType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setCustomType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      customType === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Mode *</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  customMode === BlockMode.DURATION && styles.modeButtonActive,
                ]}
                onPress={() => setCustomMode(BlockMode.DURATION)}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    customMode === BlockMode.DURATION &&
                      styles.modeButtonTextActive,
                  ]}
                >
                  Duration
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  customMode === BlockMode.REPS && styles.modeButtonActive,
                ]}
                onPress={() => setCustomMode(BlockMode.REPS)}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    customMode === BlockMode.REPS &&
                      styles.modeButtonTextActive,
                  ]}
                >
                  Reps
                </Text>
              </TouchableOpacity>
            </View>

            {customMode === BlockMode.DURATION ? (
              <View>
                <Text style={styles.label}>Duration *</Text>
                <View style={styles.durationRow}>
                  <View style={styles.durationGroup}>
                    <TextInput
                      style={styles.durationInput}
                      value={customMinutes.toString()}
                      onChangeText={(text) =>
                        setCustomMinutes(parseInt(text) || 0)
                      }
                      placeholder="0"
                      keyboardType="numeric"
                    />
                    <Text style={styles.durationLabel}>min</Text>
                  </View>
                  <View style={styles.durationGroup}>
                    <TextInput
                      style={styles.durationInput}
                      value={customSeconds.toString()}
                      onChangeText={(text) => {
                        const val = parseInt(text) || 0;
                        setCustomSeconds(Math.min(59, Math.max(0, val)));
                      }}
                      placeholder="30"
                      keyboardType="numeric"
                    />
                    <Text style={styles.durationLabel}>sec</Text>
                  </View>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.label}>Number of Reps *</Text>
                <TextInput
                  style={styles.input}
                  value={customReps.toString()}
                  onChangeText={(text) => setCustomReps(parseInt(text) || 0)}
                  placeholder="10"
                  keyboardType="numeric"
                />
                <Text style={styles.label}>Seconds per Rep *</Text>
                <TextInput
                  style={styles.input}
                  value={customPerRepSeconds.toString()}
                  onChangeText={(text) =>
                    setCustomPerRepSeconds(parseFloat(text) || 0)
                  }
                  placeholder="5"
                  keyboardType="decimal-pad"
                />
              </>
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddCustom}
            >
              <Text style={styles.addButtonText}>Add to Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  closeButton: {
    padding: 8,
    minWidth: 60,
  },
  closeButtonText: {
    color: '#6200ee',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#6200ee',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  tabTextActive: {
    color: '#6200ee',
    fontWeight: '600',
  },
  libraryContent: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  filterButtonActive: {
    backgroundColor: '#6200ee',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  libraryItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  libraryItemContent: {
    flex: 1,
  },
  libraryItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  libraryItemMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  libraryItemType: {
    fontSize: 14,
    color: '#666',
  },
  libraryItemTiming: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '500',
  },
  customContent: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#6200ee',
    backgroundColor: '#f3e5f5',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#6200ee',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modeButtonActive: {
    borderColor: '#6200ee',
    backgroundColor: '#f3e5f5',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modeButtonTextActive: {
    color: '#6200ee',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 16,
  },
  durationGroup: {
    flex: 1,
  },
  durationInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlign: 'center',
  },
  durationLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

