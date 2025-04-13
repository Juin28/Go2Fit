import { observer } from "mobx-react-lite"
import { TrainingView } from "../views/trainingView"
import { useState, useEffect } from "react"
import { useRouter } from "expo-router"

export const Training = observer(function Training({ model }) {
    const [error, setError] = useState(null)
    const router = useRouter()
    
    // IMPORTANT: Log when this component re-renders
    console.log("Training presenter rendering");
    
    // Get the current training session directly from the model on each render
    let currentSession = null;
    try {
        if (model?.currentTrainingSessionID && model?.trainingSessions) {
            currentSession = model.getCurrentSession(model.currentTrainingSessionID);
            console.log("Training presenter: current session has", 
                       currentSession?.exercisesList?.length || 0, "exercises");
        }
    } catch (err) {
        console.error("Error retrieving current session:", err);
        setError("Failed to retrieve training session");
    }
    
    function handleAddExerciseACB() {
        // Navigate to exercises with the sessionID as a parameter
        router.push({
          pathname: "/exercises",
          params: { sessionID: currentSession.id }  // Pass just the sessionID
        });
      }
    
    function handleSaveSessionACB(session) {
        try {
            if (!model) {
                console.error("Model is undefined");
                setError("Model is undefined");
                return;
            }
            
            console.log("handleSaveSessionACB: Saving session with", 
                       session.exercisesList?.length || 0, "exercises");
            
            // Create a deep clone to ensure reactivity
            const sessionToSave = JSON.parse(JSON.stringify(session));
            
            // Find if this session already exists
            const sessionIndex = model.trainingSessions.findIndex(
                s => s.id.toString() === session.id.toString()
            );
            
            if (sessionIndex !== -1) {
                // Create new array of sessions (important for reactivity)
                const updatedSessions = [...model.trainingSessions];
                
                // Replace session in the array
                updatedSessions[sessionIndex] = sessionToSave;
                
                // Set the entire updated array back to the model
                model.trainingSessions = updatedSessions;
                
                // Ensure currentTrainingSessionID is set correctly
                model.setCurrentTrainingSessionID(session.id);
                
                console.log("Session updated in model:", sessionToSave);
            } else {
                // Add as new session
                model.addTrainingSession(sessionToSave);
                console.log("Session added to model:", sessionToSave);
            }
            
        } catch (err) {
            console.error("Error saving session:", err);
            setError("Failed to save training session");
        }
    }
    
    return (
        <TrainingView
            session={currentSession}
            onAddExercise={handleAddExerciseACB}
            onSave={handleSaveSessionACB}
            error={error}
            getCurrentSession={(id) => model.getCurrentSession(id)}
        />
    );
});