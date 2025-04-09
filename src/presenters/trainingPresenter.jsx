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
        try {
            // Change current view in model
            model.setCurrentView("exercises");
            
            // Navigate to exercises
            router.replace("/exercises");
        } catch (err) {
            console.error("Navigation error:", err);
            setError("Failed to navigate to exercises");
        }
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
            
            // Find if this session already exists
            const sessionIndex = model.trainingSessions.findIndex(
                s => s.id.toString() === session.id.toString()
            );
            
            if (sessionIndex !== -1) {
                // Create new array of sessions (important for reactivity)
                const updatedSessions = [...model.trainingSessions];
                
                // Replace session in the array
                updatedSessions[sessionIndex] = session;
                
                // Set the entire updated array back to the model
                model.trainingSessions = updatedSessions;
            } else {
                // Add as new session
                model.addTrainingSession(session);
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