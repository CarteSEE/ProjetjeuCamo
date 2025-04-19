import React from 'react';
import { Check, X, Loader2 } from 'lucide-react';

export default function Scoreboard({ attempts, score }) {
    return (
        <div className="space-y-2">
            <h3 className="text-xl font-semibold text-purple-100">Score : {score}</h3>
            <div className="flex items-center space-x-1 mt-2">
                {attempts.map((status, i) => {
                    if (status === 'found') {
                        return <Check key={i} className="w-6 h-6 text-green-400" />;
                    }
                    if (status === 'miss') {
                        return <X key={i} className="w-6 h-6 text-red-400" />;
                    }
                    return (
                        <Loader2
                            key={i}
                            className="w-6 h-6 animate-spin text-gray-300"
                        />
                    );
                })}
            </div>
        </div>
    );
}

