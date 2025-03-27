import { Text, View } from "react-native"
import { Tabs } from "expo-router"
import { observer } from "mobx-react-lite"
import { reactiveModel } from "../bootstrapping"
import { SuspenseView } from "../views/suspenseView"

// Function to render tab icons properly
const renderTabIcon = (emoji) => () => (
  <View style={{ alignItems: "center", justifyContent: "center" }}>
    <Text style={{ fontSize: 20 }}>{emoji}</Text>
  </View>
)

export default observer(function RootLayout() {
  return (
    <>
      {reactiveModel.ready ? (
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarLabelStyle: { fontSize: 14 },
            tabBarStyle: { paddingBottom: 5, height: 60 },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Training",
              tabBarIcon: renderTabIcon("🏋️"),
            }}
          />

          <Tabs.Screen
            name="exercises"
            options={{
              title: "Exercises",
              tabBarIcon: renderTabIcon("📝"),
            }}
          />

          <Tabs.Screen
            name="report"
            options={{
              title: "Report",
              tabBarIcon: renderTabIcon("📊"),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: "Me",
              tabBarIcon: renderTabIcon("👤"),
            }}
          />
        </Tabs>
      ) : (
        <SuspenseView promise={new Promise(() => {})} />
      )}
    </>
  )
})
