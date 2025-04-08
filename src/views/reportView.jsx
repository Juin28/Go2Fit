import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native"
import { BarChart } from "react-native-chart-kit"
import { useState } from "react"

const { width } = Dimensions.get("window")

const CHART_DATA = {
  Day: [55, 30, 190, 270, 120, 180,55, 30, 190, 270, 120, 180,],
  Week: [80, 160, 100, 40, 180, 210, 210],
  Month: [300, 240, 200, 180, 250, 220, 280, 310,55, 30, 190, 270, 120, 180,],
  Year: [200, 120, 160],
}

const TAB_OPTIONS = ["Day", "Week", "Month", "Year"]

export function ReportView(props) {
  const [activeTab, setActiveTab] = useState("Day")

  const chartData = {
    labels: Array.from({ length: CHART_DATA[activeTab].length }, (_, i) => `${i}`),
    datasets: [
      {
        data: CHART_DATA[activeTab],
        colors: Array(CHART_DATA[activeTab].length).fill(() => "#3b82f6"),
      },
    ],
  }

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    barPercentage: 0.5,
    color: () => "#000",
    labelColor: () => "#000",
    propsForBackgroundLines: {
      stroke: "#e3e3e3",
      strokeWidth: 1,
    },
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Total</Text>


      <View style={styles.infoRow}>
        {["Workouts", "Time(min)", "Volume(kg)"].map((label) => (
          <View key={label} style={styles.infoCard}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>0</Text>
          </View>
        ))}
      </View>


      <View style={styles.tabContainer}>
        {TAB_OPTIONS.map((option) => {
          const selected = option === activeTab
          return (
            <Pressable
              key={option}
              onPress={() => setActiveTab(option)}
              style={[styles.tabButton, selected && styles.activeTabButton]}
            >
              <Text style={[styles.tabText, selected && styles.activeTabText]}>
                {option}
              </Text>
            </Pressable>
          )
        })}
      </View>

 
      <View style={styles.chartCard}>
        <BarChart
          data={chartData}
          width={Math.max(width - 40, chartData.labels.length * 60)}
          height={300}
          fromZero
          showValuesOnTopOfBars
          withInnerLines={true}
          withHorizontalLabels={true}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          withCustomBarColorFromData={true}
          flatColor={true}
          style={styles.chart}
        />
        <Text style={styles.yAxisLabel}>Time/{"\n"}min</Text>
      </View>


      <View style={styles.todayCard}>
        <Text style={styles.todayLabel}>Today</Text>
        <Text style={styles.todayValue}>0</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#eee",
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: "center",
  },
  activeTabButton: {
    backgroundColor: "#fff",
  },
  tabText: {
    fontSize: 14,
    color: "#333",
  },
  activeTabText: {
    color: "#3b82f6",
    fontWeight: "bold",
  },
  chartCard: {
    marginHorizontal: 20,
    padding: 10,
    paddingBottom: 30,
    borderRadius: 16,
    backgroundColor: "#f9f9f9",
    position: "relative",
  },
  chart: {
    borderRadius: 16,
  },
  yAxisLabel: {
    position: "absolute",
    left: 0,
    top: 140,
    transform: [{ rotate: "-90deg" }],
    fontSize: 12,
    color: "#888",
  },
  todayCard: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    alignItems: "center",
  },
  todayLabel: {
    fontSize: 18,
    marginBottom: 4,
    fontWeight: "bold",
  },
  todayValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
})
