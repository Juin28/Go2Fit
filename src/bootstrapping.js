import "./teacherFetch"
import { configure, observable, reaction } from "mobx"
import { model } from "./DinnerModel"
import { connectToPersistence } from "./firestoreModel"

configure({ enforceActions: "never" })

// Make the model reactive with all properties observable
export const reactiveModel = observable(model)

connectToPersistence(reactiveModel, reaction);

// Set up reaction to handle the exercise data when it loads
function checkExerciseDataACB() {
    return reactiveModel.currentExercisePromiseState.data
}

function processExerciseDataACB() {
    reactiveModel.exercisesLoadedEffect()
}

reaction(checkExerciseDataACB, processExerciseDataACB)

// Initialize the model with sample training sessions
function initializeTrainingSessionsACB() {
    const sampleSessions = [
        {
            id: 1,
            name: "Chest Workout Session",
            exercisesList: [
                {
                    id: 1,
                    name: "Bench Press",
                    sets: [
                        { weight: 60, reps: 10 },
                        { weight: 70, reps: 8 },
                        { weight: 80, reps: 6 }
                    ],
                    completedSets: 0,
                    targetMuscles: ["Chest"],
                    bodyParts: ["Chest"],
                    equipments: ["Barbell"]
                }, 
                {
                    id: 2,
                    name: "Push-ups",
                    sets: [
                        { weight: 0, reps: 15 },
                        { weight: 0, reps: 12 },
                        { weight: 0, reps: 10 }
                    ],
                    completedSets: 0,
                    targetMuscles: ["Chest"],
                    bodyParts: ["Chest"],
                    equipments: ["Body weight"]
                }
            ]
        },
        {
            id: 2,
            name: "Leg Workout Session",
            exercisesList: [
                {
                    id: 3,
                    name: "Squats",
                    sets: [
                        { weight: 70, reps: 10 },
                        { weight: 80, reps: 8 },
                        { weight: 90, reps: 6 }
                    ],
                    completedSets: 0,
                    targetMuscles: ["Quadriceps"],
                    bodyParts: ["Legs"],
                    equipments: ["Barbell"]
                }, 
                {
                    id: 4,
                    name: "Lunges",
                    sets: [
                        { weight: 0, reps: 15 },
                        { weight: 0, reps: 12 },
                        { weight: 0, reps: 10 }
                    ],
                    completedSets: 0,
                    targetMuscles: ["Quadriceps"],
                    bodyParts: ["Legs"],
                    equipments: ["Body weight"]
                }
            ]
        }
    ]

    // Add sample sessions to the model
    sampleSessions.forEach(session => {
        reactiveModel.addTrainingSession(session)
    })
}

// Run the initialization
initializeTrainingSessionsACB()

// Safely load exercises with error handling
function safelyLoadExercises() {
    try {
        reactiveModel.loadExercises()
    } catch (error) {
        console.error("Exception during loadExercises:", error)
    }
}

// Perform an initial load of exercises
safelyLoadExercises()

// Update the currentView in model when URL changes (optional)
// You can add navigation events here if needed

// Make the model available globally for testing and debugging
global.myModel = reactiveModel
global.trainingSessions = reactiveModel.trainingSessions