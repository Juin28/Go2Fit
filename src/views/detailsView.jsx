import {
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { Image } from "expo-image"
import { router } from "expo-router"
import { getCardStyle } from "../utilities"

const { width } = Dimensions.get("window")

export function DetailsView(props) {
  const { dishData, guests, isDishInMenu, userWantsToAddDish } = props
  const {
    pricePerServing,
    extendedIngredients,
    analyzedInstructions,
    image,
    sourceUrl,
  } = dishData

  const totalPrice = (pricePerServing * guests).toFixed(2)
  const priceForOne = pricePerServing.toFixed(2)

  function renderIngredientCB(ingredient) {
    return (
      <Text key={ingredient.id}>
        {`${ingredient.amount} ${ingredient.unit} ${ingredient.name}`}
      </Text>
    )
  }

  function renderIngredientsCB() {
    return extendedIngredients.map(renderIngredientCB)
  }

  async function handleMoreInfoPressACB() {
    await Linking.openURL(sourceUrl)
  }

  function handleAddDishToMenuACB() {
    console.log("adding dish test")
    if (!dishData || !dishData[2]) {
      console.log("dishesConst[2] is undefined!")
    }

    userWantsToAddDish()
    router.push("/")
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>Dish Details</Text>
        <Text style={styles.price}>Price per serving: {priceForOne}</Text>
        <Text style={styles.price}>
          Total for {guests} guests: {totalPrice}
        </Text>
        <Text style={styles.subtitle}>Ingredients:</Text>
        {renderIngredientsCB()}
        {analyzedInstructions?.[0]?.steps?.length > 0 && (
          <>
            <Text style={styles.subtitle}>Cooking Instructions:</Text>
            {analyzedInstructions[0].steps.map((instruction) => (
              <Text key={instruction.number}>
                {`${instruction.number}. ${instruction.step}`}
              </Text>
            ))}
          </>
        )}
        <View style={styles.buttonContainer}>
          <Pressable
            role="button"
            style={styles.button}
            onPress={handleMoreInfoPressACB}
          >
            <Text style={styles.buttonText}>More info</Text>
          </Pressable>
          <Pressable
            role="button"
            style={[styles.button, isDishInMenu && styles.disabledButton]}
            disabled={isDishInMenu}
            onPress={handleAddDishToMenuACB}
          >
            <Text style={styles.buttonText}>
              {isDishInMenu ? "Added to menu" : "Add to menu"}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    maxWidth: "80%",
    alignSelf: "center",
  },

  card: {
    ...getCardStyle(), // Applying the getCardStyle function for consistent styling
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    width: "48%", // Adjust button width for spacing
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
})
