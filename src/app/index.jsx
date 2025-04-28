import { View, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"
import { reactiveModel } from "../bootstrapping"
import { Profile } from "../presenters/profilePresenter"

export default observer(function IndexPage() {
  return (
    <View style={styles.container}>
      <Profile model={reactiveModel} />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 90,
  },
})
