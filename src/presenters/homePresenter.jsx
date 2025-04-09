import { useState, useEffect } from 'react';
import { observer } from "mobx-react-lite";
import { getUserSessions, addNewSession } from '../trainingSessionUtilities';
import { FIREBASE_AUTH } from '../firestoreModel';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HomeView } from '../views/homeView';
import { Alert } from 'react-native';


export const Home = observer(function HomeRender(props) {
    const { model } = props
    const navigation = useNavigation();
    //For later use when we integrate with firebase
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    //For the modal for new session name
    const [newSessionName, setNewSessionName] = useState("");
    const [sessionNameModalVisible, setSessionNameModalVisible] = useState(false);


    const sessionChosen = (sessionId) => {
        model.setCurrentTrainingSessionID(sessionId)
    }
    
    const addNewSession = (sessionName) => {
        // creating a sample empty session for prototyping
        const newId = Math.max(...global.trainingSessions.map(s => s.id), 0) + 1;
        const newSession = {
            id: newId.toString(),
            name: sessionName,
            exercisesList: [],
        };
        model.addTrainingSession(newSession);
        return newId;
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
    
    const handleConfirmSessionNameACB = () => {
        // if(!newSessionName || newSessionName.trim() === "") {
        //     Alert.alert("Invalid Session Name", "Please enter a valid session name");
        // }
        setSessionNameModalVisible(false);
        const newSessionId = addNewSession(newSessionName);
        sessionChosen(newSessionId);
        navigation.navigate("training", {
            currentTrainingSessionID: newSessionId
        });
    }
    
    const handleCancelSessionNameACB = () => {
        setSessionNameModalVisible(false);
    }
    
    // For later use when we integrate firebase
    // const loadSessions = useCallback(async () => {
    //     try {
    //         setLoading(true);
    //         const user = FIREBASE_AUTH.currentUser;
    //         if (!user) {
    //             setSessions([]);
    //             return;
    //         }
            
    //         const userSessions = await getUserSessions(user.uid);
    //         setSessions(userSessions);
    //         model.trainingSessions = userSessions;
    //     } catch (error) {
    //         console.error("Error loading sessions:", error);
    //         setError(error.message);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [model]);

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