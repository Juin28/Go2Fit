import { resolvePromise } from "./resolvePromise"
import { searchDishes, getDishDetails, searchExercises } from "./dishSource"

/* 
   The Model keeps the state of the application (Application State). 
   It is an abstract object, i.e. it knows nothing about graphics and interaction.
*/
export const model = {
  userID: null,
  trainingSessions: [],
  currentTrainingSessionID: null,

  setUserID(userID) {
    this.userID = userID
  },

  setCurrentTrainingSessionID(trainingSessionID) {
    this.currentTrainingSessionID = trainingSessionID
  },

  addTrainingSession(trainingSession) {
    this.trainingSessions = [...this.trainingSessions, trainingSession]
  },

  removeTrainingSession(trainingSession) {
    function shouldWeKeepTrainingSessionCB(trainingSession) {
      return trainingSession.id !== trainingSession.id
    }

    this.trainingSessions = this.trainingSessions.filter(shouldWeKeepTrainingSessionCB)
  },





  numberOfGuests: 2,
  dishes: [],
  currentDishId: null, // null means "intentionally empty"
  searchParams: {},
  searchResultsPromiseState: {},
  currentDishPromiseState: {},

  setCurrentDishId(dishId) {
    this.currentDishId = dishId
  },

  setNumberOfGuests(number) {
    if (!Number.isInteger(number) || number <= 0) {
      throw new Error("number of guests not a positive integer")
    } else {
      this.numberOfGuests = number
    }
  },

  addToMenu(dishToAdd) {
    // array spread syntax exercise
    // It sets this.dishes to a new array [   ] where we spread (...) the elements of the existing this.dishes
    this.dishes = [...this.dishes, dishToAdd]
  },

  // filter callback exercise
  removeFromMenu(dishToRemove) {
    function shouldWeKeepDishCB(dish) {
      return dish.id !== dishToRemove.id
    }

    this.dishes = this.dishes.filter(shouldWeKeepDishCB)
  },

  // more methods will be added here, don't forget to separate them with comma!

  setSearchQuery(query) {
    if (!this.searchParams) {
      this.searchParams = {};
    }
    this.searchParams.query = query; 
  },

  setSearchType(type) {
    if (!this.searchParams) {
      this.searchParams = {};
    }
    this.searchParams.type = type; 
  },

  async doSearch(params) {
    // this.setSearchQuery(params.query)
    // this.setSearchType(params.type)

    // const promise = searchDishes(params);
    const oldPromise = searchDishes(params);
    resolvePromise(oldPromise, this.searchResultsPromiseState);

    const promise = searchExercises(params);
    resolvePromise(promise, this.searchResultsPromiseState);

    // Wait for the promise to resolve to maintain the expected behavior
    await promise;
  },

  currentDishEffect() {
    if (!this.currentDishId) {
      this.currentDishPromiseState.promise = null
      this.currentDishPromiseState.data = null
      this.currentDishPromiseState.error = null
      return
    }

    const promise = getDishDetails(this.currentDishId);
    resolvePromise(promise, this.currentDishPromiseState);
  }
}

// export const model = {
//   numberOfGuests: 2,
//   dishes: [],
//   currentDishId: null, // null means "intentionally empty"
//   searchParams: {},
//   searchResultsPromiseState: {},
//   currentDishPromiseState: {},

//   setCurrentDishId(dishId) {
//     this.currentDishId = dishId
//   },

//   setNumberOfGuests(number) {
//     if (!Number.isInteger(number) || number <= 0) {
//       throw new Error("number of guests not a positive integer")
//     } else {
//       this.numberOfGuests = number
//     }
//   },

//   addToMenu(dishToAdd) {
//     // array spread syntax exercise
//     // It sets this.dishes to a new array [   ] where we spread (...) the elements of the existing this.dishes
//     this.dishes = [...this.dishes, dishToAdd]
//   },

//   // filter callback exercise
//   removeFromMenu(dishToRemove) {
//     function shouldWeKeepDishCB(dish) {
//       return dish.id !== dishToRemove.id
//     }

//     this.dishes = this.dishes.filter(shouldWeKeepDishCB)
//   },

//   // more methods will be added here, don't forget to separate them with comma!

//   setSearchQuery(query) {
//     if (!this.searchParams) {
//       this.searchParams = {};
//     }
//     this.searchParams.query = query; 
//   },

//   setSearchType(type) {
//     if (!this.searchParams) {
//       this.searchParams = {};
//     }
//     this.searchParams.type = type; 
//   },

//   async doSearch(params) {
//     // this.setSearchQuery(params.query)
//     // this.setSearchType(params.type)

//     const promise = searchDishes(params);
//     resolvePromise(promise, this.searchResultsPromiseState);

//     // Wait for the promise to resolve to maintain the expected behavior
//     await promise;
//   },

//   currentDishEffect() {
//     if (!this.currentDishId) {
//       this.currentDishPromiseState.promise = null
//       this.currentDishPromiseState.data = null
//       this.currentDishPromiseState.error = null
//       return
//     }

//     const promise = getDishDetails(this.currentDishId);
//     resolvePromise(promise, this.currentDishPromiseState);
//   }
// }
