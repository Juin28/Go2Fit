// src/views/homeView.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';

export function HomeView(props) {
    const { 
      currentTrainingSessionID, 
      trainingSessions, 
      handleSessionPress,
       handleAddNewSessionPress } 
       = props;

    //For later use when we integrate with firebase
    // if (loading) {
    //     return (
    //         <View style={styles.container}>
    //             <ActivityIndicator size="large" color="#007AFF" />
    //         </View>
    //     );
    // }

    // if (error) {
    //     return (
    //         <View style={styles.container}>
    //             <Text style={styles.error}>{error}</Text>
    //         </View>
    //     );
    // }

    const renderSessionItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.sessionItem}
            onPress={() => handleSessionPress(item.id)}
        >
            <Text style={styles.sessionTitle}>{item.name}</Text>
            <Text style={styles.exerciseCount}>
                {item.exerciseCount} exercise{item.exerciseCount !== 1 ? 's' : ''}
            </Text>
            
            <View style={styles.exercisesContainer}>
                {item.exercisesList?.map((exercise, index) => (
                    <View key={`${exercise.id}-${index}`} style={styles.exerciseRow}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        {index < item.exercisesList.length - 1 && 
                            <Text style={styles.dot}>•</Text>
                        }
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
            <Text style={styles.screenTitle}>HOME</Text>
            
            <FlatList
                data={trainingSessions}
                renderItem={renderSessionItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
            />
            
            <TouchableOpacity 
                style={styles.addButton}
                onPress={()=>handleAddNewSessionPress()}
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