// import React, { useState } from "react"
// import {
//   Dimensions,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
//   Pressable,
// } from "react-native"
// import { BarChart } from "react-native-chart-kit"

// const { width: screenWidth } = Dimensions.get("window")

// const CHART_DATA = {
//   Day: [0, 0, 0, 0, 0, 0, 0, 60, 60, 35, 0, 0, 0, 60, 55, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   Week: [235, 160, 100, 0, 0, 210, 210],
//   Month: [300, 240, 200, 180, 250, 220, 280, 310, 55, 30, 190, 270, 300, 240, 200, 180, 250, 220, 280, 310, 55, 30, 220, 280, 310, 55, 30, 190, 270, 300],
//   Year: [3200, 5120, 7160, 2900, 2300, 4200, 1500, 5120, 7160, 2900, 2300, 4200],
// }

// const SCOPE_SIZE = {
//   Day: 24,
//   Week: 7,
//   Month: 30,
//   Year: 12,
// }

// const generateSetsAndVolumeFromTime = (chartData) => {
//   const chartVolume = {}
//   const chartSets = {}

//   for (const scope in chartData) {
//     const timeSeries = chartData[scope]
//     chartVolume[scope] = []
//     chartSets[scope] = []

//     for (const time of timeSeries) {
//       if (time === 0) {
//         chartVolume[scope].push(0)
//         chartSets[scope].push(0)
//         continue
//       }

//       const avgSetDuration = 5
//       const setsCount = Math.max(1, Math.floor(time / avgSetDuration))

//       let totalVolume = 0
//       for (let i = 0; i < setsCount; i++) {
//         const weight = [40, 50, 60, 70][Math.floor(Math.random() * 4)]
//         const reps = [8, 10, 12][Math.floor(Math.random() * 3)]
//         totalVolume += weight * reps
//       }

//       chartVolume[scope].push(totalVolume)
//       chartSets[scope].push(setsCount)
//     }
//   }

//   return { chartVolume, chartSets }
// }

// const { chartVolume: CHART_VOLUME, chartSets: CHART_SETS } = generateSetsAndVolumeFromTime(CHART_DATA)

// const getWindowedData = (data, offset, size) => {
//   const start = offset
//   const end = start + size
//   const filled = Array(size).fill(0)
//   const slice = data.slice(start, end)
//   return [...slice, ...filled].slice(0, size)
// }

// const getXAxisLabels = (tab, length) => {
//   let labels = Array(length).fill("")
//   switch (tab) {
//     case "Day":
//       labels[0] = "0"
//       labels[6] = "6"
//       labels[12] = "12"
//       labels[18] = "18"
//       return labels
//     case "Week":
//       return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
//     case "Month":
//       for (let i = 0; i < length; i += 6) labels[i] = `${i + 1}`
//       labels[length - 1] = `${length}`
//       return labels
//     case "Year":
//       return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
//     default:
//       return Array(length).fill("")
//   }
// }

// const getDateRangeLabel = (tab, offset) => {
//   const now = new Date()
//   const formatDate = (d) =>
//     `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
//       d.getDate()
//     ).padStart(2, "0")}`

//   if (tab === "Day") {
//     const date = new Date(now)
//     const dayOffset = Math.floor(offset / 24)
//     date.setDate(date.getDate() - dayOffset)
//     return formatDate(date)
//   }

//   if (tab === "Week") {
//     const end = new Date(now)
//     end.setDate(end.getDate() - offset)
//     const start = new Date(end)
//     start.setDate(start.getDate() - 6)
//     return `${formatDate(start)} - ${formatDate(end)}`
//   }

//   if (tab === "Month") {
//     const end = new Date(now)
//     end.setDate(end.getDate() - offset)
//     const start = new Date(end)
//     start.setDate(start.getDate() - 29)
//     return `${formatDate(start)} - ${formatDate(end)}`
//   }

//   if (tab === "Year") {
//     const end = new Date(now)
//     end.setMonth(end.getMonth() - offset)
//     const start = new Date(end)
//     start.setMonth(start.getMonth() - 11)
//     return `${formatDate(start)} - ${formatDate(end)}`
//   }

//   return ""
// }

// const TAB_OPTIONS = ["Day", "Week", "Month", "Year"]

// export function ReportView() {
//   const [activeTab, setActiveTab] = useState("Day")
//   const [offset, setOffset] = useState(0)
//   const [selectedBar, setSelectedBar] = useState(null)

//   const scopeSize = SCOPE_SIZE[activeTab]

//   const rawData = getWindowedData(CHART_DATA[activeTab], offset, scopeSize)
//   const setsData = getWindowedData(CHART_SETS[activeTab], offset, scopeSize)
//   const volumeData = getWindowedData(CHART_VOLUME[activeTab], offset, scopeSize)

//   const maxVisible = Math.max(...rawData)
//   const yAnchor = 60
//   const paddedData = [...rawData]
//   if (maxVisible < yAnchor) paddedData.push(yAnchor)

//   const labels = getXAxisLabels(activeTab, paddedData.length)
//   const filteredData = paddedData.map((val, index) =>
//     index === paddedData.length - 1 && val === yAnchor ? null : (val === 0 ? null : val)
//   )
//   const barColors = paddedData.map((val, index) =>
//     index === paddedData.length - 1 && val === yAnchor
//       ? () => "transparent"
//       : (val === 0 ? () => "transparent" : () => "#3b82f6")
//   )

//   const chartData = {
//     labels,
//     datasets: [
//       {
//         data: filteredData,
//         colors: barColors,
//       },
//     ],
//   }

//   const barCount = chartData.labels.length
//   const chartWidth = screenWidth - 40
//   const barWidth = chartWidth / barCount
//   const barPercentage = Math.min(1, Math.max(0.2, 6 / barCount))

//   const chartConfig = {
//     backgroundGradientFrom: "#ffffff",
//     backgroundGradientTo: "#ffffff",
//     decimalPlaces: 0,
//     barPercentage,
//     color: () => "#000",
//     labelColor: () => "#000",
//     propsForBackgroundLines: {
//       stroke: "#e3e3e3",
//       strokeWidth: 1,
//     },
//   }

//   const totalWorkouts = CHART_SETS["Year"].reduce((a, b) => a + b, 0)
//   const totalTime = CHART_DATA["Year"].reduce((a, b) => a + b, 0)
//   const totalVolume = CHART_VOLUME["Year"].reduce((a, b) => a + b, 0)

//   const infoStats = [
//     { label: "Workouts", value: totalWorkouts },
//     { label: "Time(min)", value: totalTime },
//     { label: "Volume(kg)", value: totalVolume },
//   ]

//   const todayLabel = "Workout Time for " + {
//     Day: "Today",
//     Week: "This Week",
//     Month: "This Month",
//     Year: "This Year",
//   }[activeTab] + " (min)"

//   const todayValue = rawData.reduce((a, b) => a + b, 0)

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Total</Text>

//       <View style={styles.infoRow}>
//         {infoStats.map(({ label, value }) => (
//           <View key={label} style={styles.infoCard}>
//             <Text style={styles.infoLabel}>{label}</Text>
//             <Text style={styles.infoValue}>{value}</Text>
//           </View>
//         ))}
//       </View>

//       <View style={styles.tabContainer}>
//         {TAB_OPTIONS.map((option) => {
//           const selected = option === activeTab
//           return (
//             <Pressable
//               key={option}
//               onPress={() => {
//                 console.log('masoud')
//                 setActiveTab(option)
//                 setOffset(0)
//                 setSelectedBar(null)
//               }}
//               style={[styles.tabButton, selected && styles.activeTabButton]}
//             >
//               <Text style={[styles.tabText, selected && styles.activeTabText]}>
//                 {option}
//               </Text>
//             </Pressable>
//           )
//         })}
//       </View>

//       <View style={styles.chartCard}>
//         <View style={styles.chartHeader}>
//           <Pressable onPress={() => setOffset((prev) => prev + scopeSize)} style={styles.arrowButton}>
//             <Text style={styles.arrowText}>←</Text>
//           </Pressable>

//           <Text style={styles.dateRangeLabel}>
//             {getDateRangeLabel(activeTab, offset)}
//           </Text>

//           <Pressable onPress={() => setOffset((prev) => Math.max(0, prev - scopeSize))} style={styles.arrowButton}>
//             <Text style={styles.arrowText}>→</Text>
//           </Pressable>
//         </View>

//         <BarChart
//           data={chartData}
//           width={chartWidth}
//           height={300}
//           fromZero
//           showValuesOnTopOfBars={false}
//           withInnerLines
//           withHorizontalLabels
//           withCustomBarColorFromData
//           flatColor={true}
//           chartConfig={chartConfig}
//           verticalLabelRotation={0}
         
//           onDataPointClick={({ value, index }) => {

//             if (value === null) return
//             setSelectedBar({
//               index,
//               label: chartData.labels[index],
//               value,
//               sets: setsData[index],
//               volume: volumeData[index],
//               left: index * barWidth,
//             })
//           }}
//           style={styles.chart}
//         />

//         <Text style={styles.yAxisLabel}>Time/{"\n"}min</Text>

//         {selectedBar && (
//           <View style={[styles.tooltipPopup, { left: selectedBar.left + 20 }]} pointerEvents="none">
//             <Text style={styles.tooltipText}>
//               {selectedBar.label.trim()}
//               {"\n"}Time: {selectedBar.value} min
//               {"\n"}Sets: {selectedBar.sets}
//               {"\n"}Volume: {selectedBar.volume} kg
//             </Text>
//           </View>
//         )}
//       </View>

//       <View style={styles.todayCard}>
//         <Text style={styles.todayLabel}>{todayLabel}</Text>
//         <Text style={styles.todayValue}>{todayValue} min</Text>
//       </View>
//     </ScrollView>
//   )
// }

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, paddingBottom: 100, backgroundColor: "#fff" },
//   title: { fontSize: 28, fontWeight: "bold", marginHorizontal: 20, marginBottom: 10 },
//   infoRow: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20, marginBottom: 20 },
//   infoCard: { flex: 1, backgroundColor: "#f4f4f4", marginHorizontal: 5, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
//   infoLabel: { fontSize: 14, color: "#555", marginBottom: 4 },
//   infoValue: { fontSize: 18, fontWeight: "bold" },
//   tabContainer: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#eee", marginHorizontal: 20, borderRadius: 20, marginBottom: 12, padding: 4 },
//   tabButton: { flex: 1, paddingVertical: 8, borderRadius: 16, alignItems: "center" },
//   activeTabButton: { backgroundColor: "#fff" },
//   tabText: { fontSize: 14, color: "#333" },
//   activeTabText: { color: "#3b82f6", fontWeight: "bold" },
//   chartCard: { marginTop: 5, marginHorizontal: 20, paddingBottom: 40, borderRadius: 16, backgroundColor: "#f9f9f9", position: "relative" },
//   chartHeader: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 10, marginBottom: 10 },
//   arrowButton: { paddingHorizontal: 12, paddingVertical: 4 },
//   arrowText: { fontSize: 20, color: "#3b82f6", fontWeight: "bold" },
//   dateRangeLabel: { fontSize: 16, fontWeight: "500", color: "#444", textAlign: "center", marginHorizontal: 8 },
//   chart: { borderRadius: 16 },
//   yAxisLabel: { position: "absolute", left: 0, top: 140, transform: [{ rotate: "-90deg" }], fontSize: 12, color: "#888" },
//   tooltipPopup: { position: "absolute", top: 10, backgroundColor: "#fff", borderRadius: 8, padding: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 5, zIndex: 999 },
//   tooltipText: { fontSize: 14, color: "#333", textAlign: "center" },
//   todayCard: { marginTop: 40, marginBottom: 20, marginHorizontal: 20, padding: 20, backgroundColor: "#f5f5f5", borderRadius: 16, alignItems: "center" },
//   todayLabel: { fontSize: 18, marginBottom: 4, fontWeight: "bold" },
//   todayValue: { fontSize: 24, fontWeight: "bold" },
// })


import React, { useState } from "react"
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Dimensions,
  StyleSheet,
  Modal,
} from "react-native"
import { LineChart } from "react-native-chart-kit"

const { width: screenWidth } = Dimensions.get("window")

const CHART_DATA = {
  Day: [0, 0, 0, 0, 0, 0, 0, 60, 60, 35, 0, 0, 0, 60, 55, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  Week: [235, 160, 100, 0, 0, 210, 210],
  Month: [300, 240, 200, 180, 250, 220, 280, 310, 55, 30, 190, 270, 300, 240, 200, 180, 250, 220, 280, 310, 55, 30, 220, 280, 310, 55, 30, 190, 270, 300],
  Year: [3200, 5120, 7160, 2900, 2300, 4200, 1500, 5120, 7160, 2900, 2300, 4200],
}

const SCOPE_LABELS = {
  Day: Array.from({ length: 24 }, (_, i) => i % 6 === 0 ? i.toString() : ""),
  Week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  Month: Array.from({ length: 30 }, (_, i) => (i + 1) % 6 === 0 ? (i + 1).toString() : ""),
  Year: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
}

const generateSetsAndVolumeFromTime = (chartData) => {
  const chartVolume = {}
  const chartSets = {}
  const chartExerciseDetail = {}
  const exercises = ["Bench Press", "Squat", "Deadlift", "Overhead Press"]

  for (const scope in chartData) {
    const timeSeries = chartData[scope]
    chartVolume[scope] = []
    chartSets[scope] = []
    chartExerciseDetail[scope] = []

    for (const time of timeSeries) {
      if (time === 0) {
        chartVolume[scope].push(0)
        chartSets[scope].push(0)
        chartExerciseDetail[scope].push({})
        continue
      }

      const avgSetDuration = 5
      const setsCount = Math.max(1, Math.floor(time / avgSetDuration))
      const setsPerExercise = Math.floor(setsCount / exercises.length)
      let remainingSets = setsCount
      let totalVolume = 0
      const exerciseData = {}

      for (const ex of exercises) {
        const exSets = ex === exercises[exercises.length - 1] ? remainingSets : setsPerExercise
        remainingSets -= exSets

        let exVolume = 0
        for (let i = 0; i < exSets; i++) {
          const weight = [40, 50, 60, 70][Math.floor(Math.random() * 4)]
          const reps = [8, 10, 12][Math.floor(Math.random() * 3)]
          exVolume += weight * reps
        }

        totalVolume += exVolume
        exerciseData[ex] = { sets: exSets, volume: exVolume }
      }

      chartVolume[scope].push(totalVolume)
      chartSets[scope].push(setsCount)
      chartExerciseDetail[scope].push(exerciseData)
    }
  }

  return { chartVolume, chartSets, chartExerciseDetail }
}

const { chartVolume: CHART_VOLUME, chartSets: CHART_SETS, chartExerciseDetail: CHART_EXERCISE_DETAIL } = generateSetsAndVolumeFromTime(CHART_DATA)

export function ReportView() {
  const [activeTab, setActiveTab] = useState("Week")
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  const data = CHART_DATA[activeTab]
  const sets = CHART_SETS[activeTab]
  const volumes = CHART_VOLUME[activeTab]
  const labels = SCOPE_LABELS[activeTab]

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        color: () => "#3b82f6",
        strokeWidth: 2,
      },
    ],
  }

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: () => "#3b82f6",
    labelColor: () => "#666",
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#3b82f6",
      fill: "#fff",
    },
    propsForBackgroundLines: {
      strokeDasharray: "0",
      stroke: "#eee",
    },
  }

  const handleDataPointClick = ({ index }) => {
    setSelectedIndex(index)
    setModalVisible(true)
  }

  const totalWorkouts = CHART_SETS["Year"].reduce((a, b) => a + b, 0)
  const totalTime = CHART_DATA["Year"].reduce((a, b) => a + b, 0)
  const totalVolume = CHART_VOLUME["Year"].reduce((a, b) => a + b, 0)

  const todayValue = CHART_DATA[activeTab].reduce((a, b) => a + b, 0)
  const todayLabel = {
    Day: "Today",
    Week: "This Week",
    Month: "This Month",
    Year: "This Year",
  }[activeTab]

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Workout Report</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Workouts</Text>
          <Text style={styles.summaryValue}>{totalWorkouts}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Time(min)</Text>
          <Text style={styles.summaryValue}>{totalTime}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Volume(kg)</Text>
          <Text style={styles.summaryValue}>{totalVolume}</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
  {Object.keys(CHART_DATA)
    .filter(tab => tab !== "Day") // 去除 Day
    .map((tab) => (
      <Pressable
        key={tab}
        onPress={() => {
          setActiveTab(tab)
          setSelectedIndex(null)
        }}
        style={[styles.tabButton, tab === activeTab && styles.activeTabButton]}
      >
        <Text style={[styles.tabText, tab === activeTab && styles.activeTabText]}>
          {tab}
        </Text>
      </Pressable>
    ))}
</View>


      <View style={styles.chartWrapper}>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          fromZero
          withInnerLines={false}
          withOuterLines={false}
          onDataPointClick={handleDataPointClick}
          style={styles.chart}
        />
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedIndex !== null && (
              <>
                <Text style={styles.modalTitle}>{labels[selectedIndex] || `#${selectedIndex + 1}`}</Text>
                <Text style={styles.modalText}>Time: {data[selectedIndex]} min</Text>
                <Text style={styles.modalText}>Sets: {sets[selectedIndex]}</Text>
                <Text style={styles.modalText}>Volume: {volumes[selectedIndex]} kg</Text>
                <Text style={[styles.modalText, { marginTop: 12 }]}>Details:</Text>
                {Object.entries(CHART_EXERCISE_DETAIL[activeTab][selectedIndex] || {}).map(
                  ([exercise, { sets, volume }]) => (
                    <Text key={exercise} style={styles.modalText}>
                      - {exercise}: {sets} sets, {volume} kg
                    </Text>
                  )
                )}
                <Pressable onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.todayCard}>
        <Text style={styles.todayLabel}>Workout Time for {todayLabel}</Text>
        <Text style={styles.todayValue}>{todayValue} min</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginHorizontal: 20, marginTop: 20, marginBottom: 10 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryLabel: { fontSize: 13, color: "#555" },
  summaryValue: { fontSize: 18, fontWeight: "bold", color: "#111" },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 6,
    borderRadius: 16,
    backgroundColor: "#eee",
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: "#3b82f6",
  },
  tabText: {
    fontSize: 14,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  chartWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    marginHorizontal: 20,
  },
  chart: {
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  modalCloseText: {
    color: "#fff",
    fontWeight: "bold",
  },
  todayCard: {
    marginTop: 30,
    marginHorizontal: 20,
    marginBottom: 10,  
    padding: 20,
    borderRadius: 14,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
  },
  todayLabel: { fontSize: 16, marginBottom: 4, fontWeight: "bold" },
  todayValue: { fontSize: 22, fontWeight: "bold" },
})
