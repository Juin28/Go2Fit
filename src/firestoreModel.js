// initialize Firebase app
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig.js";
import { getAuth } from "firebase/auth";
import { getDishDetails } from "./dishSource";
const app = initializeApp(firebaseConfig);

// initialize Firestore
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
const db = getFirestore(app);

// make doc and setDoc available at the Console for testing
global.doc = doc
global.setDoc = setDoc
global.getDoc = getDoc
global.db = db

/* Replace NN with your TW2_TW3 group number! */
const COLLECTION = "dinnerModel47";

// TODO: read the code above
// TODO: export the function connectToPersistence, it can be empty for starters
export function connectToPersistence(model, watchFunction) {

  // Define the first callback to watch relevant properties
  function watchModelPropertiesACB() {
    return {
      numberOfGuests: model.numberOfGuests,
      // dishes: model.dishes ? model.dishes.map(dish => ({ id: dish.id })) : [],
      dishes: model.dishes,
      currentDishId: model.currentDishId
    };
  }

  // Define the second callback to be called when the watched properties change
  async function persistModelChangesACB() {
    if (model.ready) {
      const firestoreDoc = doc(db, COLLECTION, "modelData");
      await setDoc(firestoreDoc, {
        numberOfGuests: model.numberOfGuests || 2,
        // dishes: model.dishes ? model.dishes.map(dish => ({ id: dish.id })) : [],
        dishes: model.dishes || [],
        currentDishId: model.currentDishId || null
      }, { merge: true });
    }
  }

  const disposer = watchFunction(watchModelPropertiesACB, persistModelChangesACB);

  model.ready = false; // Set ready to false before reading from Firestore

  async function readModelFromFirestore() {
    const firestoreDoc = doc(db, COLLECTION, "modelData");
    try {
      const docSnapshot = await getDoc(firestoreDoc);
      const data = docSnapshot.data(); // Get the data

      if (data && Object.keys(data).length > 0) { // Check for existence based on data
        model.numberOfGuests = data.numberOfGuests || 2; // Default to 2 if undefined

        model.dishes = data.dishes || [];

        model.currentDishId = data.currentDishId || null; // Handle undefined
      } else {
        console.warn("Document does not exist or is empty, initializing model with defaults.");
        model.numberOfGuests = 2; // Default value
        model.dishes = []; // Default to empty array
        model.currentDishId = null; // Default to null
      }
    } catch (error) {
      console.error("Error reading model from Firestore: ", error);
      model.numberOfGuests = 2; // Default value
      model.dishes = []; // Default to empty array
      model.currentDishId = null; // Default to null
    } finally {
      model.ready = true; // Set ready to true in all cases
    }
  }

  // After setting up the watcher, read the model from Firestore
  readModelFromFirestore();

  return disposer;
}

export const FIREBASE_AUTH = getAuth(app);
export const FIREBASE_DB = db;