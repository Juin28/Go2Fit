import { View, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"
import { reactiveModel } from "../bootstrapping"
import { Home } from "../presenters/homePresenter"

export default observer(function HomePage() {
  return (
    <View style={styles.container}>
      <Home model={reactiveModel}></Home>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 90,
  },
})