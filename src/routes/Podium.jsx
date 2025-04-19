import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Podium() {
    const nav = useNavigate();
    const score = JSON.parse(sessionStorage.getItem('score') || '0');

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 to-red-500">
            <h1 className="text-5xl font-bold mb-6">Podium</h1>
            <div className="flex space-x-12 mb-8">
                <div className="flex flex-col items-center">
                    <span className="text-6xl">🥇</span>
                    <span className="mt-2 text-2xl font-semibold">{score} pts</span>
                </div>
                <div className="flex flex-col items-center opacity-50">
                    <span className="text-5xl">🥈</span>
                    <span className="mt-2 text-xl">—</span>
                </div>
                <div className="flex flex-col items-center opacity-50">
                    <span className="text-4xl">🥉</span>
                    <span className="mt-2 text-xl">—</span>
                </div>
            </div>
            <button
                onClick={() => nav('/')}
                className="px-6 py-3 bg-white rounded shadow hover:bg-gray-100 transition"
            >
                Menu
            </button>
        </div>
    );
}

