import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { reactiveModel } from "../bootstrapping"
import { Exercises } from "../presenters/exercisesPresenter"

export default observer(function ExercisesPage() {
  return (
    <View style={{ flex: 1 }}>
      <Exercises model={reactiveModel} />
    </View>
  )
})