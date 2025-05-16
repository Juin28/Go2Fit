import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { getUserSessions } from "../trainingSessionUtilities";
import { ReportView } from "../views/reportView";
import { Alert } from "react-native";
import dayjs from "dayjs";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react'; 
import isoWeek from "dayjs/plugin/isoWeek";   
dayjs.extend(isoWeek)




function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h} hour${h > 1 ? 's' : ''} ` : ''}${m} min`;
}

export const Report = observer(function ReportPresenter({ model }) {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ Day: [], Week: [], Month: [], Year: [] });
  const [setsData, setSetsData] = useState({ Day: [], Week: [], Month: [], Year: [] });
  const [volumeData, setVolumeData] = useState({ Day: [], Week: [], Month: [], Year: [] });
  const [summaryStats, setSummaryStats] = useState({ workouts: 0, time: 0, volume: 0 });
  const [workoutDetails, setWorkoutDetails] = useState({ Day: {}, Week: {}, Month: {}, Year: {} });



  useFocusEffect(
    useCallback(() => {
      async function buildChartData() {
        if (!model.isAuthenticated || !model.userId) {
          console.log("User not authenticated");
          return;
        }
  
        try {
          setLoading(true);
          const userSessions = await getUserSessions(model.userId);
  
          const day = Array(24).fill(0);
          const week = Array(7 * 10).fill(0);
          const month = Array(30 * 6).fill(0);
          const year = Array(12 * 3).fill(0);
  
          const daySets = Array(24).fill(0);
          const weekSets = Array(7 * 10).fill(0);
          const monthSets = Array(30 * 6).fill(0);
          const yearSets = Array(12 * 3).fill(0);
  
          const dayVolume = Array(24).fill(0);
          const weekVolume = Array(7 * 10).fill(0);
          const monthVolume = Array(30 * 6).fill(0);
          const yearVolume = Array(12 * 3).fill(0);
  
          const details = { Day: {}, Week: {}, Month: {}, Year: {} };
  
          let totalWorkouts = 0;
          let totalTime = 0;
          let totalVolume = 0;
  
          const today = dayjs();
          const startOfThisWeek = today.startOf("week").add(1, "day");
  

          userSessions.forEach((session) => {
            if (!session.completed && !session.completionDate) return;
          
            const timestamp   = session.completionDate || session.timestamp || session.date;
            if (!timestamp) return;
            console.log("--------------time stamp is "+timestamp)
            const sessionTime = dayjs(timestamp);
            const hour        = sessionTime.hour();
          
            const exercises   = session.exercisesList || [];
          
            let sessionDuration = Math.round(session.duration/60) || 0;          // min
            let sessionVolume   = 0;
            let sessionSets     = 0;
          
            exercises.forEach((ex) => {
              ex.sets?.forEach((set) => {
                sessionSets++;
                sessionVolume += (set.weight || 0) * (set.reps || 0); // kg
              });
            });
          
 
            totalWorkouts++;
            totalTime   += Math.round(sessionDuration);
            totalVolume += sessionVolume;
          

            if (sessionTime.isSame(today, "day")) {
              day[hour]       += sessionDuration;
              daySets[hour]   += sessionSets;
              dayVolume[hour] += sessionVolume;
          
              const key = `${sessionTime.format("YYYY-MM-DD")} ${String(hour).padStart(2, "0")}:00`;
              details.Day[key] = exercises.map((ex) => ({
                name: ex.name,
                sets: ex.sets?.length || 0,
                reps: ex.sets?.[0]?.reps || 0,
                weight: ex.sets?.[0]?.weight || 0,
              }));
            }
          

            const baseMonday  = today.startOf("isoWeek");   
            const weekStart   = sessionTime.startOf("isoWeek");
            const diffWeeks   = baseMonday.diff(weekStart, "week"); 
          
            if (diffWeeks >= 0 && diffWeeks < 10) {
              const weekDayIndex = sessionTime.isoWeekday() - 1;    // 0=Mon … 6=Sun
              const weekIdx      = diffWeeks * 7 + weekDayIndex;    // 0‑69
          
              week[weekIdx]       += Math.round(sessionDuration);
              weekSets[weekIdx]   += sessionSets;
              weekVolume[weekIdx] += sessionVolume;
          
              const key = sessionTime.format("YYYY-MM-DD");
              (details.Week[key] ??= []).push(
                ...exercises.map((ex) => ({
                  name: ex.name,
                  sets: ex.sets?.length || 0,
                  reps: ex.sets?.[0]?.reps || 0,
                  weight: ex.sets?.[0]?.weight || 0,
                }))
              );
            }
          
            for (let offset = 0; offset < 6; offset++) {
              const monthBase  = today.subtract(offset, "month").startOf("month");
              const diffDays   = sessionTime.startOf("day").diff(monthBase, "day");
              if (diffDays >= 0 && diffDays < 30) {                
                const monthIdx = offset * 30 + diffDays;           // 0‑179
                month[monthIdx]       += Math.round(sessionDuration);
                monthSets[monthIdx]   += sessionSets;
                monthVolume[monthIdx] += sessionVolume;
          
                const key = sessionTime.format("YYYY-MM-DD");
                (details.Month[key] ??= []).push(
                  ...exercises.map((ex) => ({
                    name: ex.name,
                    sets: ex.sets?.length || 0,
                    reps: ex.sets?.[0]?.reps || 0,
                    weight: ex.sets?.[0]?.weight || 0,
                  }))
                );
                break;
              }
            }
          
 
            const diffYears = today.diff(sessionTime, "year");      // 0,1,2
            if (diffYears >= 0 && diffYears < 3) {
              const yearIdx = diffYears * 12 + sessionTime.month(); // 0‑35
              year[yearIdx]       += Math.round(sessionDuration);
              yearSets[yearIdx]   += sessionSets;
              yearVolume[yearIdx] += sessionVolume;
          
              const key = sessionTime.format("YYYY-MM");
              (details.Year[key] ??= []).push(
                ...exercises.map((ex) => ({
                  name: ex.name,
                  sets: ex.sets?.length || 0,
                  reps: ex.sets?.[0]?.reps || 0,
                  weight: ex.sets?.[0]?.weight || 0,
                }))
              );
            }
          });
          




          setChartData({ Day: day, Week: week, Month: month, Year: year });
          setSetsData({ Day: daySets, Week: weekSets, Month: monthSets, Year: yearSets });
          setVolumeData({ Day: dayVolume, Week: weekVolume, Month: monthVolume, Year: yearVolume });
          setWorkoutDetails(details);
          setSummaryStats({
            workouts: totalWorkouts,
            time: totalTime,
            volume: totalVolume,
          });
        } catch (err) {
          console.error("Error loading chart data:", err);
          Alert.alert("Error", "Failed to load report data");
        } finally {
          setLoading(false);
        }
      }
  
      buildChartData();
    }, [model.isAuthenticated, model.userId])
  );
  



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
