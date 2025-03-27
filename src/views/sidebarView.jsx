import { FlatList, Pressable, StyleSheet, Text, View } from "react-native"
import { router } from "expo-router"
import { getMenuDetails } from "../dishSource"
import { dishType, getCardStyle, menuPrice, sortDishes } from "../utilities"

export function SidebarView(props) {
  return (
    <View style={styles.outerContainer}>
      <Text style={styles.number}>Training Tab</Text>
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
