import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

export default function DiskChart({ headMovement }) {
    const chartData = {
        labels: headMovement.map((_, idx) => idx),
        datasets: [
            {
                label: 'Disk Head Movement',
                data: headMovement,
                borderColor: '#4F46E5',
                backgroundColor: '#818CF8',
                tension: 0.1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'x',
        scales: {
            y: {
                beginAtZero: true,
                reverse: true, // Highest head at top, lower below
                title: {
                    display: true,
                    text: 'Disk Cylinder',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Move Number',
                },
            },
        },
    };

    return (
        <div style={{ height: '500px' }} className="bg-gray-800 p-4 rounded">
            <Line data={chartData} options={options} />
        </div>
    );
}
