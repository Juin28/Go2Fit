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
            tabBarStyle: {  height: 70, paddingBottom: 10, paddingLeft:10, paddingRight:10 },
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              tabBarIcon: renderTabIcon("🏠"),
            }}
          />

          <Tabs.Screen
            name="training"
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
            name="index"
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