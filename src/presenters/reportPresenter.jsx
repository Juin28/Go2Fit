import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { getUserSessions } from "../trainingSessionUtilities";
import { ReportView } from "../views/reportView";
import { Alert } from "react-native";
// import dayjs from "dayjs";

export const Report = observer(function ReportPresenter(props) {
    const { model } = props;
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState({
        Day: Array(24).fill(0),
        Week: Array(7).fill(0),
        Month: Array(30).fill(0),
        Year: Array(12).fill(0),
    });

    useEffect(() => {
        const buildChartData = async () => {
            if (!model.isAuthenticated || !model.userId) {
                console.log("Not authenticated");
                return;
            }

            try {
                setLoading(true);
                const userSessions = await getUserSessions(model.userId);

                // for later when we're retrieving real data
                const day = Array(24).fill(0);
                const week = Array(7).fill(0);
                const month = Array(30).fill(0);
                const year = Array(12).fill(0);

                const today = dayjs();
                const startOfToday = today.startOf('day');

                userSessions.forEach(session => {
                    const exercises = session.exercisesList || [];
                    const sessionTimestamp = session.timestamp || session.date; 
                    const sessionTime = dayjs(sessionTimestamp);
                    const hour = sessionTime.hour();
                    const diffHours = sessionTime.diff(startOfToday, 'hour');
                    const diffDays = today.diff(sessionTime, 'day');
                    const diffMonths = today.diff(sessionTime, 'month');

                    let totalDuration = 0;
                    let totalVolume = 0;

                    exercises.forEach(ex => {
                        const duration = ex.duration || 0;
                        const sets = ex.sets || 0;
                        const reps = ex.reps || 0;
                        const weight = ex.weight || 0;

                        totalDuration += duration;
                        totalVolume += sets * reps * weight;
                    });

                 
                    // if (diffHours >= 0 && diffHours < 24) {
                    //     day[hour] += totalDuration;
                    // }

                    
                    // if (diffDays >= 0 && diffDays < 7) {
                    //     week[6 - diffDays] += totalDuration; 
                    // }

                    // if (diffDays >= 0 && diffDays < 30) {
                    //     month[29 - diffDays] += totalDuration;
                    // }

                    // if (sessionTime.year() === today.year()) {
                    //     const monthIndex = sessionTime.month(); 
                    //     year[monthIndex] += totalDuration;
                    // }
                });

                setChartData({
                    Day: day,
                    Week: week,
                    Month: month,
                    Year: year,
                });

            } catch (err) {
                console.error("Error loading chart data:", err);
                Alert.alert("Error", "Failed to load report data");
            } finally {
                setLoading(false);
            }
        };

        buildChartData();
    }, [model.isAuthenticated, model.userId]);

    return (
        <ReportView
            // loading={loading}
            chartData={chartData}
        />
    );
});
