import { FlatList, Pressable, StyleSheet, Text, View } from "react-native"
import { Image } from "expo-image"
import { router } from "expo-router"
import { getCardStyle } from "../utilities"

export function SearchResultsView(props) {
  const { searchResults, dishChosen } = props

  function renderDishItemCB({ item }) {
    function handleDishPressACB() {
      dishChosen(item)
      router.push("/details")
      global.setTimeout(() => router.push("/details"), 1000)
    }

    // function navigateTo() {
    //   router.push("/details")
    //   console.log("navigate To details")
    // }
    return (
      <Pressable
        role="button"
        style={styles.dishContainer}
        onPress={handleDishPressACB}
      >
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.image }} style={styles.image} />
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.dishTitle} numberOfLines={3}>
            {item.title}
          </Text>
        </View>
      </Pressable>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2} // Set number of columns to 2
        renderItem={renderDishItemCB} // Use the named callback
      />
    </View>
  )
}

const styles = StyleSheet.create({
  // dishContainer: {
  //   flex: 1,
  //   margin: 12,
  //   padding: 10,
  //   alignItems: "center",
  //   backgroundColor: "#fff",
  //   borderRadius: 10,
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 4,
  //   elevation: 3,
  // },
  container: {
    // maxWidth: "90%",
    width: "90%",
    alignSelf: "center",
  },
  dishContainer: {
    ...getCardStyle(), // Applying the getCardStyle function for consistent styling
    flex: 1,
    margin: 12,
    padding: 10,
    alignItems: "center",
  },
  imageWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
  },
  textWrapper: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  dishTitle: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
})
