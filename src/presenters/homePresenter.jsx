import { useState, useEffect } from 'react';
import { observer } from "mobx-react-lite";
import { getUserSessions, addNewSession } from '../trainingSessionUtilities';
import { FIREBASE_AUTH } from '../firestoreModel';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HomeView } from '../views/homeView';



export const Home = observer(function HomeRender(props) {
    const { model } = props
    const navigation = useNavigation();
    const [trainingSessions, setTrainingSessions] = useState(model.trainingSessions);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSessionId, setCurrentSessionId] = useState(model.currentTrainingSessionID);
    
//     const [trainingSessions, setTrainingSessions] = useState(
//         global.trainingSessions.map(session => ({
//           ...session,
//           id: session.id.toString(),
//           exerciseCount: session.exercisesList.length
//         }))
//       );
    const sessionChosen = (sessionId) => {
        model.setCurrentTrainingSessionID(sessionId)
    }
    const addNewSession = () => {
        // creating a sample empty session for prototyping
        const newId = Math.max(...global.trainingSessions.map(s => s.id), 0) + 1;
        const newSession = {
            id: newId.toString(),
            name: `New training ${newId}`,
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
        newSessionId = addNewSession();
        sessionChosen(newSessionId);
        navigation.navigate('training', { 
          currentTrainingSessionID:newSessionId 
        });
      };
    return (
        <HomeView
            currentTrainingSessionID={currentSessionId}
            trainingSessions={trainingSessions}
            handleSessionPress={handleSessionPressACB}
            handleAddNewSessionPress={handleAddNewSessionPressACB}
            
        />
    )
})



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

    