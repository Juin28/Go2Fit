import "./teacherFetch"

import { configure, observable, reaction } from "mobx"

import { model } from "./DinnerModel"
//——————————————————————————————————————————————————————————————————————————————
import { dishesConst } from "./dishesConst"
import { connectToPersistence } from "./firestoreModel"

configure({ enforceActions: "never" })

// export const reactiveModel = "TODO make a reactive model here";
export const reactiveModel = observable(model)

connectToPersistence(reactiveModel, reaction);

function checkCurrentDishIdACB() {
    return reactiveModel.currentDishId
}

async function sideEffectCurrentDishIdACB() {
    await reactiveModel.currentDishEffect()
}

reaction(checkCurrentDishIdACB, sideEffectCurrentDishIdACB)

// Perform an initial search with an empty object
async function initialSearch() {
    await reactiveModel.doSearch({});
}

// Run the initial search
initialSearch();

// make the model and a few example dishes available in the browser Console for testing
global.myModel = reactiveModel
global.dishesConst = dishesConst


global.trainingSessions = [
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
                ]
            }, 
            {
                id: 2,
                name: "Push-ups",
                sets: [
                    { weight: 0, reps: 15 },
                    { weight: 0, reps: 12 },
                    { weight: 0, reps: 10 }
                ]
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
                ]
            }, 
            {
                id: 4,
                name: "Lunges",
                sets: [
                    { weight: 0, reps: 15 },
                    { weight: 0, reps: 12 },
                    { weight: 0, reps: 10 }
                ]
            }
        ]
    },
]
