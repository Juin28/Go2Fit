// import { URLSearchParams } from "url"

import { PROXY_KEY, PROXY_URL } from "./apiConfig"

export function searchDishes(searchParams) {
  const endpoint = "/recipes/complexSearch"
  //   const url = `${PROXY_URL}${endpoint}${searchParams}`

  const filteredParams = Object.fromEntries(
    Object.entries(searchParams).filter(([_, value]) => value !== undefined),
  )

  const queryString = new URLSearchParams(filteredParams).toString()
  // Only for debugging
  // console.log("searchDishes queryString:", queryString)

  const url = `${PROXY_URL}${endpoint}?${queryString}`
  return fetch(url, {
    method: "GET",
    headers: {
      "X-DH2642-Key": PROXY_KEY,
      "X-DH2642-Group": 47,
    },
  })
    .then(gotResponseACB)
    .then(someACB)

  function gotResponseACB(response) {
    // console.log("gotResponseACB Response:", response)
    if (!response.ok) {
      throw new Error(`API failed: ${response.status}`)
    }
    return response.json().catch(() => ({}))
  }

  function someACB(apiResponse) {
    // console.log("someACB Response:", apiResponse)
    return apiResponse.results || [] // only return results
  }
}

export function getMenuDetails(ids_array) {
  if (!Array.isArray(ids_array)) {
    throw new Error("ids_array must be an array")
  }
  // convert to array（incase there's only 1 ID）
  //ids_array = Array.isArray(ids_array) ? ids_array : [ids_array]

  const endpoint = "/recipes/informationBulk"
  const queryString = new URLSearchParams({
    ids: ids_array.join(","),
  }).toString()
  const url = `${PROXY_URL}${endpoint}?${queryString}`
  return fetch(url, {
    method: "GET",
    headers: {
      "X-DH2642-Key": PROXY_KEY,
      "X-DH2642-Group": 47,
    },
  }).then(menuResponseACB)

  function menuResponseACB(apiResponse) {
    if (!apiResponse.ok) {
      throw new Error(`API failed: ${apiResponse.status}`)
    }
    return apiResponse.json()
  }
}

export function getDishDetails(id) {
  return getMenuDetails([id]).then(arrayToObjectACB)

  function arrayToObjectACB(dishesArray) {
    // console.log("arrayToObjectACB Received:", dishesArray)
    return dishesArray[0]
  }
}
