// initialize Firebase app
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig.js";
import { getAuth } from "firebase/auth";
import { editSession, getUserSessions } from "./trainingSessionUtilities";

const app = initializeApp(firebaseConfig);

// initialize Firestore
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
const db = getFirestore(app);


// make doc and setDoc available at the Console for testing
global.doc = doc
global.setDoc = setDoc
global.getDoc = getDoc
global.db = db


// TODO: read the code above
// TODO: export the function connectToPersistence, it can be empty for starters
let currentDisposer = null;

export function connectToPersistence(model, watchFunction) {
    // Define the first callback to watch relevant properties
    function watchModelPropertiesACB() {
        return {
            trainingSessions: model.trainingSessions,
            currentTrainingSessionID: model.currentTrainingSessionID
        };
    }

    // Define the second callback to be called when the watched properties change
    async function persistModelChangesACB() {
        if (!model.ready || !model.userId) {
            console.log("Model not ready or no user logged in, skipping persistence");
            return;
        }

        try {
            const currentSessionId = model.currentTrainingSessionID;
            if (!currentSessionId) {
                console.log("No current session ID, skipping persistence");
                return;
            }

            const currentSession = model.trainingSessions.find(session => session.id === currentSessionId);
            if (!currentSession) {
                console.log("Current session not found in model, skipping persistence");
                return;
            }

            await editSession(model.userId, currentSessionId, currentSession);
            console.log("Successfully persisted session changes for session:", currentSessionId);
        } catch (error) {
            console.error("Error persisting model changes:", error);
        }
    }

    const disposer = watchFunction(watchModelPropertiesACB, persistModelChangesACB);

    model.ready = false; // Set ready to false before reading from Firestore

    async function readModelFromFirestore() {
        const user = FIREBASE_AUTH.currentUser;
        try {
            //if user is not authenticated, load an empty trainingSessions array
            if (!user) {
                console.log("readModelFromFirestore: No user found, loading empty trainingSessions array");
                model.trainingSessions = [];
                model.ready = true;
                return;
            }
            const sessionsSnap = await getUserSessions(user.uid);
            if (Array.isArray(sessionsSnap)) {
                if (sessionsSnap.length > 0) {
                    console.log("Found", sessionsSnap.length, "sessions for user", model.userId);
                } else {
                    console.log("User", user.uid, "has no sessions yet");
                }
                model.trainingSessions = sessionsSnap;
            } else {
                console.warn("Invalid session data for user", user.uid);
                model.trainingSessions = [];
            }
        } catch (error) {
            console.error("Error reading from Firestore:", error);
        } finally {
            model.ready = true;
        }
    }

    // After setting up the watcher, read the model from Firestore
    readModelFromFirestore();

    return disposer;
}

// Function to disconnect from persistence
export function disconnectFromPersistence() {
    if (currentDisposer) {
        console.log("Disconnecting from persistence");
        currentDisposer();
        currentDisposer = null;
    }
}

export const FIREBASE_AUTH = getAuth(app);
export const FIREBASE_DB = db;