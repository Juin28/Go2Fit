import React, { useState } from "react"
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native"
import { BarChart } from "react-native-chart-kit"

const { width: screenWidth } = Dimensions.get("window")

const CHART_DATA = {
  Day: [0, 0, 0, 0, 0, 0, 0, 0, 190, 270, 0, 0, 0, 180, 55, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  Week: [235, 160, 100, 0, 0, 210, 210],
  Month: [300, 240, 200, 180, 250, 220, 280, 310, 55, 30, 190, 270, 300, 240, 200, 180, 250, 220, 280, 310, 55, 30, 220, 280, 310, 55, 30, 190, 270, 300],
  Year: [3200, 5120, 7160, 2900, 2300, 4200, 1500, 5120, 7160, 2900, 2300, 4200],
}

const TAB_OPTIONS = ["Day", "Week", "Month", "Year"]

const getXAxisLabels = (tab, length) => {
  let baseLabels = []
  switch (tab) {
    case "Day": {
      const hours = Array(length).fill("")
      hours[0] = "0"
      hours[6] = "6"
      hours[12] = "12"
      hours[18] = "18"
      baseLabels = hours
      break
    }
    case "Week":
      baseLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      break
    case "Month": {
      const labels = Array(length).fill("")
      const step = Math.ceil(length / 5)
      for (let i = 0; i < length; i += step) {
        labels[i] = `${i + 1}`
      }
      labels[length - 1] = `${length}`
      baseLabels = labels
      break
    }
    case "Year":
      baseLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      break
    default:
      baseLabels = []
  }
  return baseLabels.map(label => label ? ` ${label}` : "")
}

export function ReportView() {
  const [activeTab, setActiveTab] = useState("Day")
  const [selectedBar, setSelectedBar] = useState(null)

  const rawData = CHART_DATA[activeTab]
  const totalRawData = CHART_DATA["Year"]

  const filteredData = rawData.map((val) => (val === 0 ? null : val))
  const barColors = rawData.map((val) =>
    val === 0 ? () => "transparent" : () => "#3b82f6"
  )

  const labels = getXAxisLabels(activeTab, rawData.length)

  const chartData = {
    labels,
    datasets: [
      {
        data: filteredData,
        colors: barColors,
      },
    ],
  }

  const barCount = chartData.labels.length
  const chartWidth = screenWidth - 40
  const barPercentage = Math.min(1, Math.max(0.2, 6 / barCount))

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    barPercentage,
    color: () => "#000",
    labelColor: () => "#000",
    propsForBackgroundLines: {
      stroke: "#e3e3e3",
      strokeWidth: 1,
    },
  }

  const totalWorkouts = 562
  const totalTime = totalRawData.reduce((sum, val) => sum + val, 0)
  const totalVolume = 562 * 10000

  const infoStats = [
    { label: "Workouts", value: totalWorkouts },
    { label: "Time(min)", value: totalTime },
    { label: "Volume(kg)", value: totalVolume },
  ]

  const todayLabel = {
    Day: "Today",
    Week: "This Week",
    Month: "This Month",
    Year: "This Year",
  }[activeTab]

  const todayValue = rawData.reduce((sum, val) => sum + val, 0)

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Total</Text>

      <View style={styles.infoRow}>
        {infoStats.map(({ label, value }) => (
          <View key={label} style={styles.infoCard}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tabContainer}>
        {TAB_OPTIONS.map((option) => {
          const selected = option === activeTab
          return (
            <Pressable
              key={option}
              onPress={() => {
                setActiveTab(option)
                setSelectedBar(null)
              }}
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
          width={chartWidth}
          height={300}
          fromZero
          showValuesOnTopOfBars={false}
          withInnerLines
          withHorizontalLabels
          withCustomBarColorFromData
          flatColor={false}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          onDataPointClick={({ value, index }) => {
            if (value === null) return
            setSelectedBar({
              index,
              label: chartData.labels[index],
              value,
            })
          }}
          style={styles.chart}
        />
        <Text style={styles.yAxisLabel}>Time/{"\n"}min</Text>
      </View>

      {selectedBar && (
        <View style={styles.tooltipCard}>
          <Text style={styles.tooltipText}>
            {activeTab} - {selectedBar.label}: {selectedBar.value} min
          </Text>
        </View>
      )}

      <View style={styles.todayCard}>
        <Text style={styles.todayLabel}>{todayLabel}</Text>
        <Text style={styles.todayValue}>{todayValue}</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 100,
    backgroundColor: "#fff",
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
    marginTop: 10,
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
    marginTop: 5,
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
  tooltipCard: {
    marginTop: 16,
    marginHorizontal: 20,
    padding: 12,
    backgroundColor: "#e6f0ff",
    borderRadius: 12,
    alignItems: "center",
  },
  tooltipText: {
    fontSize: 16,
    color: "#333",
  },
  todayCard: {
    marginTop: 40,
    marginBottom: 20,
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
