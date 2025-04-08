import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  TextInput,
  Alert
} from 'react-native';

export function TrainingView({ session, onAddExercise, onSave, error }) {
  const [sessionName, setSessionName] = useState(session?.name || 'New Training Session');
  
  console.log("TrainingView rendered with session:", session);
  
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

  // Ensure exercisesList exists and is an array
  const exercisesList = Array.isArray(session.exercisesList) ? session.exercisesList : [];
  console.log("Exercises list:", exercisesList);
  
  // Handle saving the session
  const handleSave = () => {
    const updatedSession = {
      ...session,
      name: sessionName,
    };
    onSave(updatedSession);
    Alert.alert('Success', 'Training session saved!');
  };
  
  // Calculate completion percentage safely
  const calculateCompletion = () => {
    if (!Array.isArray(exercisesList) || exercisesList.length === 0) {
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
  
  // Get completion percentage
  const completionPercentage = calculateCompletion();
  
  // Toggle set completion
  const toggleSetCompletion = (exerciseIndex, setIndex) => {
    if (!session || !Array.isArray(session.exercisesList)) {
      console.error("Cannot toggle set: invalid session or exercisesList");
      return;
    }
    
    const exercise = session.exercisesList[exerciseIndex];
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
    
    // Force re-render
    if (onSave) {
      onSave({ ...session });
    }
  };
  
  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <View style={styles.header}>
        <TextInput
          style={styles.sessionNameInput}
          value={sessionName}
          onChangeText={setSessionName}
          placeholder="Session Name"
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
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
        <Text style={styles.progressText}>{completionPercentage}% complete</Text>
      </View>
      
      <ScrollView style={styles.exercisesContainer}>
        {exercisesList.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No exercises added yet</Text>
            <Text style={styles.emptyStateSubText}>Tap the button below to add exercises</Text>
          </View>
        ) : (
          exercisesList.map((exercise, exerciseIndex) => (
            <View key={exercise.id || exerciseIndex} style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{exercise.name || 'Unnamed Exercise'}</Text>
              
              {Array.isArray(exercise.targetMuscles) && exercise.targetMuscles.length > 0 && (
                <View style={styles.targetMuscleContainer}>
                  <Text style={styles.targetMuscleLabel}>Target: </Text>
                  <Text style={styles.targetMuscleValue}>{exercise.targetMuscles.join(', ')}</Text>
                </View>
              )}
              
              <View style={styles.setsContainer}>
                <Text style={styles.setsHeader}>Sets:</Text>
                
                {Array.isArray(exercise.sets) ? (
                  exercise.sets.map((set, setIndex) => (
                    <TouchableOpacity
                      key={setIndex}
                      style={[
                        styles.setItem,
                        (exercise.completedSets || 0) > setIndex && styles.completedSetItem
                      ]}
                      onPress={() => toggleSetCompletion(exerciseIndex, setIndex)}
                    >
                      <Text style={styles.setNumber}>Set {setIndex + 1}</Text>
                      <Text style={styles.setDetails}>
                        {set.weight > 0 ? `${set.weight} kg × ` : ''}{set.reps} reps
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noSetsText}>No sets defined</Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={onAddExercise}
      >
        <Text style={styles.addButtonText}>Add Exercise</Text>
      </TouchableOpacity>
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
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
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
  setsHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  setItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
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
  noSetsText: {
    fontStyle: 'italic',
    color: '#999',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  }
});