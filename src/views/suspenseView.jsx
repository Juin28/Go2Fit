import { StyleSheet, Text, View } from "react-native"
import { Image } from "expo-image"

export function SuspenseView(props) {
  const { promise, error } = props
  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj["

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error.toString()}</Text>
      </View>
    )
  }
  if (!promise) {
    return (
      <View style={styles.container}>
        <Text>No Data</Text>
      </View>
    )
  }
  if (promise) {
    return (
      <View style={styles.container}>
        <Image
          style={styles.image}
          source="https://brfenergi.se/iprog/loading.gif"
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: 50,
    height: 50,
  },
})
