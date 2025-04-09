import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { Link } from 'expo-router';

export function TrainingView({ session, onAddExercise, onSave, error, getCurrentSession }) {
  // Component State - simplified sessionName state initialization
  const [sessionName, setSessionName] = useState(session?.name || 'New Training Session');
  
  // Timer states
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(session?.duration || 0);
  const timerInterval = useRef(null);
  
  // Modal states for editing sets
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState(null);
  const [editingSetIndex, setEditingSetIndex] = useState(null);
  const [editWeight, setEditWeight] = useState('0');
  const [editReps, setEditReps] = useState('0');
  
  console.log("TrainingView rendered with session:", session?.id, "name:", session?.name);
  
  // Early calculation of exercisesList and workout status
  const exercisesList = session && Array.isArray(session.exercisesList) ? session.exercisesList : [];
  
  // Check if workout has been started
  const workoutStarted = timerRunning || exercisesList.some(exercise => (exercise.completedSets || 0) > 0);
  
  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    if (exercisesList.length === 0) {
      return 0;
    }
    
    let totalSets = 0;
    let completedSets = 0;
    
    exercisesList.forEach(exercise => {
      if (Array.isArray(exercise.sets)) {
        totalSets += exercise.sets.length;
        completedSets += exercise.completedSets || 0;
      }
    });
    
    return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  };
  
  const completionPercentage = calculateCompletionPercentage();
  
  // SYNCHRONOUS CALLBACKS
  
  // Format seconds into MM:SS format
  function formatTimeCB(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Check if any sets have been completed
  function hasAnyCompletedSetsCB() {
    if (!Array.isArray(exercisesList)) return false;
    
    return exercisesList.some(exercise => (exercise.completedSets || 0) > 0);
  }
  
  // Transform exercise data to UI element
  function exerciseToComponentCB(exercise, exerciseIndex) {
    return (
      <View key={exercise.id || exerciseIndex} style={styles.exerciseCard}>
        <Text style={styles.exerciseName}>{exercise.name || 'Unnamed Exercise'}</Text>
        
        {Array.isArray(exercise.targetMuscles) && exercise.targetMuscles.length > 0 && (
          <View style={styles.targetMuscleContainer}>
            <Text style={styles.targetMuscleLabel}>Target: </Text>
            <Text style={styles.targetMuscleValue}>{exercise.targetMuscles.join(', ')}</Text>
          </View>
        )}
        
        <View style={styles.setsContainer}>
          <View style={styles.setsHeaderRow}>
            <Text style={styles.setsHeader}>Sets:</Text>
            {!workoutStarted && (
              <TouchableOpacity 
                style={styles.addSetButton}
                onPress={addSetACB(exerciseIndex)}
              >
                <Text style={styles.addSetButtonText}>+ Add Set</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {Array.isArray(exercise.sets) && exercise.sets.length > 0 ? (
            exercise.sets.map((set, setIndex) => setToComponentCB(set, setIndex, exerciseIndex, exercise))
          ) : (
            <Text style={styles.noSetsText}>No sets defined</Text>
          )}
        </View>
      </View>
    );
  }
  
  // Transform set data to UI element
  function setToComponentCB(set, setIndex, exerciseIndex, exercise) {
    return (
      <View key={setIndex} style={styles.setItemContainer}>
        <TouchableOpacity
          style={[
            styles.setItem,
            (exercise.completedSets || 0) > setIndex && styles.completedSetItem
          ]}
          onPress={toggleSetCompletionACB(exerciseIndex, setIndex)}
          disabled={!workoutStarted} // Only allow toggling when workout has started
        >
          <Text style={styles.setNumber}>Set {setIndex + 1}</Text>
          <Text style={styles.setDetails}>
            {set.weight > 0 ? `${set.weight} kg × ` : ''}{set.reps} reps
          </Text>
        </TouchableOpacity>
        
        <View style={styles.setActions}>
          {!workoutStarted && (
            <TouchableOpacity 
              style={styles.setActionButton}
              onPress={openEditSetModalACB(exerciseIndex, setIndex)}
            >
              <Text style={styles.setActionButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          
          {!workoutStarted && exercise.sets.length > 1 && (
            <TouchableOpacity 
              style={[styles.setActionButton, styles.deleteButton]}
              onPress={deleteSetACB(exerciseIndex, setIndex)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
  
  // ASYNCHRONOUS CALLBACKS
  
  // Start the workout session
  function startWorkoutACB() {
    if (timerRunning) return;
    
    console.log("Starting workout session and timer");
    
    // Start the timer
    setTimerRunning(true);
    timerInterval.current = setInterval(() => {
      setTimerSeconds(prevSeconds => prevSeconds + 1);
    }, 1000);
    
    // Save session state with workout started status
    const updatedSession = {
      ...session,
      name: sessionName,
      duration: timerSeconds,
      started: true
    };
    onSave(updatedSession);
  }
  
  // Timer functions
  function startTimerACB() {
    if (timerRunning) return;
    
    console.log("Starting timer and saving session state");
    
    setTimerRunning(true);
    timerInterval.current = setInterval(() => {
      setTimerSeconds(prevSeconds => prevSeconds + 1);
    }, 1000);
    
    // Save session state when timer starts
    const updatedSession = {
      ...session,
      name: sessionName,
      duration: timerSeconds,
    };
    onSave(updatedSession);
  }
  
  function pauseTimerACB() {
    if (!timerRunning) return;
    
    setTimerRunning(false);
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
  }
  
  function resetTimerACB() {
    pauseTimerACB();
    setTimerSeconds(0);
  }
  
  // Save session name when it changes
  function handleNameChangeACB(text) {
    setSessionName(text);
    
    if (!session) return;
    
    // Save name change immediately
    const updatedSession = {
      ...session,
      name: text,
    };
    
    console.log('Session name changed to:', text);
    
    if (onSave) {
      onSave(updatedSession);
    }
  }
  
  // Handle closing modal
  function closeModalACB() {
    setModalVisible(false);
  }
  
  // Add a new set to an exercise (curried function)
  function addSetACB(exerciseIndex) {
    return function() {
      if (!session || !Array.isArray(session.exercisesList)) {
        console.error("Cannot add set: invalid session or exercisesList");
        return;
      }
      
      const exercise = session.exercisesList[exerciseIndex];
      if (!exercise) {
        console.error("Exercise not found at index:", exerciseIndex);
        return;
      }
      
      // Ensure sets array exists
      if (!Array.isArray(exercise.sets)) {
        exercise.sets = [];
      }
      
      // Get values from the last set or use defaults
      const lastSet = exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1] : null;
      const defaultWeight = lastSet ? lastSet.weight : 0;
      const defaultReps = lastSet ? lastSet.reps : 8;
      
      // Add a new set (create a new object to trigger shallow comparison)
      const updatedExercise = {
        ...exercise,
        sets: [...exercise.sets, { weight: defaultWeight, reps: defaultReps }]
      };
      
      // Create a new session with the updated exercise
      const updatedExercisesList = [...session.exercisesList];
      updatedExercisesList[exerciseIndex] = updatedExercise;
      
      const updatedSession = {
        ...session,
        exercisesList: updatedExercisesList
      };
      
      // Save changes
      if (onSave) {
        onSave(updatedSession);
      }
    };
  }
  
  // Open the edit set modal (curried function)
  function openEditSetModalACB(exerciseIndex, setIndex) {
    return function() {
      const exercise = session.exercisesList[exerciseIndex];
      const set = exercise.sets[setIndex];
      
      setEditingExerciseIndex(exerciseIndex);
      setEditingSetIndex(setIndex);
      setEditWeight(set.weight.toString());
      setEditReps(set.reps.toString());
      setModalVisible(true);
    };
  }
  
  // Save the edited set
  function saveEditedSetACB() {
    if (editingExerciseIndex === null || editingSetIndex === null) {
      return;
    }
    
    // Create a deep copy of the session to properly trigger updates
    const updatedSession = JSON.parse(JSON.stringify(session));
    const exercise = updatedSession.exercisesList[editingExerciseIndex];
    
    // Update the set with new values
    exercise.sets[editingSetIndex] = {
      weight: parseFloat(editWeight) || 0,
      reps: parseInt(editReps, 10) || 0
    };
    
    // Close modal and reset state
    setModalVisible(false);
    setEditingExerciseIndex(null);
    setEditingSetIndex(null);
    
    // Save changes
    if (onSave) {
      onSave(updatedSession);
    }
  }
  
  // Delete a set (curried function)
  function deleteSetACB(exerciseIndex, setIndex) {
    return function() {
      // Create a deep copy of the session to properly trigger updates
      const updatedSession = JSON.parse(JSON.stringify(session));
      const exercise = updatedSession.exercisesList[exerciseIndex];
      
      // Remove the set
      exercise.sets.splice(setIndex, 1);
      
      // If completedSets is greater than the number of sets, adjust it
      if ((exercise.completedSets || 0) > exercise.sets.length) {
        exercise.completedSets = exercise.sets.length;
      }
      
      // Save changes
      if (onSave) {
        onSave(updatedSession);
      }
    };
  }
  
  // Toggle set completion (curried function)
  function toggleSetCompletionACB(exerciseIndex, setIndex) {
    return function() {
      if (!session || !Array.isArray(session.exercisesList) || !workoutStarted) {
        console.error("Cannot toggle set: invalid session, exercisesList, or workout not started");
        return;
      }
      
      // Create a deep copy of the session to properly trigger updates
      const updatedSession = JSON.parse(JSON.stringify(session));
      const exercise = updatedSession.exercisesList[exerciseIndex];
      
      if (!exercise) {
        console.error("Exercise not found at index:", exerciseIndex);
        return;
      }
      
      // Calculate new completedSets count
      let updatedCompletedSets = exercise.completedSets || 0;
      
      // Check if this set is already completed
      const setCompleted = (updatedCompletedSets > setIndex);
      
      if (setCompleted) {
        // Uncomplete this set and all sets after it
        updatedCompletedSets = setIndex;
      } else {
        // Complete this set
        updatedCompletedSets = setIndex + 1;
      }
      
      // Update the exercise
      exercise.completedSets = updatedCompletedSets;
      
      // Save changes
      if (onSave) {
        onSave(updatedSession);
      }
    };
  }
  
  // Finish workout and navigate to report
  function finishWorkoutACB() {
    // Pause timer
    pauseTimerACB();
    
    console.log('Finish workout button pressed');
    
    // Create updated session with completed status
    const updatedSession = {
      ...session,
      name: sessionName,
      duration: timerSeconds,
      completed: true,
      completionDate: new Date().toISOString()
    };
    
    // Reset timer
    resetTimerACB();
    
    // Reset the timerRunning state
    setTimerRunning(false);
    
    // Reset completed sets for all exercises
    if (session && Array.isArray(session.exercisesList)) {
      const resetExercises = session.exercisesList.map(exercise => ({
        ...exercise,
        completedSets: 0
      }));
      
      updatedSession.exercisesList = resetExercises;
      
      // Also reset the started flag
      updatedSession.started = false;
    }
    
    // Save session before navigating
    if (onSave) {
      console.log('Saving session before navigation');
      onSave(updatedSession);
    }
    
    console.log('Attempting direct navigation to report tab...');
    
    // Try navigation without Alert confirmation
    try {
      router.push('/report');
      console.log('Navigation command executed');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }
  
  // Mark workout as 100% complete
  function markWorkoutCompleteACB() {
    if (!session || !Array.isArray(session.exercisesList)) {
      return;
    }
    
    // Create a deep copy of the session to properly trigger updates
    const updatedSession = JSON.parse(JSON.stringify(session));
    
    // Mark all sets as completed for all exercises
    updatedSession.exercisesList.forEach(exercise => {
      if (Array.isArray(exercise.sets)) {
        exercise.completedSets = exercise.sets.length;
      }
    });
    
    // Save changes
    if (onSave) {
      onSave(updatedSession);
    }
    
    Alert.alert('Success', 'All sets marked as completed!');
  }
  
  // SIDE EFFECTS

  // Update sessionName when session changes
  useEffect(() => {
    if (session?.name) {
      console.log("Updating session name from props:", session.name);
      setSessionName(session.name);
    }
  }, [session]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        
        // Save the current session duration on unmount if session exists
        if (session) {
          const updatedSession = {
            ...session,
            duration: timerSeconds,
          };
          onSave(updatedSession);
        }
      }
    };
  }, []);
  
  // Check for updated session data on mount
  useEffect(() => {
    console.log("TrainingView mounted with session:", session?.id);
    
    // Only check for updated session if we have both a session and getCurrentSession
    if (session?.id && getCurrentSession) {
      console.log("Checking for latest session data");
      
      // Get fresh session data
      const latestSession = getCurrentSession(session.id);
      
      // If we got a valid session back
      if (latestSession && Array.isArray(latestSession.exercisesList)) {
        const currentExercisesCount = Array.isArray(session.exercisesList) ? 
                                     session.exercisesList.length : 0;
        
        console.log("Current exercises count:", currentExercisesCount);
        console.log("Latest exercises count:", latestSession.exercisesList.length);
        
        // If the latest session has more exercises, update via onSave
        if (latestSession.exercisesList.length > currentExercisesCount) {
          console.log("Found newer session data with more exercises, updating");
          onSave(latestSession);
        }
        
        // Check if session was already started previously
        if (latestSession.started && !timerRunning) {
          startTimerACB();
        }
      }
    }
  }, []);
  
  // Show completion alert when workout reaches 100%
  useEffect(() => {
    if (completionPercentage === 100 && workoutStarted) {
      // Pause timer when complete
      pauseTimerACB();
      
      // Show completion alert
      Alert.alert(
        "Workout Complete!",
        "Great job! You've completed all exercises.",
        [
          { 
            text: "View Report", 
            onPress: finishWorkoutACB 
          }
        ]
      );
    }
  }, [completionPercentage, workoutStarted]);
  
  // Check if we have a valid session
  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No training session selected.</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={onAddExercise}
        >
          <Text style={styles.addButtonText}>Create New Session</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Check if session has any exercises
  const hasExercises = exercisesList.length > 0;
  
  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <View style={styles.header}>
        {!workoutStarted ? (
          // Editable text input when not started
          <TextInput
            style={[styles.sessionNameInput, { flex: 1 }]}
            value={sessionName}
            onChangeText={handleNameChangeACB}
            placeholder="Session Name"
          />
        ) : (
          // Display as text only when workout started
          <Text style={styles.sessionNameText}>{sessionName}</Text>
        )}
      </View>
      
      {/* Timer Section - just display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Workout Time</Text>
        <Text style={styles.timerDisplay}>{formatTimeCB(timerSeconds)}</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${completionPercentage}%` }
            ]} 
          />
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{completionPercentage}% complete</Text>
          
          {/* Mark as 100% Complete button */}
          {workoutStarted && completionPercentage < 100 && (
            <TouchableOpacity 
              style={styles.markCompleteButton}
              onPress={markWorkoutCompleteACB}
            >
              <Text style={styles.markCompleteButtonText}>Mark 100% Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView style={styles.exercisesContainer}>
        {exercisesList.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No exercises added yet</Text>
            <Text style={styles.emptyStateSubText}>Tap the button below to add exercises</Text>
          </View>
        ) : (
          exercisesList.map((exercise, exerciseIndex) => 
            exerciseToComponentCB(exercise, exerciseIndex)
          )
        )}
      </ScrollView>
      
      {/* Bottom buttons */}
      <View style={styles.bottomButtonsContainer}>
        {!workoutStarted && (
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={onAddExercise}
          >
            <Text style={styles.addButtonText}>Add Exercise</Text>
          </TouchableOpacity>
        )}
        
        {!workoutStarted && hasExercises ? (
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={startWorkoutACB}
          >
            <Text style={styles.startButtonText}>Start Training Session</Text>
          </TouchableOpacity>
        ) : null}
        
        {/* Finish workout button only shown when workout started */}
        {workoutStarted && (
          <Link href="/report" asChild>
            <TouchableOpacity 
              style={styles.finishButton}
              onPress={finishWorkoutACB}
            >
              <Text style={styles.finishButtonText}>Finish Workout</Text>
            </TouchableOpacity>
          </Link>
        )}
      </View>
      
      {/* Edit Set Modal - only available before workout starts */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible && !workoutStarted}
        onRequestClose={closeModalACB}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Set</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg):</Text>
              <TextInput
                style={styles.modalInput}
                value={editWeight}
                onChangeText={setEditWeight}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reps:</Text>
              <TextInput
                style={styles.modalInput}
                value={editReps}
                onChangeText={setEditReps}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModalACB}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={saveEditedSetACB}
              >
                <Text style={styles.saveModalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionNameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    marginRight: 8,
  },
  sessionNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    padding: 8,
  },
  // Timer styles
  timerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timerDisplay: {
    fontSize: 40,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#333',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  markCompleteButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  markCompleteButtonText: {
    fontSize: 12,
    color: '#555',
  },
  exercisesContainer: {
    flex: 1,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  exerciseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  targetMuscleContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  targetMuscleLabel: {
    fontSize: 14,
    color: '#666',
  },
  targetMuscleValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C63FF',
  },
  setsContainer: {
    marginTop: 8,
  },
  setsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  setsHeader: {
    fontSize: 16,
    fontWeight: '600',
  },
  addSetButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  addSetButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
  },
  setItemContainer: {
    marginBottom: 8,
  },
  setItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f7',
    padding: 12,
    borderRadius: 8,
  },
  completedSetItem: {
    backgroundColor: '#e0f7e0',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  setNumber: {
    fontWeight: '500',
  },
  setDetails: {
    color: '#666',
  },
  setActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 4,
  },
  setActionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  setActionButtonText: {
    fontSize: 12,
    color: '#555',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    color: '#d32f2f',
    fontSize: 12,
  },
  noSetsText: {
    fontStyle: 'italic',
    color: '#999',
    marginTop: 4,
  },
  // Bottom Buttons
  bottomButtonsContainer: {
    marginTop: 16,
  },
  addButton: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  finishButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  finishButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    letterSpacing: 0.5,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#f5f5f7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  saveModalButton: {
    backgroundColor: '#4CAF50',
  },
  saveModalButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});