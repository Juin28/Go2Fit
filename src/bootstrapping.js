import "./teacherFetch"
import { configure, observable, reaction } from "mobx"
import { model } from "./DinnerModel"
import { connectToPersistence, disconnectFromPersistence } from "./firestoreModel"
import { FIREBASE_AUTH } from "./firestoreModel"
configure({ enforceActions: "never" })

// Make the model reactive with all properties observable
export const reactiveModel = observable(model)

// Initialize model with loading state
reactiveModel.isAuthenticated = false;
reactiveModel.isLoading = true;
reactiveModel.trainingSessions = [];
reactiveModel.ready = false;
reactiveModel.userId = null;

// Create a function to wait for auth state
function waitForAuth() {
    return new Promise((resolve) => {
        const unsubscribe = FIREBASE_AUTH.onAuthStateChanged((user) => {
            if (user) {
                console.log("User is signed in:", user.uid);
                reactiveModel.setUserID(user.uid);
                reactiveModel.isAuthenticated = true;
            } else {
                console.log("No user signed in");
                reactiveModel.setUserID(null);
                // console.log("No user signed in, setting isAuthenticated to false");
                reactiveModel.isAuthenticated = false;
                // console.log("No user signed in, setting trainingSessions to empty array");
                reactiveModel.trainingSessions = [];
            }
            reactiveModel.isLoading = false;
            // console.log("Set loading to false");
            unsubscribe(); // Unsubscribe from the initial check
            // console.log("Unsubscribed from the initial check");
            resolve(); // Resolve the promise after auth state is determined
            // console.log("Resolved the promise");
        });
    });
}

// Initialize the app
async function initializeApp() {
    console.log("Initializing app...");
    reactiveModel.ready = false;

    // Set up auth state listener
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(async (user) => {
        console.log("Auth state changed:", user ? "User logged in" : "No user");
        reactiveModel.isAuthenticated = !!user;
        reactiveModel.userId = user?.uid || null;

        if (user) {
            console.log("User is authenticated, connecting to persistence");
            connectToPersistence(reactiveModel, reaction);
        } else {
            console.log("No user logged in, disconnecting from persistence");
            disconnectFromPersistence();
            reactiveModel.trainingSessions = [];
            reactiveModel.ready = true;
        }
    });

    return unsubscribe;
}

// Start initialization
console.log("Starting initialization");
initializeApp();
console.log("Reactive model state:", reactiveModel);

// // Set up ongoing auth state monitoring
// FIREBASE_AUTH.onAuthStateChanged((user) => {
//     console.log("Auth state changed:", user);
//     if (user) {
//         reactiveModel.setUserID(user.uid);
//         reactiveModel.isAuthenticated = true;
//         connectToPersistence(reactiveModel, reaction);
//     } else {
//         reactiveModel.setUserID(null);
//         reactiveModel.isAuthenticated = false;
//         reactiveModel.trainingSessions = [];
//     }
// });

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
// initializeTrainingSessionsACB()

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
// global.trainingSessions = reactiveModel.trainingSessions