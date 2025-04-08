import { observer } from "mobx-react-lite"
import { ExercisesView } from "../views/exercisesView"
import { useRouter } from "expo-router"
import { Alert } from "react-native"

export const Exercises = observer(function Exercises({ model }) {
    const router = useRouter()
    
    // Function to handle when user selects an exercise
    function handleExerciseSelectedACB(exercise) {
        try {
            console.log("User selected exercise object:", exercise)
            
            // Log properties for debugging
            console.log("Exercise name:", exercise?.name)
            console.log("Exercise targetMuscles:", exercise?.targetMuscles)
            console.log("Exercise bodyParts:", exercise?.bodyParts)
            console.log("Exercise equipments:", exercise?.equipments)
            console.log("Exercise secondaryMuscles:", exercise?.secondaryMuscles)
            
            // Create a safe copy of the exercise with guaranteed array properties
            const safeExercise = {
                ...exercise,
                name: exercise?.name || "Unnamed Exercise",
                targetMuscles: Array.isArray(exercise?.targetMuscles) ? [...exercise.targetMuscles] : [],
                bodyParts: Array.isArray(exercise?.bodyParts) ? [...exercise.bodyParts] : [],
                equipments: Array.isArray(exercise?.equipments) ? [...exercise.equipments] : [],
                secondaryMuscles: Array.isArray(exercise?.secondaryMuscles) ? [...exercise.secondaryMuscles] : []
            }
            
            console.log("Safe exercise object created:", safeExercise)
            
            // Debug model state before adding exercise
            console.log("Current training session ID before:", model?.currentTrainingSessionID)
            console.log("Number of training sessions before:", model?.trainingSessions?.length)
            
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
        } catch (error) {
            console.error("Error handling exercise selection:", error)
            Alert.alert("Error", "Failed to add exercise to training session: " + error.message)
        }
    }
    
    return (
        <ExercisesView 
            onExerciseSelected={handleExerciseSelectedACB}
            allExercises={model?.allExercises || []}
        />
    )
})