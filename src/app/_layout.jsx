import { Text, View, StyleSheet } from "react-native"
import { Tabs } from "expo-router"
import { observer } from "mobx-react-lite"
import { reactiveModel } from "../bootstrapping"
import { SuspenseView } from "../views/suspenseView"

// Function to render tab icons properly
const renderTabIcon = (emoji) => () => (
  <View style={styles.tabIconContainer}>
    <Text style={styles.tabIconText}>{emoji}</Text>
  </View>
)

export default observer(function RootLayout() {
  return (
    <>
      {reactiveModel.ready ? (
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarLabelStyle: styles.tabBarLabel,
            tabBarStyle: styles.tabBar,
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

const styles = StyleSheet.create({
  tabBar: {
    height: 65,
    marginLeft: 10,
    marginRight: 10,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    paddingTop: 2,
    paddingBottom: 2,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 0,
    paddingBottom: 2,
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
    paddingTop: 2,
  },
  tabIconText: {
    fontSize: 20,
  },
})