import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { reactiveModel } from "../bootstrapping"
import { Home } from "../presenters/homePresenter"

export default observer(function HomePage() {
  return (
      <View style={{ flex: 1 }}>
        <Home model={reactiveModel}></Home>
      </View>
  )
})