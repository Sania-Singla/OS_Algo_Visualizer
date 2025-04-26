const faceStates = [
    {
        emoji: '😊',
        color: 'bg-gradient-to-br from-green-400 to-green-300',
        class: 'happy',
    },
    {
        emoji: '😐',
        color: 'bg-gradient-to-br from-yellow-400 to-yellow-300',
        class: 'neutral',
    },
    {
        emoji: '😠',
        color: 'bg-gradient-to-br from-red-400 to-red-300',
        class: 'angry',
    },
    {
        emoji: '💤',
        color: 'bg-gradient-to-br from-blue-100 to-blue-50',
        class: 'sleeping',
    },
];

export default function ProcessVisualization({ process }) {
    const {
        pid,
        arrivalTime,
        burstTime,
        priority,
        remainingTime,
        waitingTime,
        isExecuting,
    } = process;
    const isCompleted = remainingTime === 0;
    const getFaceState = () => {
        if (isExecuting) return faceStates[0];
        if (isCompleted) return faceStates[3];
        if (waitingTime > 3) return faceStates[2];
        if (waitingTime >= 1) return faceStates[1];
        return faceStates[0];
    };

    const faceState = getFaceState();
    const pulseAnimation = isExecuting ? 'animate-pulse' : '';

    return (
        <div
            className={`relative w-32 h-46 m-3 p-3 rounded-xl shadow-lg transition-all duration-300 transform
      ${isExecuting ? 'bg-gradient-to-br from-blue-100 to-blue-50 scale-105 ring-2 ring-blue-400' : 'bg-white'} 
      ${isCompleted ? 'opacity-70 border-2 border-green-400' : ''}
      hover:shadow-md hover:-translate-y-1`}
        >
            <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-900">P{pid}</span>

                    {priority !== undefined && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-[2px] rounded-full flex items-center">
                            <svg
                                className="size-[11px] mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {priority}
                        </span>
                    )}
                </div>
                <p className="text-gray-800 text-xs">came at: {arrivalTime}</p>
            </div>

            <div
                className={`w-16 h-16 mx-auto my-2 rounded-full flex items-center justify-center text-3xl 
        ${faceState.color} ${pulseAnimation} shadow-inner`}
            >
                <span className={`emoji ${faceState.class}`}>
                    {faceState.emoji}
                </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${(remainingTime / burstTime) * 100}%` }}
                />
            </div>

            <div className="absolute bottom-6 left-0 right-0 px-3">
                <div className="flex justify-between text-xs text-gray-600">
                    <span>⏱️ {remainingTime}s</span>
                    <span>🕒 {waitingTime}s</span>
                </div>
            </div>
        </div>
    );
}
