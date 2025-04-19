import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ZoomableImage from '../components/ZoomableImage';
import Scoreboard from '../components/Scoreboard';
import { pointInPolygon } from '../utils/polygonUtils';
import puzzles from '../data/puzzles.json';

export default function Game() {
    const nav = useNavigate();
    const config = JSON.parse(sessionStorage.getItem('config') || '{}');

    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(config.time);
    const [flash, setFlash] = useState(null);
    const [attempts, setAttempts] = useState(Array(config.tries).fill('pending'));
    const [isPanning, setIsPanning] = useState(false);
    const [isFindMode, setIsFindMode] = useState(false);
    const [reveal, setReveal] = useState(false);
    const [resetZoom, setResetZoom] = useState(0);
    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

    const svgRef = useRef(null);

    const updateAttempt = (i, status) =>
        setAttempts((a) => {
            const copy = [...a];
            copy[i] = status;
            return copy;
        });

    const flashEffect = (type, cb) => {
        setFlash(type);
        setTimeout(() => {
            setFlash(null);
            cb();
        }, 300);
    };

    const revealThenNext = () => {
        setReveal(true);
        setTimeout(() => {
            setReveal(false);
            nextImage();
        }, 2000);
    };

    const nextImage = () => {
        setIndex((i) => i + 1);
        setAttempts(Array(config.tries).fill('pending'));
        setResetZoom((z) => z + 1);
        setIsFindMode(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const markMiss = useCallback(() => {
        const i = attempts.indexOf('pending');
        if (i < 0) return;
        updateAttempt(i, 'miss');
        flashEffect('miss', revealThenNext);
    }, [attempts]);

    useEffect(() => {
        if (index >= config.images) {
            sessionStorage.setItem('score', JSON.stringify(score));
            nav('/podium');
        }
    }, [index, config.images, score, nav]);

    useEffect(() => {
        setTimeLeft(config.time);
        const timer = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(timer);
                    markMiss();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [index, config.time, markMiss]);

    if (index >= config.images) return null;
    const puzzle = puzzles[index];

    const handleFindClick = (e) => {
        if (!isFindMode || flash || isPanning || !svgRef.current) return;

        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const loc = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
        const u = loc.x / naturalSize.width;
        const v = loc.y / naturalSize.height;
        const hit = pointInPolygon(u, v, puzzle.polygon);

        const i = attempts.indexOf('pending');
        new Audio(hit ? '/assets/correct.mp3' : '/assets/wrong.mp3').play();

        if (hit) {
            updateAttempt(i, 'found');
            flashEffect('hit', () => {
                const pts =
                    100 +
                    attempts.filter((a) => a === 'pending').length * 10 -
                    index * 5;
                setScore((s) => s + pts);
                revealThenNext();
            });
        } else {
            updateAttempt(i, 'miss');
            flashEffect('miss', () => {
                if (attempts.filter((a) => a === 'pending').length === 1) {
                    revealThenNext();
                }
            });
        }
    };

    return (
        <div className="grid grid-cols-5 h-screen relative">
            <AnimatePresence>
                {flash && (
                    <motion.div
                        key="flash"
                        className={`absolute inset-0 z-30 ${flash === 'hit' ? 'bg-green-400' : 'bg-red-400'
                            }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </AnimatePresence>

            <aside className="col-span-1 bg-gradient-to-br from-purple-800 to-purple-600 p-6 text-white flex flex-col">
                <h2 className="text-2xl font-bold mb-2">Objet caché</h2>
                <p className="italic break-all">{puzzle.title}</p>
                <p className="mt-2">Difficulté : {puzzle.difficulty}</p>
                <div className="mt-4">
                    <Scoreboard attempts={attempts} score={score} />
                </div>
                <p className="mt-4">
                    Temps restant : <strong>{timeLeft}s</strong>
                </p>
                <button
                    onClick={() => setIsFindMode((fm) => !fm)}
                    className={`mt-4 px-4 py-2 rounded transition ${isFindMode
                            ? 'bg-yellow-500 hover:bg-yellow-600'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                >
                    {isFindMode ? '🔍 Recherche' : '✅ Trouver'}
                </button>
                <button
                    onClick={() => nav('/')}
                    className="mt-auto bg-white text-purple-800 py-2 rounded hover:bg-gray-100 transition"
                >
                    Menu
                </button>
            </aside>

            <div className="col-span-4 h-full relative overflow-hidden grid-fix">
                <ZoomableImage
                    ref={svgRef}
                    src={puzzle.image}
                    enablePanZoom={!isFindMode}
                    setIsPanning={setIsPanning}
                    setImageSize={setNaturalSize}
                    onClick={isFindMode ? handleFindClick : undefined}
                >
                    {reveal && (
                        <polygon
                            points={puzzle.polygon
                                .map(([u, v]) => `${u * naturalSize.width},${v * naturalSize.height}`)
                                .join(' ')}
                            fill="rgba(0,255,0,0.3)"
                            className="reveal-poly"
                        />
                    )}
                </ZoomableImage>
            </div>
        </div>
    );
}
