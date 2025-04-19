// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Menu from "./routes/Menu";
import SoloConfig from "./routes/SoloConfig";
import Game from "./routes/Game";
import Podium from "./routes/Podium";
import CreateLevel from "./routes/CreateLevel";
import CreateRoom from "./routes/CreateRoom";
import JoinRoom from "./routes/JoinRoom";
import Lobby from "./routes/Lobby";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Menu />} />
            <Route path="/solo" element={<SoloConfig />} />
            <Route path="/game" element={<Game />} />
            <Route path="/podium" element={<Podium />} />
            <Route path="/create" element={<CreateLevel />} />

            {/* Lobby routes */}
            <Route path="/room/new" element={<CreateRoom />} />
            <Route path="/room/join" element={<JoinRoom />} />
            <Route path="/lobby/:code" element={<Lobby />} />
        </Routes>
    );
}

