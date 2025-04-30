import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { searchExercises } from "../dishSource";
import { muscleNameOptions, equipmentNameOptions, bodyPartNameOptions } from '../apiParams';

export function ExercisesView(props) {
  const { onExerciseSelected, isAddToTrainingMode, currentSessionID, model } = props;

  // Options for filter chips
  const muscleOptions = ['All', ...muscleNameOptions];
  const equipmentOptions = ['All', ...equipmentNameOptions];
  const bodyPartOptions = ['All', ...bodyPartNameOptions];

  // State for exercises and filters
  const [allExercises, setAllExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedMuscles, setSelectedMuscles] = useState(['All']);
  const [selectedEquipments, setSelectedEquipments] = useState(['All']);
  const [selectedBodyParts, setSelectedBodyParts] = useState(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterSection, setShowFilterSection] = useState(true);

  // Loading and API state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [totalExercises, setTotalExercises] = useState(0);
  const [fetchingProgress, setFetchingProgress] = useState(0);
  const [fetchComplete, setFetchComplete] = useState(false);

  // SYNCHRONOUS CALLBACKS

  // Transform an exercise object into a component (synchronous callback)
  function exerciseToComponentCB(item) {
    return (
      <TouchableOpacity
        style={styles.exerciseCard}
        onPress={() => handleExerciseSelectACB(item)}
        key={item.exerciseId}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <View style={styles.targetMuscleBadge}>
            <Text style={styles.targetMuscleText}>
              {item.targetMuscles && item.targetMuscles.length > 0 ? item.targetMuscles[0] : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Body Part:</Text>
            <Text style={styles.detailValue}>{item.bodyParts ? item.bodyParts.join(', ') : 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Equipment:</Text>
            <Text style={styles.detailValue}>{item.equipments ? item.equipments.join(', ') : 'N/A'}</Text>
          </View>

          {item.secondaryMuscles && item.secondaryMuscles.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Also works:</Text>
              <Text style={styles.detailValue}>{item.secondaryMuscles.join(', ')}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Transform a filter option into a component (synchronous callback)
  function filterOptionToComponentCB(label, isSelected, onToggle) {
    return (
      <TouchableOpacity
        style={[
          styles.filterChip,
          isSelected && styles.selectedFilterChip,
          isSelected && label === 'All' && styles.allSelectedChip
        ]}
        onPress={() => onToggle(label)}
        key={label}
      >
        <Text style={[
          styles.filterChipText,
          isSelected && styles.selectedFilterChipText
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  // Filter function - returns new filtered array (synchronous)
  function applyFiltersCB() {
    let result = [...allExercises];

    // Helper function to filter by property (higher-order function)
    function filterByPropertyCB(items, selectedValues, propertyGetter) {
      if (selectedValues.includes('All')) {
        return items;
      }

      return items.filter(item =>
        selectedValues.some(value => {
          const properties = propertyGetter(item);
          return Array.isArray(properties) && properties.includes(value);
        })
      );
    }

    // Apply muscle filter
    result = filterByPropertyCB(
      result,
      selectedMuscles,
      (exercise) => [
        ...(exercise?.targetMuscles || []),
        ...(exercise?.secondaryMuscles || [])
      ]
    );

    // Apply equipment filter
    result = filterByPropertyCB(
      result,
      selectedEquipments,
      (exercise) => exercise?.equipments || []
    );

    // Apply body part filter
    result = filterByPropertyCB(
      result,
      selectedBodyParts,
      (exercise) => exercise?.bodyParts || []
    );

    // Apply text search
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      result = result.filter(exercise =>
        (exercise?.name || '').toLowerCase().includes(lowercaseQuery)
      );
    }

    return result;
  }

  // ASYNCHRONOUS CALLBACKS

  // Handle exercise selection (asynchronous callback)
  function handleExerciseSelectACB(exercise) {
    console.log('Exercise selected:', exercise.name);

    console.log("isadding to training"+isAddToTrainingMode)
    if (isAddToTrainingMode) {
      // Show confirmation alert before adding to training session
      Alert.alert(
        "Add Exercise",
        `Do you want to add ${exercise.name} to your training session?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Add",
            onPress: () => {
              console.log('Adding to training session:', currentSessionID);
              onExerciseSelected(exercise);
            }
          }
        ]
      );
    } else {
      console.log('View exercise details (not adding to training)');
      // Handle viewing exercise details here
      onExerciseSelected(exercise);
    }
  }

  // Toggle muscle filter selection (asynchronous callback)
  function toggleMuscleSelectionACB(muscle) {
    if (muscle === 'All') {
      setSelectedMuscles(['All']);
    } else {
      setSelectedMuscles(prev => {
        // Remove 'All' if it exists
        const newSelection = prev.includes('All') ? [] : [...prev];

        // Toggle the selection
        if (newSelection.includes(muscle)) {
          const filtered = newSelection.filter(m => m !== muscle);
          // If empty after removal, select 'All'
          return filtered.length === 0 ? ['All'] : filtered;
        } else {
          return [...newSelection, muscle];
        }
      });
    }
  }

  // Toggle equipment filter selection (asynchronous callback)
  function toggleEquipmentSelectionACB(equipment) {
    if (equipment === 'All') {
      setSelectedEquipments(['All']);
    } else {
      setSelectedEquipments(prev => {
        const newSelection = prev.includes('All') ? [] : [...prev];
        if (newSelection.includes(equipment)) {
          const filtered = newSelection.filter(e => e !== equipment);
          return filtered.length === 0 ? ['All'] : filtered;
        } else {
          return [...newSelection, equipment];
        }
      });
    }
  }

  // Toggle body part filter selection (asynchronous callback)
  function toggleBodyPartSelectionACB(bodyPart) {
    if (bodyPart === 'All') {
      setSelectedBodyParts(['All']);
    } else {
      setSelectedBodyParts(prev => {
        const newSelection = prev.includes('All') ? [] : [...prev];
        if (newSelection.includes(bodyPart)) {
          const filtered = newSelection.filter(b => b !== bodyPart);
          return filtered.length === 0 ? ['All'] : filtered;
        } else {
          return [...newSelection, bodyPart];
        }
      });
    }
  }

  // Reset all filters (asynchronous callback)
  function resetFiltersACB() {
    setSelectedMuscles(['All']);
    setSelectedEquipments(['All']);
    setSelectedBodyParts(['All']);
    setSearchQuery('');
  }

  // Add toggle filter visibility function
  function toggleFilterSectionACB() {
    setShowFilterSection(prev => !prev);
  }

  // Fetch first page of exercises (asynchronous callback with promise)
  async function fetchInitialExercisesACB(isRefresh = false) {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
        setAllExercises([]);
        setFilteredExercises([]);
        setFetchingProgress(0);
        setFetchComplete(false);
      }

      setIsLoading(true);
      setError(null);

      const response = await searchExercises({});

      const exercises = response.data.exercises || [];
      const total = response.data.totalExercises || exercises.length || 0;

      setTotalExercises(total);
      setNextPageUrl(response.data.nextPage);
      setAllExercises(exercises);
      setFetchingProgress(exercises.length);

      // Only fetch remaining pages if needed
      if (response.data.nextPage && total > exercises.length) {
        console.log('Starting to fetch remaining exercises...');
        await fetchRemainingExercisesACB(response.data.nextPage, exercises, total);
      } else {
        console.log('No additional pages to fetch or total equals current count');
        setFetchComplete(true);
        setIsLoading(false);
        setIsRefreshing(false);
      }

    } catch (err) {
      console.error('Error fetching initial exercises:', err);
      setError('Failed to load exercises. Please try again.');
      setIsLoading(false);
      setIsRefreshing(false);
      setFetchComplete(true);
    }
  }

  // Fetch remaining pages (asynchronous callback with promise)
  async function fetchRemainingExercisesACB(initialUrl, initialExercises, totalCount) {
    if (!initialUrl) {
      setFetchComplete(true);
      setIsLoading(false);
      setIsRefreshing(false);
      setIsPaginationLoading(false);
      return;
    }

    setIsPaginationLoading(true);

    let currentUrl = initialUrl;
    let accumulatedExercises = [...initialExercises];

    try {
      // Loop instead of recursion to avoid stack issues
      while (currentUrl && accumulatedExercises.length < totalCount) {
        const urlObj = new URL(currentUrl);
        const offset = urlObj.searchParams.get('offset');
        const limit = urlObj.searchParams.get('limit');

        // Call searchExercises with pagination parameters
        const response = await searchExercises({ offset, limit });

        // Check if we got a valid response with exercises
        if (response?.data?.exercises?.length > 0) {
          // Combine new exercises with existing ones (create new array)
          accumulatedExercises = [...accumulatedExercises, ...response.data.exercises];

          // Update state with the latest accumulated exercises
          setAllExercises(accumulatedExercises);
          setFetchingProgress(accumulatedExercises.length);

          // Get next page URL
          currentUrl = response.data.nextPage;
          setNextPageUrl(currentUrl);

          // Safety check - don't exceed total exercises count
          if (accumulatedExercises.length >= totalCount) {
            break;
          }
        } else {
          // No exercises in the response or empty array
          currentUrl = null;
        }
      }

      // All pages fetched or limit reached
      setFetchComplete(true);
      setIsPaginationLoading(false);
      setIsLoading(false);
      setIsRefreshing(false);

    } catch (err) {
      console.error('Error fetching additional exercises:', err);
      // Don't set error here as we already have some exercises loaded
      setFetchComplete(true);
      setIsPaginationLoading(false);
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  // Update filtered exercises when filters change (side effect)
  useEffect(() => {
    const filtered = applyFiltersCB();
    setFilteredExercises(filtered);
  }, [selectedMuscles, selectedEquipments, selectedBodyParts, searchQuery, allExercises]);

  // Initial fetch on component mount (side effect)
  useEffect(() => {
    fetchInitialExercisesACB();
  }, []);

  // Render error view if there's an error
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchInitialExercisesACB(true)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Main component render
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exercise Library</Text>
        {isAddToTrainingMode && (
          <View style={styles.addModeContainer}>
            <Text style={styles.addModeText}>
              Select an exercise to add to your workout
            </Text>
          </View>
        )}
      </View>

      {/* Search Bar and Filter Toggle Button */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterToggleButton}
          onPress={toggleFilterSectionACB}
        >
          <Text style={styles.filterToggleText}>
            {showFilterSection ? 'Hide Filters' : 'Show Filters'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar when loading all exercises */}
      {isPaginationLoading && totalExercises > 0 && (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${Math.min((fetchingProgress / totalExercises) * 100, 100)}%` }
            ]}
          />
          <Text style={styles.progressText}>
            Loading exercises: {fetchingProgress}/{totalExercises}
          </Text>
        </View>
      )}

      {/* Filter Sections - Only show if showFilterSection is true */}
      {showFilterSection && (
        <View style={styles.filterContainer}>
          <Text style={styles.sectionTitle}>Filter Exercises</Text>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>By Muscle Group:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterScrollContent}
            >
              {muscleOptions.map(muscle =>
                filterOptionToComponentCB(muscle, selectedMuscles.includes(muscle), toggleMuscleSelectionACB)
              )}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>By Equipment:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterScrollContent}
            >
              {equipmentOptions.map(equipment =>
                filterOptionToComponentCB(equipment, selectedEquipments.includes(equipment), toggleEquipmentSelectionACB)
              )}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>By Body Part:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterScrollContent}
            >
              {bodyPartOptions.map(bodyPart =>
                filterOptionToComponentCB(bodyPart, selectedBodyParts.includes(bodyPart), toggleBodyPartSelectionACB)
              )}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetFiltersACB}
          >
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Exercise List */}
      {isLoading && allExercises.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredExercises}
          renderItem={({ item }) => exerciseToComponentCB(item)}
          keyExtractor={(item) => item.exerciseId + Math.random()}
          contentContainerStyle={styles.exerciseList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No exercises match your filters</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchInitialExercisesACB(true)}
              colors={['#6C63FF']}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#6C63FF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  exerciseCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    height: 48,
    backgroundColor: '#F1F3F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#495057',
    flex: 1,
    marginRight: 10,
  },
  filterToggleButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterToggleText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  progressContainer: {
    height: 24,
    backgroundColor: '#F1F3F5',
    borderRadius: 4,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6C63FF',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: '#212529',
    fontSize: 12,
    lineHeight: 24,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    fontWeight: '500',
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterScrollContent: {
    paddingBottom: 8,
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E9ECEF',
    marginRight: 8,
  },
  selectedFilterChip: {
    backgroundColor: '#6C63FF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#495057',
  },
  selectedFilterChipText: {
    color: 'white',
  },
  allSelectedChip: {
    backgroundColor: '#4C9AFF',
  },
  resetButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  exerciseList: {
    padding: 16,
  },
  exerciseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  targetMuscleBadge: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  targetMuscleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6C757D',
    width: 90,
  },
  detailValue: {
    fontSize: 14,
    color: '#212529',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6C757D',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC3545',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  }
});