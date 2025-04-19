import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ZoomableImage from '../components/ZoomableImage';
import Scoreboard from '../components/Scoreboard';
import { pointInPolygon } from '../utils/polygonUtils';
import puzzles from '../data/puzzles.json';

export default function Game() {
    /* ─── config & refs ─────────────────────────────────── */
    const nav = useNavigate();
    const cfg = JSON.parse(sessionStorage.getItem('config') || '{}');
    const zoomRef = useRef(null);

    /* ─── state ─────────────────────────────────────────── */
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [time, setTime] = useState(cfg.time);
    const [flash, setFlash] = useState(null);
    const [attempts, setAttempts] = useState(Array(cfg.tries).fill('pending'));
    const [reveal, setReveal] = useState(false);
    const [canGuess, setCanGuess] = useState(true);
    const [imgSize, setImgSize] = useState({ width: 1, height: 1 });

    /* ─── helpers ───────────────────────────────────────── */
    const updateAttempt = (i, st) =>
        setAttempts(a => { const c = [...a]; c[i] = st; return c; });

    const flashFx = (type, cb) => {
        setFlash(type);
        setTimeout(() => { setFlash(null); cb(); }, 300);
    };

    const nextImage = () => {
        setIndex(i => i + 1);
        setAttempts(Array(cfg.tries).fill('pending'));
        setCanGuess(true);
        zoomRef.current?.resetZoom();
    };

    const revealAndNext = () => {
        zoomRef.current?.dezoomToFit();      // zoom‑to‑fit exact
        setReveal(true);
        setTimeout(() => { setReveal(false); nextImage(); }, 2000);
    };

    const markMiss = useCallback(() => {
        const i = attempts.indexOf('pending');
        if (i >= 0) {
            updateAttempt(i, 'miss');
            flashFx('miss', revealAndNext);
        }
    }, [attempts]);

    /* ─── side‑effects ─────────────────────────────────── */
    useEffect(() => {
        if (index >= cfg.images) {
            sessionStorage.setItem('score', JSON.stringify(score));
            nav('/podium');
        }
    }, [index]);

    useEffect(() => {
        setTime(cfg.time);
        const t = setInterval(() => {
            setTime(s => (s <= 1 ? (clearInterval(t), markMiss(), 0) : s - 1));
        }, 1000);
        return () => clearInterval(t);
    }, [index, markMiss]);

    /* ─── handler double‑click ─────────────────────────── */
    const onGuess = e => {
        if (!canGuess) return;
        setCanGuess(false);
        setTimeout(() => setCanGuess(true), 1000);

        const pt = zoomRef.current.getSvgPoint(e.clientX, e.clientY);
        const u = pt.x / imgSize.width;
        const v = pt.y / imgSize.height;
        const hit = pointInPolygon(u, v, puzzles[index].polygon);

        const i = attempts.indexOf('pending');
        new Audio(hit ? '/assets/correct.mp3' : '/assets/wrong.mp3').play();

        if (hit) {
            updateAttempt(i, 'found');
            flashFx('hit', () => {
                const pts = 100 + attempts.filter(a => a === 'pending').length * 10 - index * 5;
                setScore(s => s + pts);
                revealAndNext();
            });
        } else {
            updateAttempt(i, 'miss');
            flashFx('miss', () => {
                if (attempts.filter(a => a === 'pending').length === 1) revealAndNext();
            });
        }
    };

    if (index >= cfg.images) return null;
    const puzzle = puzzles[index];

    /* ─── render ───────────────────────────────────────── */
    return (
        <div className="flex h-screen">
            {/* sidebar */}
            <aside className="w-72 bg-gradient-to-br from-purple-800 to-purple-600 p-6 text-white flex flex-col">
                <h2 className="text-2xl font-bold mb-2">Objet caché</h2>
                <p className="italic break-all">{puzzle.title}</p>
                <p className="mt-2">Difficulté : {puzzle.difficulty}</p>
                <div className="mt-4"><Scoreboard attempts={attempts} score={score} /></div>
                <p className="mt-4">Temps restant : <strong>{time}s</strong></p>
                <p className="mt-2 text-white/70 text-sm">Double‑clic pour valider</p>
                <button onClick={() => nav('/')} className="mt-auto bg-white text-purple-800 py-2 rounded hover:bg-gray-100">
                    Menu
                </button>
            </aside>

            {/* zone de jeu */}
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence>
                    {flash && (
                        <motion.div
                            key="flash"
                            className={`absolute inset-0 z-50 ${flash === 'hit' ? 'bg-green-400' : 'bg-red-400'}`}
                            initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
                        />
                    )}
                </AnimatePresence>

                <ZoomableImage
                    ref={zoomRef}
                    src={puzzle.image}
                    enablePanZoom
                    setImageSize={setImgSize}
                    onDoubleClick={onGuess}
                >
                    {reveal && (
                        <motion.polygon
                            points={puzzle.polygon.map(([u, v]) => `${u * imgSize.width},${v * imgSize.height}`).join(' ')}
                            stroke="lime" strokeWidth={4} fill="rgba(0,255,0,0.3)"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0, 1, 0] }}
                            transition={{ duration: 1.5, ease: 'easeInOut' }}
                        />
                    )}
                </ZoomableImage>
            </div>
        </div>
    );
}
