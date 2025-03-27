import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { reactiveModel } from "../bootstrapping"
import { Exercises } from "../presenters/exercisesPresenter"

export default observer(function IndexPage() {
  return (
      <View style={{ flex: 1 }}>
        {/* <Training model={reactiveModel}></Training> */}
        <Exercises model={reactiveModel}></Exercises>
      </View>
  )
})
