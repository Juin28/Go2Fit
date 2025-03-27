import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { reactiveModel } from "../bootstrapping"
import { Report } from "../presenters/reportPresenter"

export default observer(function SearchPage() {
  return (
      <View>
        <Report model={reactiveModel}></Report>
      </View>
  )
})
