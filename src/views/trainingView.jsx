// import { StyleSheet, Text, View } from "react-native"
// import { router } from "expo-router"

// export function TrainingView(props) {
//   return (
//     <View style={styles.outerContainer}>
//       <Text style={styles.number}>Training Tab</Text>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   outerContainer: {
//     padding: 16,
//     margin: 50,
//     borderRadius: 8,
//     width: "90%",
//     maxWidth: "90%",
//     alignSelf: "center",
//   },
//   number: {
//     fontSize: 24,
//     fontWeight: "bold",
//   },
// })

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
  Button
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export function TrainingView() {
  const navigation = useNavigation();
  const route = useRoute();
  // const { currentTrainingSessionID } = route.params || null;
  const { currentTrainingSessionID } = route.params || { currentTrainingSessionID: null };

  const [session, setSession] = useState(() => {
    if (currentTrainingSessionID === null) {
      const newId = Math.max(...global.trainingSessions.map(s => s.id), 0) + 1;
      const newSession = {
        id: newId.toString(),
        name: `New training ${newId}`,
        exercisesList: [],
        exerciseCount: 0,
        isNew: true
      };
      return {
        ...newSession,
        exercisesList: [],
        isTraining: false,
        startTime: null,
        elapsedTime: '00:00',
        isNew: true
      };
    } else {
      const existingSession = global.trainingSessions.find(
        s => s.id.toString() === currentTrainingSessionID?.toString()
      );
      return {
        ...existingSession,
        isTraining: false,
        startTime: null,
        elapsedTime: '00:00',
        isNew: false
      };
    }
  });

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetInExerciseIndex, setCurrentSetInExerciseIndex] = useState(0);

  var totalNumberOfSets = 0;

  useEffect(() => {
    if (currentTrainingSessionID !== null) {
      const existingSession = global.trainingSessions.find(
        s => s.id.toString() === currentTrainingSessionID?.toString()
      );
      if (existingSession) {
        setSession({
          ...existingSession,
          isTraining: false,
          startTime: null,
          elapsedTime: '00:00',
          isNew: false
        });
      }
    }

    setCurrentExerciseIndex(0);
    setCurrentSetInExerciseIndex(0);
    
    totalNumberOfSets = 0;
    // Calculate the total number of sets
    session.exercisesList.forEach(exercise => {
      totalNumberOfSets += exercise.sets.length;
    });

  }, [currentTrainingSessionID]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(session.name);
  const [showRepsModal, setShowRepsModal] = useState(false);
  const [currentReps, setCurrentReps] = useState(5);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);

  // Timer logic
  useEffect(() => {
    let interval;
    if (session.isTraining) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now - new Date(session.startTime);
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setSession(prev => ({
          ...prev,
          elapsedTime: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [session.isTraining, session.startTime]);

  const handleAddExercise = () => {
    navigation.navigate('exercises', {
      onSelect: (exercise) => {
        setSession(prev => {
          const newExercisesList = [...prev.exercisesList, {
            id: Date.now().toString(),
            name: exercise.name,
            sets: [{ weight: 0, reps: 5 }],
            completedSets: 0
          }];
          return {
            ...prev,
            exercisesList: newExercisesList,
            isNew: false
          };
        });
      }
    });
  };

  const handleAddSet = (exerciseId) => {
    setSession(prev => {
      const updatedExercisesList = prev.exercisesList.map(ex =>
        ex.id === exerciseId
          ? { ...ex, sets: [...ex.sets, { weight: 0, reps: 5 }] }
          : ex
      );
      return {
        ...prev,
        exercisesList: updatedExercisesList
      };
    });
  };

  const handleRepsChange = (setIndex) => {
    setSession(prev => {
      const updatedExercisesList = prev.exercisesList.map(ex => {
        const updatedSets = [...ex.sets];
        updatedSets[setIndex] = {
          ...updatedSets[setIndex],
          reps: currentReps,
          weight: currentWeight
        };
        return { ...ex, sets: updatedSets };
      });
      return {
        ...prev,
        exercisesList: updatedExercisesList
      };
    });
    setShowRepsModal(false);
  };

  // const handleLogNextSet = () => {
  //   setSession(prev => {
  //     const updatedExercisesList = prev.exercisesList.map(ex => {
  //       if (ex.completedSets < ex.sets.length) {
  //         return { ...ex, completedSets: ex.completedSets + 1 };
  //       }
  //       return ex;
  //     });

  //     const allExercisesComplete = updatedExercisesList.every(ex =>
  //       ex.completedSets === ex.sets.length
  //     );

  //     return {
  //       ...prev,
  //       exercisesList: updatedExercisesList,
  //       isTraining: !allExercisesComplete
  //     };
  //   });
  // };
  const handleLogNextSet = () => {
    setSession(prev => {
      const updatedExercisesList = [...prev.exercisesList];
      
      // Mark current set as completed
      if (currentExerciseIndex < updatedExercisesList.length) {
        const currentExercise = updatedExercisesList[currentExerciseIndex];
        
        // Move to next set in current exercise
        if (currentSetInExerciseIndex < currentExercise.sets.length - 1) {
          setCurrentSetInExerciseIndex(currentSetInExerciseIndex + 1);
          currentExercise.completedSets += 1;
        } 
        // Move to next exercise if all sets in current exercise are done
        else if (currentExerciseIndex < updatedExercisesList.length - 1) {
          setCurrentExerciseIndex(currentExerciseIndex + 1);
          setCurrentSetInExerciseIndex(0);
          currentExercise.completedSets += 1;
        }
        // All exercises are complete
        else {
          // setCurrentExerciseIndex(0);
          // setCurrentSetInExerciseIndex(0);

          // const existingSession = global.trainingSessions.find(
          //   s => s.id.toString() === currentTrainingSessionID?.toString()
          // );
          // setSession({
          //   ...existingSession,
          //   isTraining: false,
          //   startTime: null,
          //   elapsedTime: '00:00',
          //   isNew: false
          // });
          
          return {
            ...prev,
            isTraining: false
          };
        }
      }

      return {
        ...prev,
        exercisesList: updatedExercisesList
      };
    });
  };

  useEffect(() => {
    if (!session.isTraining) {
      setCurrentExerciseIndex(0);
      setCurrentSetInExerciseIndex(0);
  
      totalNumberOfSets = 0;
      // Calculate the total number of sets
      session.exercisesList.forEach(exercise => {
        totalNumberOfSets += exercise.sets.length;
      });
  
      const existingSession = global.trainingSessions.find(
        s => s.id.toString() === currentTrainingSessionID?.toString()
      );
      setSession({
        ...existingSession,
        isTraining: false,
        startTime: null,
        elapsedTime: '00:00',
        isNew: false
      });

      // Reset the completed sets for each exercise
      const updatedExercisesList = session.exercisesList.map(ex => ({
        ...ex,
        completedSets: 0
      }));
      setSession(prev => ({
        ...prev,
        exercisesList: updatedExercisesList
      }));
    }
    
  }, [session.isTraining])

  // const handleSave = () => {
  //   if (onSave) {
  //     const savedSession = {
  //       ...session,
  //       isNew: false
  //     };

  //     // If it's a new session, add it to the global model
  //     if (session.isNew) {
  //       const newId = global.trainingSessions.length > 0 
  //         ? Math.max(...global.trainingSessions.map(s => s.id)) + 1 
  //         : 1;
  //       savedSession.id = newId;
  //       global.trainingSessions.push(savedSession);
  //     } else {
  //       // Update existing session in the global model
  //       const index = global.trainingSessions.findIndex(s => s.id === session.id);
  //       if (index !== -1) {
  //         global.trainingSessions[index] = savedSession;
  //       }
  //     }

  //     onSave(savedSession);
  //   }
  //   navigation.goBack();
  // };
  const handleSave = () => {
    const savedSession = {
      ...session,
      isNew: false
    };

    if (session.isNew) {
      const newId = global.trainingSessions.length > 0
        ? Math.max(...global.trainingSessions.map(s => s.id)) + 1
        : 1;
      savedSession.id = newId;
      global.trainingSessions.push(savedSession);
    } else {
      const index = global.trainingSessions.findIndex(
        s => s.id.toString() === session.id.toString()
      );
      if (index !== -1) {
        global.trainingSessions[index] = savedSession;
      }
    }

    // Navigate back with the updated session data
    navigation.navigate({
      name: 'index',
      params: { updatedSession: savedSession },
      merge: true
    });
  };

  const handleStartTraining = () => {
    setSession(prev => ({
      ...prev,
      isTraining: true,
      startTime: new Date(),
      exercisesList: prev.exercisesList.map(ex => ({
        ...ex,
        completedSets: 0
      }))
    }));
  };

  const handleFinishTraining = () => {
    setSession(prev => ({
      ...prev,
      isTraining: false,
      startTime: null
    }));
  };

  const renderExerciseItem = ({ item, index }) => {
    const isCurrentExercise = session.isTraining && index === currentExerciseIndex;
    const allSetsCompleted = item.completedSets === item.sets.length;
    const exerciseCompleted = allSetsCompleted && session.isTraining;

    return (
      <View style={[
        styles.exerciseContainer,
        exerciseCompleted && styles.completedExerciseContainer,
        isCurrentExercise && styles.currentExerciseContainer
      ]}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.setsDone}>{item.completedSets}/{item.sets.length} Done</Text>

        {item.sets.map((set, setIndex) => {
          const isCurrentSet = isCurrentExercise && setIndex === currentSetInExerciseIndex;
          const setCompleted = setIndex < item.completedSets;
          
          return (
            <View key={setIndex} style={[
              styles.setContainer,
              setCompleted && styles.completedSetContainer,
              isCurrentSet && styles.currentSetContainer
            ]}>
              <Text style={styles.setNumber}>{setIndex + 1}</Text>
              <TouchableOpacity
                style={styles.repsContainer}
                onPress={() => {
                  setCurrentReps(set.reps);
                  setCurrentWeight(set.weight);
                  setCurrentSetIndex(setIndex);
                  setShowRepsModal(true);
                }}
              >
                <Text style={styles.repsNumber}>{set.reps}</Text>
                <Text style={styles.repsLabel}>Reps</Text>
                {set.weight > 0 && (
                  <Text style={styles.weightText}> @ {set.weight}kg</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}

        {!session.isTraining && (
          <TouchableOpacity
            style={styles.addSetButton}
            onPress={() => handleAddSet(item.id)}
          >
            <Text style={styles.addSetText}>+ Add a set</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };


  // TODO: Implement a proper check for changes
  const hasChanges = session.isNew;
  // const hasChanges = session.exercisesList.some(ex => 
  //   ex.sets.some(set => set.reps !== 5 || set.weight !== 0) || 
  //   ex.completedSets > 0 ||
  //   session.isNew
  // );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.sessionHeader}>
          {isEditingName ? (
            <TextInput
              style={styles.sessionTitleInput}
              value={tempName}
              onChangeText={setTempName}
              onBlur={() => {
                setSession(prev => ({ ...prev, name: tempName }));
                setIsEditingName(false);
              }}
              autoFocus
            />
          ) : (
            <TouchableOpacity onPress={() => setIsEditingName(true)}>
              <Text style={styles.sessionTitle}>{session.name}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.time}>{session.elapsedTime}</Text>
        </View>
        {session.isTraining && (
          <TouchableOpacity
            style={styles.finishButton}
            onPress={handleFinishTraining}
          >
            <Text style={styles.finishText}>FINISH</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={session.exercisesList}
        renderItem={renderExerciseItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.exercisesList}
      />


      {!session.isTraining && (
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={handleAddExercise}
        >
          <Text style={styles.addExerciseText}>+ Add exercises</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[
          styles.actionButton,
          session.isTraining && styles.logNextButton
        ]}
        onPress={session.isTraining ? handleLogNextSet :
          hasChanges || session.isNew ? handleSave : handleStartTraining}
      >
        <Text style={styles.actionButtonText}>
          {session.isTraining ? 'LOG NEXT SET' :
            hasChanges || session.isNew ? 'SAVE CHANGES' : 'START TRAINING'}
        </Text>
      </TouchableOpacity>

      {/* Reps Modal */}
      <Modal
        visible={showRepsModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Details</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Reps:</Text>
              <TextInput
                style={styles.repsInput}
                keyboardType="numeric"
                value={currentReps.toString()}
                onChangeText={(text) => setCurrentReps(parseInt(text) || 0)}
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Weight (kg):</Text>
              <TextInput
                style={styles.repsInput}
                keyboardType="numeric"
                value={currentWeight.toString()}
                onChangeText={(text) => setCurrentWeight(parseInt(text) || 0)}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowRepsModal(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => handleRepsChange(currentSetIndex)}
              >
                <Text style={styles.saveText}>Save</Text>
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
    padding: 16,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  header: {
    marginBottom: 20,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sessionTitleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
  },
  time: {
    fontSize: 16,
    color: '#666',
  },
  finishButton: {
    alignSelf: 'flex-end',
    padding: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 4,
    marginTop: 8,
  },
  finishText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  exercisesList: {
    paddingBottom: 16,
  },
  exerciseContainer: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  setsDone: {
    color: '#666',
    marginBottom: 12,
  },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
    borderRadius: 8,
    paddingLeft: 16,
    marginBottom: 8,
  },
  setNumber: {
    width: 24,
    fontSize: 16,
  },
  repsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  repsNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 4,
  },
  repsLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  weightText: {
    fontSize: 14,
    color: '#666',
  },
  addSetButton: {
    padding: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addSetText: {
    color: '#007AFF',
  },
  addExerciseButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginVertical: 8,
  },
  addExerciseText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  actionButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#34C759',
    borderRadius: 8,
    marginVertical: 8,
  },
  logNextButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputLabel: {
    width: 100,
    fontSize: 16,
  },
  repsInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    flex: 1,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  saveText: {
    color: '#000000',
  },
  completedSetContainer: {
    backgroundColor: '#1FD655',
    // backgroundColor: '#008631',
    // backgroundColor: '#00C04B',
  },
  currentSetContainer: {
    backgroundColor: '#83F28F',
  },
  completedExerciseContainer: {
    backgroundColor: '#1FD655',
  },
  currentExerciseContainer: {
    borderWidth: 2,
  },
});