import { View, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"
import { reactiveModel } from "../bootstrapping"
import { Report } from "../presenters/reportPresenter"

export default observer(function ReportPage() {
  return (
    <View style={styles.container}>
      <Report model={reactiveModel}></Report>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 90,
  },
})
