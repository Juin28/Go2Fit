import dayjs from "dayjs";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Dimensions,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const { width: screenWidth } = Dimensions.get("window");

const SCOPE_LABELS = {
  Day: Array.from({ length: 24 }, (_, i) => (i % 6 === 0 ? i.toString() : "")),
  Week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  Month: Array.from({ length: 30 }, (_, i) => ((i + 1) % 6 === 0 ? (i + 1).toString() : "")),
  Year: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

const TAB_OPTIONS = ["Week", "Month", "Year"];

const getSpecificDate = (tab, offset, index) => {
  const now = dayjs();

  if (tab === "Day") {
    return now.subtract(offset, "day").hour(index).format("YYYY-MM-DD HH:00");
  }

  if (tab === "Week") {
    const startOfWeek = now.subtract(offset * 7, "day").startOf("week").add(1, "day"); 
    return startOfWeek.add(index, "day").format("YYYY-MM-DD");
  }

  

  // if (tab === "Month") {
  //   return now.subtract(offset, "month").subtract(29 - index, "day").format("YYYY-MM-DD");
  // }
  if (tab === "Month") {
    const base = now.subtract(offset, "month").startOf("month");
    const target = base.add(index, "day");
    if (target.month() !== base.month()) return "";
    return target.format("YYYY-MM-DD");
  }
  
  
  if (tab === "Year") {
    return now.subtract(offset, "year").startOf("year").add(index, "month").format("YYYY-MM");
  }

  return "";
};

const getDateRangeLabel = (tab, offset) => {
  const now = dayjs();

  if (tab === "Day") {
    return now.subtract(offset, "day").format("YYYY-MM-DD");
  }

  if (tab === "Week") {
    const start = now.subtract(offset * 7 + 6, "day").startOf("day");
    const end = now.subtract(offset * 7, "day").startOf("day");
    return `${start.format("YYYY-MM-DD")} - ${end.format("YYYY-MM-DD")}`;
  }

  if (tab === "Month") {
    return now.subtract(offset, "month").format("YYYY-MM");
  }

  if (tab === "Year") {
    return `${now.year() - offset}`;
  }

  return "";
};

export function ReportView({ chartData, setsData, volumeData, summaryStats, loading, workoutDetails }) {
  const [activeTab, setActiveTab] = useState("Week");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [offset, setOffset] = useState(0);

  const SCOPE_SIZE = {
    Day: 24,
    Week: 7,
    Month: 30,
    Year: 12,
  };

  const windowedData = (data, offset, size) => {
    const start = offset * size;
    return data.slice(start, start + size).concat(Array(Math.max(0, size - data.length)).fill(0));
  };

  const data = windowedData(chartData[activeTab] || [], offset, SCOPE_SIZE[activeTab]);
  const sets = windowedData(setsData[activeTab] || [], offset, SCOPE_SIZE[activeTab]);
  const volumes = windowedData(volumeData[activeTab] || [], offset, SCOPE_SIZE[activeTab]);

  const labels = SCOPE_LABELS[activeTab];
  const chartRangeLabel = getDateRangeLabel(activeTab, offset);
  const todayValue = data.reduce((a, b) => a + b, 0);

  const chartContent = {
    labels,
    datasets: [
      {
        data: data.length > 0 ? data : [0],
        color: () => "#3b82f6",
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: () => "#3b82f6",
    labelColor: () => "#666",
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#3b82f6", fill: "#fff" },
    propsForBackgroundLines: { strokeDasharray: "0", stroke: "#eee" },
  };

  const handleDataPointClick = ({ index }) => {
    setSelectedIndex(index);
    setModalVisible(true);
  };

  const selectedKey = selectedIndex !== null ? getSpecificDate(activeTab, offset, selectedIndex) : null;
  const selectedDetail = selectedKey && workoutDetails[activeTab]?.[selectedKey];

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#3b82f6" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Total report</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Workouts</Text><Text style={styles.summaryValue}>{summaryStats.workouts}</Text></View>
        <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Time(min)</Text><Text style={styles.summaryValue}>{summaryStats.time}</Text></View>
        <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Volume(kg)</Text><Text style={styles.summaryValue}>{summaryStats.volume}</Text></View>
      </View>

      <View style={styles.tabContainer}>
        {TAB_OPTIONS.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => { setActiveTab(tab); setOffset(0); setSelectedIndex(null); }}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.rangeControl}>
        <Pressable onPress={() => setOffset((prev) => prev + 1)} style={styles.arrow}><Text style={styles.arrowText}>←</Text></Pressable>
        <Text style={styles.rangeLabel}>{chartRangeLabel}</Text>
        <Pressable onPress={() => setOffset((prev) => Math.max(0, prev - 1))} style={styles.arrow}><Text style={styles.arrowText}>→</Text></Pressable>
      </View>

      <View style={styles.chartWrapper}>
        <LineChart
          data={chartContent}
          width={screenWidth - 40}
          height={240}
          chartConfig={chartConfig}
          bezier
          fromZero
          withInnerLines={false}
          withOuterLines={false}
          onDataPointClick={handleDataPointClick}
          style={styles.chart}
        />
      </View>

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedIndex !== null && (
              <>
                <Text style={styles.modalTitle}>{labels[selectedIndex] || `#${selectedIndex + 1}`}</Text>
                <Text style={styles.modalText}>time: {data[selectedIndex]} min</Text>
                {/* <Text style={styles.modalText}>sets: {sets[selectedIndex]}</Text> */}
                <Text style={styles.modalText}>volume: {volumes[selectedIndex]} kg</Text>
                <Text style={[styles.modalText, { marginTop: 10 }]}>date: {selectedKey}</Text>
                {selectedDetail?.length > 0 ? (
                  selectedDetail.map((ex, idx) => (
                    <Text key={idx} style={styles.modalText}>- {ex.name}: {ex.sets} set × {ex.reps} reps × {ex.weight} kg</Text>
                  ))
                ) : (
                  <Text style={styles.modalText}>no details</Text>
                )}
              </>
            )}
            <Pressable onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.todayCard}>
        {/* <Text style={styles.todayLabel}>{getDateRangeLabel(activeTab, 0)} workout time</Text> */}
        <Text style={styles.todayLabel}>workout time for this {activeTab.toLowerCase()}</Text>

        <Text style={styles.todayValue}>{todayValue} min</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginHorizontal: 20, marginTop: 20, marginBottom: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: "#f3f4f6", marginHorizontal: 6, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  summaryLabel: { fontSize: 14, color: "#666" },
  summaryValue: { fontSize: 18, fontWeight: "bold", color: "#111" },
  tabContainer: { flexDirection: "row", justifyContent: "space-around", marginHorizontal: 20, marginBottom: 12, padding: 6, borderRadius: 16, backgroundColor: "#eee" },
  tabButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  activeTabButton: { backgroundColor: "#3b82f6" },
  tabText: { fontSize: 14, color: "#333" },
  activeTabText: { color: "#fff", fontWeight: "bold" },
  rangeControl: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  arrow: { paddingHorizontal: 12 },
  arrowText: { fontSize: 24, color: "#3b82f6", fontWeight: "bold" },
  rangeLabel: { fontSize: 16, fontWeight: "bold", color: "#333" },
  chartWrapper: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#f9f9f9", borderRadius: 16, marginHorizontal: 20 },
  chart: { borderRadius: 16 },
  todayCard: { marginTop: 30, marginHorizontal: 20, marginBottom: 30, padding: 20, backgroundColor: "#f5f5f5", borderRadius: 16, alignItems: "center" },
  todayLabel: { fontSize: 16, marginBottom: 4, fontWeight: "bold" },
  todayValue: { fontSize: 22, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "80%", backgroundColor: "#fff", borderRadius: 16, padding: 20, alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 16, color: "#333", marginBottom: 4 },
  modalCloseButton: { marginTop: 20, backgroundColor: "#3b82f6", paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  modalCloseText: { color: "#fff", fontWeight: "bold" },
});




