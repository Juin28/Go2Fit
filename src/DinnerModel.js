import { resolvePromise } from "./resolvePromise"
import { searchExercises } from "./dishSource"

export const model = {
  userID: null,
  trainingSessions: [],
  currentTrainingSessionID: null,
  selectedExercises: [],
  currentExercisePromiseState: { promise: null, data: null, error: null },
  allExercises: [],
  searchQuery: "",
  searchFilters: {},
  currentView: "home", // Add this for navigation tracking
  ready: true, // For layout rendering
  
  setUserID(userId) {
    console.log("Setting userId in model:", userId);
    this.userId = userId;
  },

  getCurrentSession(sessionId) {
    if (!sessionId) {
      console.log("getCurrentSession: No session ID provided");
      return null;
    }
    
    // Find the current session by ID
    const session = this.trainingSessions.find(
      s => s.id.toString() === sessionId.toString()
    );
    
    if (session) {
      console.log("getCurrentSession: Found session with", 
                  session.exercisesList?.length || 0, "exercises");
    } else {
      console.log("getCurrentSession: No session found with ID", sessionId);
    }
    
    return session;
  },

  setCurrentTrainingSessionID(trainingSessionID) {
    this.currentTrainingSessionID = trainingSessionID
  },
  
  // Add method to change current view
  setCurrentView(viewName) {
    this.currentView = viewName
  },

  addTrainingSession(trainingSession) {
    this.trainingSessions = [...this.trainingSessions, trainingSession]
  },

  removeTrainingSession(trainingSessionToRemove) {
    this.trainingSessions = this.trainingSessions.filter(
      trainingSession => trainingSession.id !== trainingSessionToRemove.id
    )
  },

  findSessionById(sessionId) {
    return this.trainingSessions.find(s => s.id===sessionId)
  },

  // Your existing method for adding exercise to session
  addExerciseToCurrentSession(exercise) {
    console.log("addExerciseToCurrentSession called with:", exercise?.name)
    
    // If no session is selected, create a new one
    if (!this.currentTrainingSessionID) {
      console.log("No current session ID, creating new session")
      const existingIds = this.trainingSessions.map(s => s.id) || []
      console.log("Existing session IDs:", existingIds)
      
      const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1
      console.log("New session ID:", newId)
      
      const newSession = {
        id: newId,
        name: `New Training ${newId}`,
        exercisesList: [],
        isNew: true
      }
      console.log("New session created:", newSession)
      
      // Create a new array with the new session
      this.trainingSessions = [...this.trainingSessions, newSession]
      console.log("New session added, total sessions:", this.trainingSessions.length)
      this.currentTrainingSessionID = newId
      console.log("Current training session ID set to:", newId)
    }
    
    console.log("Looking for current session with ID:", this.currentTrainingSessionID)
    
    // Find the current session
    const currentSessionIndex = this.trainingSessions.findIndex(
      s => s.id.toString() === this.currentTrainingSessionID.toString()
    )
    
    console.log("Current session found:", currentSessionIndex !== -1 ? "Yes" : "No")
    
    if (currentSessionIndex !== -1) {
      const currentSession = this.trainingSessions[currentSessionIndex]
      
      // Check if exercise exists by name
      const exerciseExists = currentSession.exercisesList?.some(
        ex => ex.name === exercise.name
      )
      
      console.log("Exercise already exists in session:", exerciseExists)
      
      if (!exerciseExists) {
        console.log("Adding new exercise to session")
        // Create a new exercise with safely accessed properties
        const newExercise = {
          id: Date.now().toString(),
          name: exercise.name || "Unnamed Exercise",
          targetMuscles: Array.isArray(exercise.targetMuscles) ? [...exercise.targetMuscles] : [],
          bodyParts: Array.isArray(exercise.bodyParts) ? [...exercise.bodyParts] : [],
          equipments: Array.isArray(exercise.equipments) ? [...exercise.equipments] : [],
          sets: [{ weight: 0, reps: 5 }],
          completedSets: 0
        }
        
        console.log("New exercise object created:", newExercise)
        
        try {
          // Create a new array with the updated session
          const updatedSessions = [...this.trainingSessions]
          updatedSessions[currentSessionIndex] = {
            ...currentSession,
            exercisesList: [...(currentSession.exercisesList || []), newExercise]
          }
          
          // Update the training sessions array
          this.trainingSessions = updatedSessions
          console.log("Exercise added successfully, new list length:", updatedSessions[currentSessionIndex].exercisesList.length)
        } catch (error) {
          console.error("Error adding exercise to list:", error)
          throw error
        }
      }
    } else {
      console.error("No current session found with ID:", this.currentTrainingSessionID)
    }
    
    return this.currentTrainingSessionID
  },
  
  loadExercises() {
    try {
      // Create the promise from searchExercises
      const promise = searchExercises({})
      
      if (!promise || typeof promise.then !== 'function') {
        console.error("searchExercises is not returning a Promise:", promise)
        return
      }
      
      // Use resolvePromise which doesn't return the promise
      resolvePromise(promise, this.currentExercisePromiseState)
      
      // Set up a separate .then handler on the original promise
      promise.then(result => {
        if (result && result.data && result.data.exercises) {
          this.allExercises = result.data.exercises
        }
      }).catch(error => {
        console.error("Error loading exercises:", error)
      })
      
    } catch (error) {
      console.error("Exception in loadExercises:", error)
    }
  },
  
  // Method to check if exercises are loaded
  exercisesLoadedEffect() {
    // This method will be called as a reaction effect
    if (this.currentExercisePromiseState.data && this.allExercises.length === 0) {
      this.allExercises = this.currentExercisePromiseState.data.exercises || []
    }
  }
}