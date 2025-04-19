// src/routes/Lobby.jsx
import React, { useEffect, useState } from "react";
import {
    getPlayers,
    getResults,
    setConfig,
    getConfig,
    markStarted,
    isStarted,
} from "../utils/room";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Check, X, Loader2 } from "lucide-react";

export default function Lobby() {
    const { code } = useParams();
    const [params] = useSearchParams();
    const nav = useNavigate();
    const isHost = params.get("host") === "1";

    const [players, setPlayers] = useState(getPlayers(code));
    const [results, setResults] = useState(getResults(code));

    /* ---------- Config editable par l’hôte ---------- */
    const defCfg = getConfig(code) || { tries: 3, time: 30, images: 5 };
    const [cfg, setCfg] = useState(defCfg);

    useEffect(() => {
        const t = setInterval(() => {
            setPlayers(getPlayers(code));
            setResults(getResults(code));
            if (!isHost && isStarted(code)) nav(`/game?code=${code}&id=${params.get("id")}`);
        }, 1000);
        return () => clearInterval(t);
    }, [code, isHost, nav, params]);

    const hostStart = () => {
        setConfig(code, cfg);
        markStarted(code);
        nav(`/game?code=${code}&id=${params.get("id")}&host=1`);
    };

    return (
        <div className="h-screen flex flex-col items-center bg-gray-100 p-8">
            <h1 className="text-3xl mb-2">Salon {code}</h1>

            <ul className="mb-6 w-64">
                {players.map((p) => {
                    const arr = results[p.id] || [];
                    return (
                        <li key={p.id} className="flex justify-between items-center bg-white p-2 mb-1 rounded shadow">
                            <span>{p.name}</span>
                            <div className="flex space-x-1">
                                {arr.map((st, i) =>
                                    st === "found" ? <Check key={i} className="w-4 h-4 text-green-500" /> :
                                        st === "miss" ? <X key={i} className="w-4 h-4 text-red-500" /> :
                                            <Loader2 key={i} className="w-4 h-4 text-gray-300 animate-spin" />
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>

            {isHost ? (
                <>
                    <div className="mb-4 flex space-x-2">
                        <label className="flex flex-col text-sm">
                            Essais
                            <input type="number" min="1" value={cfg.tries}
                                onChange={(e) => setCfg({ ...cfg, tries: +e.target.value })}
                                className="w-20 px-1 border rounded" />
                        </label>
                        <label className="flex flex-col text-sm">
                            Chrono
                            <input type="number" min="5" value={cfg.time}
                                onChange={(e) => setCfg({ ...cfg, time: +e.target.value })}
                                className="w-20 px-1 border rounded" />
                        </label>
                        <label className="flex flex-col text-sm">
                            Images
                            <input type="number" min="1" value={cfg.images}
                                onChange={(e) => setCfg({ ...cfg, images: +e.target.value })}
                                className="w-20 px-1 border rounded" />
                        </label>
                    </div>

                    <button
                        onClick={hostStart}
                        className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        🚀 Lancer la partie
                    </button>
                </>
            ) : (
                <p className="italic text-gray-600">En attente que l’hôte démarre…</p>
            )}
        </div>
    );
}

