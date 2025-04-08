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
  RefreshControl
} from 'react-native';
import { searchExercises } from "../dishSource";
import { muscleNameOptions, equipmentNameOptions, bodyPartNameOptions } from '../apiParams';

export function ExercisesView(props) {
  const { onExerciseSelected } = props; // Extract the onExerciseSelected callback
  
  const muscleOptions = ['All', ...muscleNameOptions];
  const equipmentOptions = ['All', ...equipmentNameOptions];
  const bodyPartOptions = ['All', ...bodyPartNameOptions];

  // State - changed to arrays for multi-select
  const [allExercises, setAllExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedMuscles, setSelectedMuscles] = useState(['All']);
  const [selectedEquipments, setSelectedEquipments] = useState(['All']);
  const [selectedBodyParts, setSelectedBodyParts] = useState(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [totalExercises, setTotalExercises] = useState(0);
  const [fetchingProgress, setFetchingProgress] = useState(0);
  const [fetchComplete, setFetchComplete] = useState(false);

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Fetch first page of exercises
  const fetchInitialExercises = async (isRefresh = false) => {
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
      
      // Make sure totalExercises is set correctly from response
      // If totalExercises is missing or zero, use the length of current exercises as fallback
      const total = response.data.totalExercises || exercises.length || 0;
      
      setTotalExercises(total);
      setNextPageUrl(response.data.nextPage);
      setAllExercises(exercises);
      setFilteredExercises(exercises);
      setFetchingProgress(exercises.length);

      // Only fetch remaining pages if there's a next page AND total is greater than current count
      if (response.data.nextPage && total > exercises.length) {
        console.log('Starting to fetch remaining exercises...');
        await fetchRemainingExercises(response.data.nextPage, exercises, total);
      } else {
        console.log('No additional pages to fetch or total equals current count');
        // No more pages to fetch
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
  };

  // Fetch remaining pages - using a non-recursive approach to avoid stack overflow
  const fetchRemainingExercises = async (initialUrl, initialExercises, totalCount) => {
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
        // Extract the API parameters from the URL
        const urlObj = new URL(currentUrl);
        const offset = urlObj.searchParams.get('offset');
        const limit = urlObj.searchParams.get('limit');
        
        // Call searchExercises with pagination parameters
        const response = await searchExercises({ offset, limit });
        
        // Check if we got a valid response with exercises
        if (response?.data?.exercises?.length > 0) {
          // Combine new exercises with existing ones
          accumulatedExercises = [...accumulatedExercises, ...response.data.exercises];
          
          // Update state with the latest accumulated exercises
          setAllExercises(accumulatedExercises);
          setFilteredExercises(accumulatedExercises);
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
  };

  // Initial fetch
  useEffect(() => {
    fetchInitialExercises();
  }, []);

  // Toggle functions for multi-select
  const toggleMuscleSelection = (muscle) => {
    if (muscle === 'All') {
      setSelectedMuscles(['All']);
    } else {
      setSelectedMuscles(prev => {
        // Remove 'All' if it exists
        const newSelection = prev.includes('All') ? [] : [...prev];
        
        // Toggle the selection
        if (newSelection.includes(muscle)) {
          return newSelection.filter(m => m !== muscle);
        } else {
          return [...newSelection, muscle];
        }
      });
    }
  };

  const toggleEquipmentSelection = (equipment) => {
    if (equipment === 'All') {
      setSelectedEquipments(['All']);
    } else {
      setSelectedEquipments(prev => {
        const newSelection = prev.includes('All') ? [] : [...prev];
        if (newSelection.includes(equipment)) {
          return newSelection.filter(e => e !== equipment);
        } else {
          return [...newSelection, equipment];
        }
      });
    }
  };

  const toggleBodyPartSelection = (bodyPart) => {
    if (bodyPart === 'All') {
      setSelectedBodyParts(['All']);
    } else {
      setSelectedBodyParts(prev => {
        const newSelection = prev.includes('All') ? [] : [...prev];
        if (newSelection.includes(bodyPart)) {
          return newSelection.filter(b => b !== bodyPart);
        } else {
          return [...newSelection, bodyPart];
        }
      });
    }
  };

  // Handle exercise selection
  const handleExerciseSelectACB = (exercise) => {
    console.log('Exercise selected:', exercise.name);
    if (onExerciseSelected) {
      onExerciseSelected(exercise);
    }
  };

  // Apply filters with multi-select support
  useEffect(() => {
    let result = [...allExercises];

    // Muscle filter
    if (!selectedMuscles.includes('All')) {
      result = result.filter(exercise => 
        selectedMuscles.some(muscle => 
          exercise?.targetMuscles?.includes(muscle) ||
          exercise?.secondaryMuscles?.includes(muscle)
      ));
    }

    // Equipment filter
    if (!selectedEquipments.includes('All')) {
      result = result.filter(exercise => 
        selectedEquipments.some(equipment => 
          exercise?.equipments?.includes(equipment)
      ));
    }

    // Body part filter
    if (!selectedBodyParts.includes('All')) {
      result = result.filter(exercise => 
        selectedBodyParts.some(bodyPart => 
          exercise?.bodyParts?.includes(bodyPart)
      ));
    }

    // Search query filter
    if (searchQuery) {
      result = result.filter(exercise =>
        exercise?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredExercises(result);
  }, [selectedMuscles, selectedEquipments, selectedBodyParts, searchQuery, allExercises]);

  // Render exercise item with click handler
  const renderExerciseItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.exerciseCard}
      onPress={() => handleExerciseSelectACB(item)} // Add this onPress handler
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

  // Enhanced filter chip renderer for multi-select
  const renderFilterChip = ({ label, selected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selected && styles.selectedFilterChip,
        selected && label === 'All' && styles.allSelectedChip
      ]}
      onPress={onPress}
      key={label}
    >
      <Text style={[
        styles.filterChipText,
        selected && styles.selectedFilterChipText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchInitialExercises(true)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exercise Library</Text>
        <Text style={styles.exerciseCount}>
          {filteredExercises.length} exercises available
          {!fetchComplete && totalExercises > 0 && ` (Loading ${fetchingProgress}/${totalExercises})`}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
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

      {/* Filter Sections */}
      <View style={styles.filterContainer}>
        <Text style={styles.sectionTitle}>Filter Exercises</Text>
        
        <Text style={styles.filterLabel}>By Muscle Group:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {muscleOptions.map((muscle) => (
            renderFilterChip({
              label: muscle,
              selected: selectedMuscles.includes(muscle),
              onPress: () => toggleMuscleSelection(muscle)
            })
          ))}
        </ScrollView>

        <Text style={styles.filterLabel}>By Equipment:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {equipmentOptions.map((equipment) => (
            renderFilterChip({
              label: equipment,
              selected: selectedEquipments.includes(equipment),
              onPress: () => toggleEquipmentSelection(equipment)
            })
          ))}
        </ScrollView>

        <Text style={styles.filterLabel}>By Body Part:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {bodyPartOptions.map((bodyPart) => (
            renderFilterChip({
              label: bodyPart,
              selected: selectedBodyParts.includes(bodyPart),
              onPress: () => toggleBodyPartSelection(bodyPart)
            })
          ))}
        </ScrollView>
      </View>

      {/* Exercise List */}
      {isLoading && allExercises.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredExercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.exerciseId + Math.random()}
          contentContainerStyle={styles.exerciseList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No exercises match your filters</Text>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => {
                  setSelectedMuscles(['All']);
                  setSelectedEquipments(['All']);
                  setSelectedBodyParts(['All']);
                  setSearchQuery('');
                }}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchInitialExercises(true)}
              colors={['#6C63FF']}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

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
  },
  searchInput: {
    height: 48,
    backgroundColor: '#F1F3F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#495057',
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
  filterLabel: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    marginTop: 12,
  },
  filterScroll: {
    marginHorizontal: -4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E9ECEF',
    marginRight: 8,
    marginHorizontal: 4,
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
  resetButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: '500',
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
  },
  allSelectedChip: {
    backgroundColor: '#4C9AFF', // Different color for "All" when selected
  },
  selectedIndicator: {
    color: 'white',
    marginLeft: 4,
    fontWeight: 'bold',
  },
});