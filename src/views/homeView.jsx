// src/views/homeView.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, TextInput } from 'react-native';

export function HomeView(props) {
    const { 
      currentTrainingSessionID, 
      trainingSessions, 
      handleSessionPress,
       handleAddNewSessionPress,
       sessionNameModalVisible,
       handleConfirmSessionName,
       handleCancelSessionName,
       newSessionName,
       setNewSessionName,
       handleDeleteSession,
       } 
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
            <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle}>{item.name}</Text>
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSession(item.id)}
                >
                    <Text style={styles.deleteButtonText}>X</Text>
                </TouchableOpacity>
            </View>
            
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

            {/* <View style={styles.badgeContainer}>
                <Text style={styles.badge}>{item.name.split(' ')[0][0]}</Text>
            </View> */}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.screenTitle}>HOME</Text>
            
            {(!trainingSessions || trainingSessions.length === 0) ? (
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>No sessions yet</Text>
                    <Text style={styles.emptyStateSubtext}>Create a new session to get started</Text>
                </View>
            ) : (
                <FlatList
                    data={trainingSessions}
                    renderItem={renderSessionItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )}
            
            <TouchableOpacity 
                style={styles.addButton}
                onPress={()=>handleAddNewSessionPress()}
            >
                <Text style={styles.addButtonText}>+ NEW</Text>
            </TouchableOpacity>

            <Modal
                visible={sessionNameModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={()=>handleCancelSessionName()}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter Session Name</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={newSessionName}
                            onChangeText={setNewSessionName}
                            placeholder="e.g. Core Strength Session"
                            placeholderTextColor="#666"
                            autoFocus={true}
                        />
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalConfirmButton, newSessionName.length === 0 && styles.modalConfirmButtonDisabled]}
                                onPress={handleConfirmSessionName}
                                disabled={newSessionName.length === 0 }
                            >
                                <Text style={styles.modalButtonText}>Confirm</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={handleCancelSessionName}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
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
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    flex: 1,
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
  deleteButton: {
    backgroundColor: 'rgba(250, 18, 18, 0.1)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(250, 18, 18, 0.3)',
  },
  deleteButtonText: {
    color: 'rgba(250, 18, 18, 0.8)',
    fontSize: 14,
    fontWeight: '600',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    width: '65%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalConfirmButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 10,
    flex: 1,
    marginRight: 2.5,
  },
  modalConfirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#F16767',
    borderRadius: 8,
    padding: 10,
    flex: 1,
    marginLeft: 2.5,
  },
  emptyStateContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  }
});