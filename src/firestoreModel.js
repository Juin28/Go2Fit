// initialize Firebase app
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig.js";
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
  // Set model.ready to false if it is not already defined before reading to prevent race conditions
  // const modelReadyState = model.ready;
  // model.ready = modelReadyState || false;
  // model.ready = false;

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

        // const dishIds = data.dishes || [];
        // let dishObjects = [];
        // if (dishIds.length > 0) {
        //     dishObjects = await Promise.all(
        //         dishIds.map(async (dish) => {
        //             const dishDetails = await getDishDetails(dish.id);
        //             return dishDetails; // Return the full dish object
        //         })
        //     );
        // }
        // // Ensure the dishes are mapped correctly to maintain structure
        // // model.dishes = dishObjects.map(dish => ({ id: dish.id })); 
        // model.dishes = dishObjects;
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

  // Call the watch function with the defined callbacks
  // watchFunction(watchModelPropertiesACB, persistModelChangesACB);

  // After setting up the watcher, read the model from Firestore
  readModelFromFirestore();

  return disposer;
}