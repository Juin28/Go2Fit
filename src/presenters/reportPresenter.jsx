



// import { useEffect, useState } from "react";
// import { observer } from "mobx-react-lite";
// import { getUserSessions } from "../trainingSessionUtilities";
// import { ReportView } from "../views/reportView";
// import { Alert } from "react-native";
// import dayjs from "dayjs";

// export const Report = observer(function ReportPresenter({ model }) {
//   const [loading, setLoading] = useState(true);
//   const [chartData, setChartData] = useState({ Day: [], Week: [], Month: [], Year: [] });
//   const [setsData, setSetsData] = useState({ Day: [], Week: [], Month: [], Year: [] });
//   const [volumeData, setVolumeData] = useState({ Day: [], Week: [], Month: [], Year: [] });
//   const [summaryStats, setSummaryStats] = useState({ workouts: 0, time: 0, volume: 0 });
//   const [offset, setOffset] = useState({ Day: 0, Week: 0, Month: 0, Year: 0 });
//   const [activeTab, setActiveTab] = useState("Week");

//   useEffect(() => {
//     async function buildChartData() {
//       if (!model.isAuthenticated || !model.userId) {
//         console.log("User not authenticated");
//         return;
//       }

//       try {
//         setLoading(true);
//         const userSessions = await getUserSessions(model.userId);

//         const today = dayjs();
//         const day = Array(24).fill(0);
//         const week = Array(7).fill(0);
//         const month = Array(30).fill(0);
//         const year = Array(12).fill(0);

//         const daySets = Array(24).fill(0);
//         const weekSets = Array(7).fill(0);
//         const monthSets = Array(30).fill(0);
//         const yearSets = Array(12).fill(0);

//         const dayVolume = Array(24).fill(0);
//         const weekVolume = Array(7).fill(0);
//         const monthVolume = Array(30).fill(0);
//         const yearVolume = Array(12).fill(0);

//         let totalWorkouts = 0;
//         let totalTime = 0;
//         let totalVolume = 0;

//         userSessions.forEach(session => {
//           const exercises = session.exercisesList || [];
//           const timestamp = session.completionDate || session.timestamp || session.date;
//           if (!timestamp) return;

//           const sessionTime = dayjs(timestamp);
//           const now = dayjs();

//           let sessionDuration = session.duration || 0;
//           let sessionVolume = 0;
//           let sessionSets = 0;

//           exercises.forEach(ex => {
//             if (ex.sets) {
//               ex.sets.forEach(set => {
//                 sessionSets++;
//                 sessionVolume += (set.weight || 0) * (set.reps || 0);
//               });
//             }
//           });

//           totalWorkouts++;
//           totalTime += sessionDuration;
//           totalVolume += sessionVolume;

//           // Day view
//           const dayDiff = sessionTime.diff(now.startOf("day").add(offset.Day, "day"), "hour");
//           if (sessionTime.isSame(now.add(offset.Day, "day"), "day") && dayDiff >= 0 && dayDiff < 24) {
//             const hour = sessionTime.hour();
//             day[hour] += sessionDuration;
//             daySets[hour] += sessionSets;
//             dayVolume[hour] += sessionVolume;
//           }

//           // Week view
//           const weekStart = now.add(offset.Week * 7, "day").startOf("week");
//           const weekEnd = weekStart.add(7, "day");
//           if (sessionTime.isAfter(weekStart) && sessionTime.isBefore(weekEnd)) {
//             const dayIndex = sessionTime.day() === 0 ? 6 : sessionTime.day() - 1; // Sunday as 6
//             week[dayIndex] += sessionDuration;
//             weekSets[dayIndex] += sessionSets;
//             weekVolume[dayIndex] += sessionVolume;
//           }

//           // Month view
//           const monthStart = now.add(offset.Month, "month").startOf("month");
//           const monthEnd = monthStart.endOf("month");
//           if (sessionTime.isAfter(monthStart) && sessionTime.isBefore(monthEnd)) {
//             const dayOfMonth = sessionTime.date() - 1;
//             if (dayOfMonth < 30) {
//               month[dayOfMonth] += sessionDuration;
//               monthSets[dayOfMonth] += sessionSets;
//               monthVolume[dayOfMonth] += sessionVolume;
//             }
//           }

//           // Year view
//           const yearStart = now.add(offset.Year, "year").startOf("year");
//           if (sessionTime.isSame(yearStart, "year")) {
//             const monthIdx = sessionTime.month();
//             year[monthIdx] += sessionDuration;
//             yearSets[monthIdx] += sessionSets;
//             yearVolume[monthIdx] += sessionVolume;
//           }
//         });

//         setChartData({ Day: day, Week: week, Month: month, Year: year });
//         setSetsData({ Day: daySets, Week: weekSets, Month: monthSets, Year: yearSets });
//         setVolumeData({ Day: dayVolume, Week: weekVolume, Month: monthVolume, Year: yearVolume });
//         setSummaryStats({ workouts: totalWorkouts, time: totalTime, volume: totalVolume });

//       } catch (error) {
//         console.error("Error building chart data:", error);
//         Alert.alert("Error", "Failed to load report data");
//       } finally {
//         setLoading(false);
//       }
//     }

//     buildChartData();
//   }, [model.isAuthenticated, model.userId, offset, activeTab]);

//   return (
//     <ReportView
//       chartData={chartData}
//       setsData={setsData}
//       volumeData={volumeData}
//       summaryStats={summaryStats}
//       loading={loading}
//       offset={offset}
//       setOffset={setOffset}
//       activeTab={activeTab}
//       setActiveTab={setActiveTab}
//     />
//   );
// });



import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { getUserSessions } from "../trainingSessionUtilities";
import { ReportView } from "../views/reportView";
import { Alert } from "react-native";
import dayjs from "dayjs";

export const Report = observer(function ReportPresenter({ model }) {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ Day: [], Week: [], Month: [], Year: [] });
  const [setsData, setSetsData] = useState({ Day: [], Week: [], Month: [], Year: [] });
  const [volumeData, setVolumeData] = useState({ Day: [], Week: [], Month: [], Year: [] });
  const [summaryStats, setSummaryStats] = useState({ workouts: 0, time: 0, volume: 0 });
  const [workoutDetails, setWorkoutDetails] = useState({ Day: {}, Week: {}, Month: {}, Year: {} });

  useEffect(() => {
    async function buildChartData() {
      if (!model.isAuthenticated || !model.userId) {
        console.log("User not authenticated");
        return;
      }

      try {
        setLoading(true);
        const userSessions = await getUserSessions(model.userId);

        const day = Array(24).fill(0);
        const week = Array(7 * 10).fill(0); // 支持最多10周窗口滚动
        const month = Array(30 * 6).fill(0); // 最多6个月窗口
        const year = Array(12 * 3).fill(0); // 最多3年窗口

        const daySets = Array(24).fill(0);
        const weekSets = Array(7 * 10).fill(0);
        const monthSets = Array(30 * 6).fill(0);
        const yearSets = Array(12 * 3).fill(0);

        const dayVolume = Array(24).fill(0);
        const weekVolume = Array(7 * 10).fill(0);
        const monthVolume = Array(30 * 6).fill(0);
        const yearVolume = Array(12 * 3).fill(0);

        const details = {
          Day: {},
          Week: {},
          Month: {},
          Year: {},
        };

        let totalWorkouts = 0;
        let totalTime = 0;
        let totalVolume = 0;

        const today = dayjs();
        const startOfToday = today.startOf("day");

        userSessions.forEach((session) => {
          const exercises = session.exercisesList || [];
          const timestamp = session.completionDate || session.timestamp || session.date;
          if (!timestamp) return;

          const sessionTime = dayjs(timestamp);
          const hour = sessionTime.hour();
          const diffDays = today.diff(sessionTime, "day");
          const diffWeeks = Math.floor(diffDays / 7);
          const diffMonths = today.diff(sessionTime, "month");
          const diffYears = today.diff(sessionTime, "year");

          let sessionDuration = session.duration || 0;
          let sessionVolume = 0;
          let sessionSets = 0;

          exercises.forEach((ex) => {
            if (ex.sets) {
              ex.sets.forEach((set) => {
                sessionSets++;
                sessionVolume += (set.weight || 0) * (set.reps || 0);
              });
            }
          });

          totalWorkouts++;
          totalTime += sessionDuration;
          totalVolume += sessionVolume;

          // Day
          if (sessionTime.isSame(today, "day")) {
            day[hour] += sessionDuration;
            daySets[hour] += sessionSets;
            dayVolume[hour] += sessionVolume;

            const key = sessionTime.format("YYYY-MM-DD") + ` ${String(hour).padStart(2, "0")}:00`;
            details.Day[key] = exercises.map((ex) => ({
              name: ex.name,
              sets: ex.sets?.length || 0,
              reps: ex.sets?.[0]?.reps || 0,
              weight: ex.sets?.[0]?.weight || 0,
            }));
          }

          // Week
          if (diffWeeks >= 0 && diffWeeks < 10) {
            const weekIdx = diffWeeks * 7 + (6 - (diffDays % 7));
            week[weekIdx] += sessionDuration;
            weekSets[weekIdx] += sessionSets;
            weekVolume[weekIdx] += sessionVolume;

            const key = sessionTime.format("YYYY-MM-DD");
            if (!details.Week[key]) details.Week[key] = [];
            details.Week[key].push(...exercises.map((ex) => ({
              name: ex.name,
              sets: ex.sets?.length || 0,
              reps: ex.sets?.[0]?.reps || 0,
              weight: ex.sets?.[0]?.weight || 0,
            })));
          }

          // Month
          if (diffDays >= 0 && diffDays < 30 * 6) {
            const monthIdx = diffDays;
            month[monthIdx] += sessionDuration;
            monthSets[monthIdx] += sessionSets;
            monthVolume[monthIdx] += sessionVolume;

            const key = sessionTime.format("YYYY-MM-DD");
            if (!details.Month[key]) details.Month[key] = [];
            details.Month[key].push(...exercises.map((ex) => ({
              name: ex.name,
              sets: ex.sets?.length || 0,
              reps: ex.sets?.[0]?.reps || 0,
              weight: ex.sets?.[0]?.weight || 0,
            })));
          }

          // Year
          if (diffYears >= 0 && diffYears < 3) {
            const yearIdx = diffYears * 12 + sessionTime.month();
            year[yearIdx] += sessionDuration;
            yearSets[yearIdx] += sessionSets;
            yearVolume[yearIdx] += sessionVolume;

            const key = sessionTime.format("YYYY-MM");
            if (!details.Year[key]) details.Year[key] = [];
            details.Year[key].push(...exercises.map((ex) => ({
              name: ex.name,
              sets: ex.sets?.length || 0,
              reps: ex.sets?.[0]?.reps || 0,
              weight: ex.sets?.[0]?.weight || 0,
            })));
          }
        });

        setChartData({ Day: day, Week: week, Month: month, Year: year });
        setSetsData({ Day: daySets, Week: weekSets, Month: monthSets, Year: yearSets });
        setVolumeData({ Day: dayVolume, Week: weekVolume, Month: monthVolume, Year: yearVolume });
        setWorkoutDetails(details);
        setSummaryStats({ workouts: totalWorkouts, time: totalTime, volume: totalVolume });
      } catch (err) {
        console.error("Error loading chart data:", err);
        Alert.alert("Error", "Failed to load report data");
      } finally {
        setLoading(false);
      }
    }

    buildChartData();
  }, [model.isAuthenticated, model.userId]);

  return (
    <ReportView
      chartData={chartData}
      setsData={setsData}
      volumeData={volumeData}
      summaryStats={summaryStats}
      loading={loading}
      workoutDetails={workoutDetails}
    />
  );
});