// src/routes/CreateRoom.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { genCode, addPlayer } from "../utils/room";

export default function CreateRoom() {
    const nav = useNavigate();
    const [code] = useState(genCode());
    const [name, setName] = useState("");

    const start = () => {
        if (!name) return;
        const id = addPlayer(code, name);
        nav(`/lobby/${code}?id=${id}&host=1`);
    };

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
            <h1 className="text-4xl text-white mb-6">Créer un salon</h1>
            <p className="text-white mb-4">
                Code du salon : <span className="font-mono text-3xl">{code}</span>
            </p>
            <input
                className="px-4 py-2 rounded mb-4"
                placeholder="Votre pseudo"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button
                onClick={start}
                className="px-6 py-2 bg-white rounded shadow hover:bg-gray-100"
            >
                Entrer dans le salon
            </button>
        </div>
    );
}

