import { View } from "react-native"
import { observer } from "mobx-react-lite"

import { SearchFormView } from "../views/searchFormView"
import { SearchResultsView } from "../views/searchResultsView"
import { SuspenseView } from "../views/suspenseView"

export const Search = observer(function SummaryRender(props) {
  const { model } = props
  const { searchResultsPromiseState, searchParams } = model
  const {
    promise = null,
    data = null,
    error = null,
  } = searchResultsPromiseState
  const { query, type } = searchParams

  const isPending = !data

  const dishTypeOptions = ["starter", "main course", "dessert"]

  function onQueryChangeACB(query) {
    // console.log(`Set query to ${query}`);
    model.setSearchQuery(query)
    // console.log(`Query is now ${model.searchParams.query}`);
  }

  function onTypeChangeACB(type) {
    // console.log(`Set type to ${type}`);
    model.setSearchType(type)
    // console.log(`Type is now ${model.searchParams.type}`);
  }

  async function onSearchDishACB() {
    // console.log(`In Presenter: ${model.searchParams.query}, ${model.searchParams.type}`);
    const { query, type } = model.searchParams
    // await model.doSearch({ query: "pizza", type: "Main course" })
    await model.doSearch({ query, type })
    // console.log(`Search results: ${model.searchResultsPromiseState.data.length}`);
  }

  function dishChosenACB(dish) {
    console.log("dish chosen!!")
    model.setCurrentDishId(dish.id)
  }

  return (
    <View>
      <SearchFormView
        dishTypeOptions={dishTypeOptions}
        text={query}
        type={type}
        onSearchDish={onSearchDishACB}
        onText={onQueryChangeACB}
        onType={onTypeChangeACB}
      />
      {isPending ? (
        <SuspenseView promise={promise} error={error} />
      ) : (
        <SearchResultsView searchResults={data} dishChosen={dishChosenACB} />
      )}
    </View>
  )
})
