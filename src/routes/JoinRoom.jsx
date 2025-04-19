// src/routes/JoinRoom.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addPlayer } from "../utils/room";

export default function JoinRoom() {
    const nav = useNavigate();
    const [code, setCode] = useState("");
    const [name, setName] = useState("");

    const join = () => {
        if (!name || code.length !== 4) return;
        const id = addPlayer(code.toUpperCase(), name);
        nav(`/lobby/${code.toUpperCase()}?id=${id}`);
    };

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
            <h1 className="text-4xl text-white mb-6">Rejoindre un salon</h1>
            <input
                type="text"
                maxLength={4}
                className="px-4 py-2 rounded mb-3 uppercase text-center font-mono"
                placeholder="CODE"
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />
            <input
                className="px-4 py-2 rounded mb-4"
                placeholder="Votre pseudo"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button
                onClick={join}
                className="px-6 py-2 bg-white rounded shadow hover:bg-gray-100"
            >
                Rejoindre
            </button>
        </div>
    );
}

