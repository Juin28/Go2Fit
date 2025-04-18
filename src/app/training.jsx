import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { reactiveModel } from "../bootstrapping"
import { Training } from "../presenters/trainingPresenter"

export default observer(function TrainingPage() {
  return (
    <View style={{ flex: 1 }}>
      <Training model={reactiveModel} />
    </View>
  )
})