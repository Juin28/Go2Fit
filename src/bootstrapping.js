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
