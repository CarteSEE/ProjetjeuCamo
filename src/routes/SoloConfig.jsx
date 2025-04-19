import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SoloConfig() {
    const nav = useNavigate();
    const [tries, setTries] = useState(3);
    const [time, setTime] = useState(30);
    const [images, setImages] = useState(5);

    function start() {
        sessionStorage.setItem('config', JSON.stringify({ tries, time, images }));
        nav('/game');
    }

    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 px-6">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8 w-full max-w-md grid gap-4 text-white">
                <h2 className="text-3xl font-semibold mb-2">Paramètres Solo</h2>

                <label className="flex flex-col gap-1">
                    Nombre d&apos;essais
                    <input
                        type="number"
                        min={1}
                        value={tries}
                        onChange={(e) => setTries(+e.target.value)}
                        className="w-full rounded bg-white/20 p-2 border border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400/70"
                    />
                </label>

                <label className="flex flex-col gap-1">
                    Temps par image (s)
                    <input
                        type="number"
                        min={5}
                        value={time}
                        onChange={(e) => setTime(+e.target.value)}
                        className="w-full rounded bg-white/20 p-2 border border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400/70"
                    />
                </label>

                <label className="flex flex-col gap-1">
                    Nombre d&apos;images
                    <input
                        type="number"
                        min={1}
                        value={images}
                        onChange={(e) => setImages(+e.target.value)}
                        className="w-full rounded bg-white/20 p-2 border border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400/70"
                    />
                </label>

                <button
                    onClick={start}
                    className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-white shadow-md transition"
                >
                    Commencer
                </button>
            </div>
        </div>
    );
}
