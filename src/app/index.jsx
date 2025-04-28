import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { reactiveModel } from "../bootstrapping"
import { Profile } from "../presenters/profilePresenter"

export default observer(function IndexPage() {
  return (
    <View style={{ flex: 1 }}>
      <Profile model={reactiveModel} />
    </View>
  )
})
