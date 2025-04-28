import { View, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"
import { reactiveModel } from "../bootstrapping"
import { Exercises } from "../presenters/exercisesPresenter"

export default observer(function ExercisesPage() {
  return (
    <View style={styles.container}>
      <Exercises model={reactiveModel}></Exercises>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 90,
  },
})