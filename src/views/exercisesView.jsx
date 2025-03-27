import { StyleSheet, Text, View } from "react-native"
import { router } from "expo-router"

export function ExercisesView(props) {
  return (
    <View style={styles.outerContainer}>
      <Text style={styles.number}>Exercises Tab</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  outerContainer: {
    padding: 16,
    margin: 50,
    borderRadius: 8,
    width: "90%",
    maxWidth: "90%",
    alignSelf: "center",
  },
  number: {
    fontSize: 24,
    fontWeight: "bold",
  },
})
