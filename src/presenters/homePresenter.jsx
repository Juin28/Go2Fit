import { useState, useEffect } from 'react';
import { observer } from "mobx-react-lite";
import { getUserSessions, addNewSessionToFireStore } from '../trainingSessionUtilities';
import { FIREBASE_AUTH } from '../firestoreModel';
import { useNavigation } from '@react-navigation/native';
import { HomeView } from '../views/homeView';
import { Alert } from 'react-native';

export const Home = observer(function HomeRender(props) {
    const { model } = props;
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newSessionName, setNewSessionName] = useState("");
    const [sessionNameModalVisible, setSessionNameModalVisible] = useState(false);

    const sessionChosen = (sessionId) => {
        model.setCurrentTrainingSessionID(sessionId);
    };

    // Load sessions when authentication state changes
    useEffect(() => {
        const loadSessions = async () => {
            try {
                setLoading(true);
                if (!model.isAuthenticated) {
                    console.log("User not authenticated, clearing sessions");
                    model.trainingSessions = [];
                    return;
                }
                
                console.log("Loading sessions for user:", model.userId);
                const userSessions = await getUserSessions(model.userId);
                console.log("Loaded sessions:", userSessions);
                model.trainingSessions = userSessions;
            } catch (error) {
                console.error("Error loading sessions:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadSessions();
    }, [model.isAuthenticated]);

    // Debug logging
    useEffect(() => {
        console.log("Home component - Current model state:", {
            isAuthenticated: model.isAuthenticated,
            userId: model.userId,
            isLoading: model.isLoading,
            ready: model.ready
        });
    }, [model.isAuthenticated, model.userId, model.isLoading, model.ready]);

    async function addNewSession(sessionName) {
        try {
            const newSession = {
                name: sessionName,
                exercisesList: [],
            };

            let newSessionId;
            
            // If user is authenticated, save to Firestore
            if (model.userId) {
                newSessionId = await addNewSessionToFireStore(model.userId, newSession);
                newSession.id = newSessionId; // Use Firestore ID
            } else {
                // Local only - generate temporary ID
                newSessionId = Date.now().toString();
                newSession.id = newSessionId;
            }

            model.addTrainingSession(newSession);
            return newSessionId;
        } catch (error) {
            console.error("Error adding new session:", error);
            Alert.alert("Error", "Failed to create new session");
            throw error; // Re-throw to handle in the calling function
        }
    }
    

    const handleSessionPressACB = (sessionId) => {
        sessionChosen(sessionId);
        navigation.navigate('training', { 
          currentTrainingSessionID: sessionId //doesnt matter pass or not cuz the model data is already updated
        });
    };
    
    const handleAddNewSessionPressACB = () => {
        setSessionNameModalVisible(true);
    }
    
    const handleConfirmSessionNameACB = async () => {
        if(!newSessionName || newSessionName.trim() === "") {
            Alert.alert("Invalid Session Name", "Please enter a valid session name");
            return;
        }
        setSessionNameModalVisible(false);
        setLoading(true);
        try {
            const newSessionId = await addNewSession(newSessionName.toString());
            sessionChosen(newSessionId);
            navigation.navigate("training", {
                currentTrainingSessionID: newSessionId
            });
        } catch(error) {
            console.error("Error adding new session:", error);
            Alert.alert("Error", "Failed to create new session");
        } finally {
            setLoading(false);
        }
    }
    
    const handleCancelSessionNameACB = () => {
        setSessionNameModalVisible(false);
    }
    
    // Prepare training sessions with exerciseCount property
    const sessionsWithExerciseCount = model.trainingSessions.map(session => ({
        ...session,
        id: session.id.toString(),
        exerciseCount: Array.isArray(session.exercisesList) ? session.exercisesList.length : 0
    }));
        
    return (
        <HomeView
            currentTrainingSessionID={model.currentTrainingSessionID}
            trainingSessions={sessionsWithExerciseCount}
            sessionNameModalVisible={sessionNameModalVisible}
            handleSessionPress={handleSessionPressACB}
            handleAddNewSessionPress={handleAddNewSessionPressACB}
            handleConfirmSessionName={handleConfirmSessionNameACB}
            handleCancelSessionName={handleCancelSessionNameACB}
            setNewSessionName={setNewSessionName}
            newSessionName={newSessionName}
        />
    )
})