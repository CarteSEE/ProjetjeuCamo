// src/utils/room.js
// Front‑end lobby helpers (localStorage)

const KEY_LOBBIES = "CF_LOBBIES";          // { code: [ {id,name} ] }
const KEY_RESULTS = "CF_RESULTS";          // { code: { playerId: statusArr[] } }
const KEY_CONFIG = "CF_CONFIG";           // { code: { tries,time,images } }
const KEY_PROGRESS = "CF_PROGRESS";         // { code: { playerId: { idx, done } } }
const PREFIX_START = "CF_START_";

export const genCode = () =>
    Array(4)
        .fill(0)
        .map(
            () =>
                "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[
                Math.floor(Math.random() * 32)
                ]
        )
        .join("");

/* ---------- lobbies ---------- */
export const getLobbies = () =>
    JSON.parse(localStorage.getItem(KEY_LOBBIES) || "{}");

export const addPlayer = (code, name) => {
    const lob = getLobbies();
    if (!lob[code]) lob[code] = [];
    const id = crypto.randomUUID();
    lob[code].push({ id, name });
    localStorage.setItem(KEY_LOBBIES, JSON.stringify(lob));
    return id;
};

export const getPlayers = (code) => getLobbies()[code] || [];

/* ---------- config ---------- */
export const setConfig = (code, cfg) => {
    const all = JSON.parse(localStorage.getItem(KEY_CONFIG) || "{}");
    all[code] = cfg;
    localStorage.setItem(KEY_CONFIG, JSON.stringify(all));
};
export const getConfig = (code) => {
    const all = JSON.parse(localStorage.getItem(KEY_CONFIG) || "{}");
    return all[code];
};

/* ---------- results per image ---------- */
export const setPlayerStatus = (code, pid, arr) => {
    const all = JSON.parse(localStorage.getItem(KEY_RESULTS) || "{}");
    if (!all[code]) all[code] = {};
    all[code][pid] = arr;
    localStorage.setItem(KEY_RESULTS, JSON.stringify(all));
};
export const getResults = (code) => {
    const all = JSON.parse(localStorage.getItem(KEY_RESULTS) || "{}");
    return all[code] || {};
};

/* ---------- progress synchronisation ---------- */
export const setProgress = (code, pid, idx, done) => {
    const all = JSON.parse(localStorage.getItem(KEY_PROGRESS) || "{}");
    if (!all[code]) all[code] = {};
    all[code][pid] = { idx, done };
    localStorage.setItem(KEY_PROGRESS, JSON.stringify(all));
};
export const getProgress = (code) => {
    const all = JSON.parse(localStorage.getItem(KEY_PROGRESS) || "{}");
    return all[code] || {};
};

/* ---------- start flag ---------- */
export const markStarted = (code) =>
    localStorage.setItem(PREFIX_START + code, "1");
export const isStarted = (code) =>
    localStorage.getItem(PREFIX_START + code) === "1";

