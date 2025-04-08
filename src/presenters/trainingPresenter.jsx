import { observer } from "mobx-react-lite"
import { TrainingView } from "../views/trainingView"
import { useState } from "react"
import { useRouter } from "expo-router"

export const Training = observer(function Training({ model }) {
    const [error, setError] = useState(null)
    const router = useRouter()
    
    // Get the current training session
    let currentSession = null
    try {
        if (model?.currentTrainingSessionID && model?.trainingSessions) {
            currentSession = model.trainingSessions.find(
                s => s.id.toString() === model.currentTrainingSessionID.toString()
            )
        }
    } catch (err) {
        console.error("Error retrieving current session:", err)
        setError("Failed to retrieve training session")
    }
    
    function handleAddExerciseACB() {
        try {
            // Change current view in model
            model.setCurrentView("exercises")
            
            // Navigate to exercises
            router.replace("/exercises")
        } catch (err) {
            console.error("Navigation error:", err)
            setError("Failed to navigate to exercises")
        }
    }
    
    function handleSaveSessionACB(session) {
        try {
            if (!model) {
                console.error("Model is undefined")
                setError("Model is undefined")
                return
            }
            
            // Find if this session already exists
            const sessionIndex = model.trainingSessions.findIndex(
                s => s.id.toString() === session.id.toString()
            )
            
            if (sessionIndex !== -1) {
                // Update existing session
                model.trainingSessions[sessionIndex] = session
            } else {
                // Add as new session
                model.addTrainingSession(session)
            }
        } catch (err) {
            console.error("Error saving session:", err)
            setError("Failed to save training session")
        }
    }
    
    return (
        <TrainingView
            session={currentSession}
            onAddExercise={handleAddExerciseACB}
            onSave={handleSaveSessionACB}
            error={error}
        />
    )
})