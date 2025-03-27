import { Platform } from 'react-native';

/* uncomment the export below to enable the 1.1.2 test suite! */
export function compareIngredientsCB(ingredientA, ingredientB) {
  if (ingredientA.aisle === ingredientB.aisle) {
      if (ingredientA.name === ingredientB.name) {
          return 0
      }

      return ingredientA.name < ingredientB.name ? -1 : 1
  }

  return ingredientA.aisle < ingredientB.aisle ? -1 : 1
}

export function sortIngredients(ingredients) {
  // return ingredients.sort(compareIngredientsCB)

  const ingredientsCopy = [...ingredients]

  return ingredientsCopy.sort(compareIngredientsCB)
}

export function isKnownTypeCB(type) {
  // don't forget the return keyword (goes for all functions below)
  return type === "starter" || type === "main course" || type === "dessert"
}

export function dishType(dish) {
  if (!dish || !dish.dishTypes || !dish.dishTypes.find(isKnownTypeCB)) {
      return ""
  } else {
      return dish.dishTypes.find(isKnownTypeCB)
  }
}

export function compareDishesCB(dishA, dishB) {
  const typeA = dishType(dishA)
  const typeB = dishType(dishB)
  var valueA = 5
  var valueB = 5

  switch (typeA) {
      case "":
          valueA = 1
          break
      case "starter":
          valueA = 2
          break
      case "main course":
          valueA = 3
          break
      case "dessert":
          valueA = 4
          break
  }

  switch (typeB) {
      case "":
          valueB = 1
          break
      case "starter":
          valueB = 2
          break
      case "main course":
          valueB = 3
          break
      case "dessert":
          valueB = 4
          break
  }

  return valueA < valueB ? -1 : valueA > valueB ? 1 : 0
}

export function sortDishes(dishes) {
  const dishesCopy = [...dishes]

  return dishesCopy.sort(compareDishesCB)
}

export function menuPrice(dishesArray) {
  function dishPriceCB(dish) {
      return dish.pricePerServing;
  }

  function accumulatePricesCB(accumulator, dish) {
      return accumulator + dishPriceCB(dish);
  }

  return dishesArray.reduce(accumulatePricesCB, 0);
}

/* 
This function is already implemented as it is more JavaScript + algorithms than interaction programming

 Given a menu of dishes, generate a list of ingredients. 
 If an ingredient repeats in several dishes, it will be returned only once, with the amount added up 
 
 As this is not an algorithm course, the function is mostly written but you have 2 callback passing TODOs.
*/
export function shoppingList(dishes) {
  const result = {} // object used as mapping between ingredient ID and ingredient object

  // we define the callback inside the function, though this is not strictly needed in this case. But see below.
  function keepJustIngredientsCB(dish) {
      return dish.extendedIngredients
  }

  // ingredientCB must be defined inside shopingList() because it needs access to `result`
  // you will often need to define a callback inside the function where it is used, so it has access to arguments and other variables
  function ingredientCB(ingredient) {
      if (result[ingredient.id] === undefined) {
          // more general: !result[ingredient.id]
          // since result[ingredient.id] is not defined, it means that the ingredient is not taken into account yet
          // so we associate the ingredient with the ID
          result[ingredient.id] = { ...ingredient }

          // JS Notes about the line above:
          // 1)    result[ingredient.id]
          // In JS object.property is the same as object["property"] but the second notation is more powerful because you can write
          // object[x]  where x=="property"

          // 2)    {...ingredient } creates a *copy* of the ingredient (object spread syntax)
          // we duplicate it because we will change the object below
      } else {
          // since result[ingredient.id] is not defined, it means that the ingredient has been encountered before.
          // so we add up the amount:
          result[ingredient.id].amount += ingredient.amount
      }
  }

  const arrayOfIngredientArrays = dishes.map(keepJustIngredientsCB)
  const allIngredients = arrayOfIngredientArrays.flat()
  allIngredients.forEach(ingredientCB)

  // Note: the 3 lines above can be written as a function chain:
  // dishes.map(callback1).flat().forEach(callback2);

  // now we transform the result object into an array: we drop the keys and only keep the values
  return Object.values(result)
}

export function getCardStyle() {
    if (Platform.OS === 'ios') {
        return {
            borderWidth: 1,
            borderColor: '#D3D3D3', // Subtle light border 
            borderRadius: 8,
            padding: 10,
            backgroundColor: '#FFFFFF',
        };
    } else if (Platform.OS === 'android') {
        return {
            elevation: 5, // Elevation shadow
            borderRadius: 8,
            padding: 10,
            backgroundColor: '#FFFFFF',
        };
    } else {
        // For web
        return {
            borderWidth: 1,
            borderColor: '#A9A9A9', // Darker border 
            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)', // Shadow
            borderRadius: 8,
            padding: 10,
            backgroundColor: '#FFFFFF',
        };
    }
}
