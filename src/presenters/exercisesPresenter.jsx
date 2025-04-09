import { observer } from "mobx-react-lite"
import { ExercisesView } from "../views/exercisesView"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Alert } from "react-native"

export const Exercises = observer(function Exercises({ model }) {
    const router = useRouter()
    const params = useLocalSearchParams()
    
    // Check if we're in "add to training" mode by looking for sessionID parameter
    const isAddToTrainingMode = Boolean(params.sessionID)
    
    // Function to handle when user selects an exercise
    function handleExerciseSelectedACB(exercise) {
        try {
            console.log("User selected exercise object:", exercise)
            
            // Log properties for debugging
            console.log("Exercise name:", exercise?.name)
            console.log("isAddToTrainingMode:", isAddToTrainingMode)
            
            // Create a safe copy of the exercise with guaranteed array properties
            const safeExercise = {
                ...exercise,
                name: exercise?.name || "Unnamed Exercise",
                targetMuscles: Array.isArray(exercise?.targetMuscles) ? [...exercise.targetMuscles] : [],
                bodyParts: Array.isArray(exercise?.bodyParts) ? [...exercise.bodyParts] : [],
                equipments: Array.isArray(exercise?.equipments) ? [...exercise.equipments] : [],
                secondaryMuscles: Array.isArray(exercise?.secondaryMuscles) ? [...exercise.secondaryMuscles] : []
            }
            
            // If we're in add to training mode, add the exercise and navigate back
            if (isAddToTrainingMode) {
                console.log("Adding exercise to training session")
                
                try {
                    // Add the exercise to the current training session
                    model.addExerciseToCurrentSession(safeExercise)
                    console.log("Exercise added successfully")
                } catch (addError) {
                    console.error("Error in addExerciseToCurrentSession:", addError)
                    throw addError
                }
                
                try {
                    // Change the current view in the model
                    model.setCurrentView("training")
                    console.log("Current view set to training")
                } catch (viewError) {
                    console.error("Error in setCurrentView:", viewError)
                    throw viewError
                }
                
                try {
                    // Navigate to training screen
                    console.log("Attempting to navigate to training screen")
                    router.replace("/training")
                    console.log("Navigation completed")
                } catch (navError) {
                    console.error("Error during navigation:", navError)
                    throw navError
                }
            } else {
                // Just handle viewing the exercise details
                console.log("Viewing exercise details (not adding to training)")
                // You could navigate to a details page or show a modal
                // router.push({pathname: "/exercise-details", params: {exerciseId: exercise.exerciseId}})
            }
        } catch (error) {
            console.error("Error handling exercise selection:", error)
            Alert.alert("Error", "Failed to process exercise: " + error.message)
        }
    }
    
    return (
        <ExercisesView 
            onExerciseSelected={handleExerciseSelectedACB}
            allExercises={model?.allExercises || []}
            isAddToTrainingMode={isAddToTrainingMode}
            currentSessionID={params.sessionID}
        />
    )
})