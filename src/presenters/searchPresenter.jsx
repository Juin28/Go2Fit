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
    model.setSearchQuery(query)
  }

  function onTypeChangeACB(type) {
    model.setSearchType(type)
  }

  async function onSearchDishACB() {
    const { query, type } = model.searchParams
    await model.doSearch({ query, type })
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
