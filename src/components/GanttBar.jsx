export default function GanttBar({ pid, start, end, isIdle }) {
    const width = (end - start) * 40;
    const barColor = isIdle
        ? 'bg-gray-200'
        : pid % 4 === 1
          ? 'bg-gradient-to-r from-purple-400 to-purple-500'
          : pid % 4 === 2
            ? 'bg-gradient-to-r from-blue-400 to-blue-500'
            : pid % 4 === 3
              ? 'bg-gradient-to-r from-green-400 to-green-500'
              : 'bg-gradient-to-r from-yellow-400 to-yellow-500';

    return (
        <div
            className={`h-10 ${barColor} rounded-lg flex items-center justify-center text-white font-medium shadow-md
            transition-all duration-200 hover:scale-105 hover:shadow-lg`}
            style={{ width: `${isIdle ? 75 : width}px`, minWidth: '40px' }}
        >
            {isIdle ? (
                <span className="text-gray-600 flex items-center">
                    <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                        />
                    </svg>
                    IDLE
                </span>
            ) : (
                <>
                    <span className="text-white">P{pid}</span>
                    <span className="ml-1 text-xs opacity-80">
                        {end - start}s
                    </span>
                </>
            )}
        </div>
    );
}
