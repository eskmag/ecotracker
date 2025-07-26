import React, { useEffect, useState, useMemo } from "react";
import axios from 'axios';
import { mockActivities } from './mockData';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ActivityDashboard() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        // To use mock data, we'll simulate an API call with a short delay.
        // This makes it easy to switch back to the real API call when needed.
        setTimeout(() => {
            setActivities(mockActivities);
            setLoading(false);
        }, 500);

        // axios.get('http://localhost:3000/api/activities')
        //     .then(res => {
        //         setActivities(res.data);
        //         setLoading(false);
        //     })
        //     .catch(err => {
        //         console.error("Failed to fetch activities:", err);
        //         setError("Failed to load data. Please try again later.");
        //         setLoading(false);
        //     });
    }, []);

    // Summarize and sort CO2 data for the chart
    const chartData = useMemo(() => {
        const co2ByDate = activities.reduce((acc, activity) => {
            // Use YYYY-MM-DD format for reliable sorting
            const dateKey = new Date(activity.date).toISOString().split('T')[0];
            acc[dateKey] = (acc[dateKey] || 0) + activity.co2;
            return acc;
        }, {});

        const sortedDateKeys = Object.keys(co2ByDate).sort();

        return {
            labels: sortedDateKeys.map(dateKey => new Date(dateKey).toLocaleDateString()),
            datasets: [
                {
                    label: 'CO2 Emitted (kg)',
                    data: sortedDateKeys.map(dateKey => co2ByDate[dateKey]),
                    backgroundColor: 'rgba(34, 197, 94, 0.7)'
                },
            ],
        };
    }, [activities]);

    if (loading) return <div className="text-center p-8 text-lg">Loading dashboard...</div>;
    if (error) return <div className="text-center p-8 text-lg text-red-600 bg-red-100 rounded-md">{error}</div>;

    return (
        <div className="p-4 max-w-4xl mx-auto bg-yellow-100">
            <h1 className="text-3xl font-bold mb-6 text-green-600">EcoTracker Dashboard</h1>

            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }}/>

            <h2 className="mt-8 text-xl font-semibold">Activity List</h2>
            <table className="min-w-full mt-4 border-collapse border border-gray-200">
                <thead>
                    <tr className="bg-green-100">
                        <th className="border border-gray-300 p-2">Type</th>
                        <th className="border border-gray-300 p-2">Quantity</th>
                        <th className="border border-gray-300 p-2">CO2</th>
                        <th className="border border-gray-300 p-2">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.map(({ _id, type, quantity, co2, date }) => (
                        <tr key={_id}>
                            <td className="border border-gray-300 p-2 capitalize">{type}</td>
                            <td className="border border-gray-300 p-2">{quantity}</td>
                            <td className="border border-gray-300 p-2">{co2.toFixed(2)}</td>
                            <td className="border border-gray-300 p-2">{new Date(date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}