import React, { useState } from "react"
import { Button, StyleSheet, TextInput, View } from "react-native"
import SegmentedControl from "@react-native-segmented-control/segmented-control"

export function SearchFormView(props) {
  const { dishTypeOptions, text, type, onSearchDish, onType, onText } = props
  const [selectedType, setSelectedType] = useState(dishTypeOptions.indexOf(type) + 1)

  function handleSearchTextChangeACB(text) {
    onText(text)
  }

  function handleDishTypeOptionsChangeACB(value) {
    setSelectedType(dishTypeOptions.indexOf(value) + 1)
    onType(value)
    onSearchDish()
  }

  function submitUserSearchQueryACB() {
    onSearchDish()
  }

  return (
    <View style={styles.container}>
      <View>
        <TextInput
          testID="search-input"
          style={styles.input}
          value={text}
          onSubmitEditing={submitUserSearchQueryACB}
          onChangeText={handleSearchTextChangeACB} 
          placeholder="Search for a dish..."
        />
      </View>
      <View>
        <SegmentedControl
          values={["All", ...dishTypeOptions]} // Render dish type options
          style={styles.segmentedControl}
          selectedIndex={selectedType}
          appearance="light"
          onValueChange={handleDishTypeOptionsChangeACB}
        />
      </View>
      <Button
        title="Search"
        style={styles.button}
        onPress={submitUserSearchQueryACB} // Handle button press
        testID="search-button"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    width: "80%",
    alignSelf: "center",
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  segmentedControl: {
    marginBottom: 10,
  },
  button: {
    borderRadius: 8,
  },
})