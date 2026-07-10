import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { explainResult } from '../utils/aiExplainer';

export default function AIExplainButton({ algorithm, processes, result }) {
    const [explanation, setExplanation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        setExplanation('');
        setError(false);

        try {
            const text = await explainResult(algorithm, processes, result);
            setExplanation(text);
        } catch (err) {
            console.error(err);
            setError(true);
            setExplanation("couldn't generate explanation — try again");
        }

        setLoading(false);
    };

    return (
        <div className="mt-6 font-mono w-full">
            <button
                onClick={handleClick}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 font-semibold text-lg text-gray-100 cursor-pointer transition-colors hover:border-blue-400 hover:bg-neutral-800 disabled:cursor-default disabled:opacity-70"
            >
                <span className="text-blue-400">$</span>
                {loading ? 'generating explanation...' : 'explain this result'}
            </button>

            {explanation && (
                <div
                    className={`mt-6 rounded border border-neutral-700 border-l-4 bg-neutral-900 px-4 py-3 ${
                        error ? 'border-l-red-500' : 'border-l-blue-400'
                    }`}
                >
                    <span className="mb-1 block text-sm tracking-wide text-neutral-500">
                        {error ? '// error' : '// ai output'}
                    </span>
                    <div className="prose prose-invert prose-sm max-w-none text-neutral-300 [&_strong]:text-blue-300 [&_strong]:font-semibold">
                        <ReactMarkdown>{explanation}</ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}
