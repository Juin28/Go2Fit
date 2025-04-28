import { View, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"
import { reactiveModel } from "../bootstrapping"
import { Training } from "../presenters/trainingPresenter"

export default observer(function TrainingPage() {
  return (
    <View style={styles.container}>
      <Training model={reactiveModel}></Training>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 90,
  },
})