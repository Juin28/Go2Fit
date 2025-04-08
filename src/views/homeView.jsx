// import { StyleSheet, Text, View } from "react-native"
// import { router } from "expo-router"

// export function HomeView(props) {
//   return (
//     <View style={styles.outerContainer}>
//       <Text style={styles.number}>Home Tab</Text>
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

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { setCurrentTrainingSessionID } from '../DinnerModel';

export function HomeView(props) {
  const { sessionChosen } = props;
  const navigation = useNavigation();
  
  // Use the global trainingSessions model with simplified display
  const [trainingSessions, setTrainingSessions] = useState(
    global.trainingSessions.map(session => ({
      ...session,
      id: session.id.toString(),
      exerciseCount: session.exercisesList.length
    }))
  );

  // Handle updates when returning from TrainingView
  useFocusEffect(
    React.useCallback(() => {
      const updateStateIfNeeded = () => {
        // State is already managed globally, so we just need to sync
        setTrainingSessions(
          global.trainingSessions.map(session => ({
            ...session,
            id: session.id.toString(),
            exerciseCount: session.exercisesList.length
          }))
        );
      };
      updateStateIfNeeded();
    }, [])
  );

  // const handleSessionPress = (sessionId) => {
  //   // model.setCurrentTrainingSessionID(sessionId);
  //   sessionChosen(sessionId);
  //   navigation.navigate('training', { 
  //     session: trainingSessions.find(s => s.id === sessionId),
  //     onSave: (updatedSession) => {
  //       setTrainingSessions(prev => prev.map(s => 
  //         s.id === updatedSession.id ? updatedSession : s
  //       ));
  //     }
  //   });
    // navigation.navigate('training', {
    //   session: sessionData,
    //   currentTrainingSessionID: sessionId // or null for new session
    // });
  // };

  // const handleAddNewSession = () => {
  //   const newId = Math.max(...global.trainingSessions.map(s => s.id), 0) + 1;
  //   const newSession = {
  //     id: newId.toString(),
  //     name: `New training ${newId}`,
  //     exercisesList: [],
  //     exerciseCount: 0,
  //     isNew: true
  //   };
    
  //   setTrainingSessions(prev => [...prev, newSession]);
  //   navigation.navigate('training', { 
  //     session: newSession,
  //     onSave: (updatedSession) => {
  //       setTrainingSessions(prev => prev.map(s => 
  //         s.id === updatedSession.id ? {
  //           ...updatedSession,
  //           isNew: false
  //         } : s
  //       ));
  //     }
  //   });
  // };

  const handleSessionPress = (sessionId) => {
    sessionChosen(sessionId);
    navigation.navigate('training', { 
      // session: trainingSessions.find(s => s.id === sessionId),
      currentTrainingSessionID: sessionId
    });
  };

  const handleAddNewSession = () => {
    const newId = Math.max(...global.trainingSessions.map(s => s.id), 0) + 1;
    const newSession = {
      id: newId.toString(),
      name: `New training ${newId}`,
      exercisesList: [],
      exerciseCount: 0,
      isNew: true
    };
    
    navigation.navigate('training', { 
      // session: newSession,
      currentTrainingSessionID: null // Mark as new session
    });
  };

  const renderSessionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.sessionItem}
      onPress={() => handleSessionPress(item.id)}
    >
      <Text style={styles.sessionTitle}>{item.name}</Text>
      <Text style={styles.exerciseCount}>{item.exerciseCount} exercise{item.exerciseCount !== 1 ? 's' : ''}</Text>
      
      <View style={styles.exercisesContainer}>
        {item.exercisesList?.map((exercise, index) => (
          <View key={`${exercise.id}-${index}`} style={styles.exerciseRow}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            {index < item.exercisesList.length - 1 && <Text style={styles.dot}>•</Text>}
          </View>
        ))}
      </View>
      
      <View style={styles.badgeContainer}>
        <Text style={styles.badge}>{item.name.split(' ')[0][0]}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>HOMEee</Text>
      
      <FlatList
        data={trainingSessions}
        renderItem={renderSessionItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddNewSession}
      >
        <Text style={styles.addButtonText}>+ NEW</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    // marginTop: 50,
    paddingTop: 50,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#000',
  },
  listContainer: {
    paddingBottom: 20,
  },
  sessionItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  exerciseCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 18,
  },
  exercisesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 16,
    color: '#444',
  },
  dot: {
    fontSize: 16,
    color: '#444',
    marginHorizontal: 8,
  },
  badgeContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40, 
    height: 40,
    backgroundColor: '#000000',
    borderRadius: 20, 
    justifyContent: 'center',
    alignItems: 'center', 
    display: 'flex', 
  },
  badge: {
    fontWeight: 'bold',
    color: '#FFFFFF',
},
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});