// src/routes/Menu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../logo/logocaca.png";

export default function Menu() {
    const nav = useNavigate();
    return (
        <>
            {/* Breathing keyframes */}
            <style>{`
        @keyframes breath {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.1); }
        }
      `}</style>

            <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-purple-700 px-6 text-center">
                {/* Logo in a gradient circle with blend mode */}
                <div
                    className="bg-gradient-to-tr from-indigo-700 to-purple-800 p-4 rounded-full overflow-hidden mb-4 drop-shadow-2xl flex items-center justify-center border-4 border-white border-dotted"
                    style={{ animation: "breath 3s ease-in-out infinite" }}
                >
                    <img
                        src={logo}
                        alt="Logo CCB"
                        className="w-40 h-40 mix-blend-multiply select-none"
                        draggable="false"
                    />
                </div>

                {/* Subtitle */}
                <p className="text-white/80 tracking-wide mb-8">
                    <span className="font-semibold">Un jeu CCB</span>
                </p>

                {/* Main title */}
                <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-10 drop-shadow-lg">
                    Trouve&nbsp;la&nbsp;merde
                </h1>

                {/* Navigation buttons */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <button
                        onClick={() => nav("/solo")}
                        className="px-6 py-3 bg-white rounded shadow hover:bg-gray-100 transition"
                    >
                        Partie&nbsp;Solo
                    </button>
                    <button
                        onClick={() => nav("/room/new")}
                        className="px-6 py-3 bg-white rounded shadow hover:bg-gray-100 transition"
                    >
                        Créer&nbsp;un&nbsp;Salon
                    </button>
                    <button
                        onClick={() => nav("/room/join")}
                        className="px-6 py-3 bg-white rounded shadow hover:bg-gray-100 transition"
                    >
                        Rejoindre&nbsp;un&nbsp;Salon
                    </button>
                    <button
                        onClick={() => nav("/create")}
                        className="px-6 py-3 bg-white rounded shadow hover:bg-gray-100 transition"
                    >
                        Créer&nbsp;un&nbsp;Niveau
                    </button>
                </div>
            </div>
        </>
    );
}

