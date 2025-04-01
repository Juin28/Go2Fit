import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { reactiveModel } from "../bootstrapping"
import { Training } from "../presenters/trainingPresenter"
import { Home } from "../presenters/homePresenter"

export default observer(function IndexPage() {
  return (
      <View style={{ flex: 1 }}>
        {/* <Training model={reactiveModel}></Training> */}
        <Home model={reactiveModel}></Home>
      </View>
  )
})
