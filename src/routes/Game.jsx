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
    const [attempts, setAttempts] = useState(
        Array(config.tries).fill('pending')
    );
    const [isPanning, setIsPanning] = useState(false);
    const [reveal, setReveal] = useState(false);
    const [naturalSize, setNaturalSize] = useState({ width: 1, height: 1 });
    const [locked, setLocked] = useState(false);

    const svgRef = useRef(null);

    const updateAttempt = (i, status) =>
        setAttempts(a => {
            const c = [...a];
            c[i] = status;
            return c;
        });

    const flashEffect = (type, cb = () => { }) => {
        setFlash(type);
        setLocked(true);
        setTimeout(() => {
            setFlash(null);
            cb();
            setLocked(false);
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
        setIndex(i => i + 1);
        setAttempts(Array(config.tries).fill('pending'));
    };

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
        const t = setInterval(() => {
            setTimeLeft(s => {
                if (s <= 1) {
                    clearInterval(t);
                    markMiss();
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [index, config.time, markMiss]);

    if (index >= config.images) return null;
    const puzzle = puzzles[index];

    const handleFind = e => {
        if (locked || isPanning) return;

        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const loc = pt.matrixTransform(
            svgRef.current.getScreenCTM().inverse()
        );
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
                    attempts.filter(a => a === 'pending').length * 10 -
                    index * 5;
                setScore(s => s + pts);
                revealThenNext();
            });
        } else {
            updateAttempt(i, 'miss');
            flashEffect('miss', () => {
                if (attempts.filter(a => a === 'pending').length === 1) {
                    // dézoom complet pour montrer l'image globale
                    svgRef.current?.zoomTo(
                        naturalSize.width / 2,
                        naturalSize.height / 2,
                        1
                    );
                    revealThenNext();
                }
            });
        }
    };

    return (
        <div className="flex h-screen">
            <aside className="w-72 bg-gradient-to-br from-purple-800 to-purple-600 p-6 text-white flex flex-col">
                <h2 className="text-2xl font-bold mb-2">Objet caché</h2>
                <p className="italic">{puzzle.title}</p>
                <p className="mt-2">Difficulté : {puzzle.difficulty}</p>
                <div className="mt-4">
                    <Scoreboard attempts={attempts} score={score} />
                </div>
                <p className="mt-4">
                    Temps restant : <strong>{timeLeft}s</strong>
                </p>
                <button
                    onClick={() => nav('/')}
                    className="mt-auto bg-white text-purple-800 py-2 rounded hover:bg-gray-100"
                >
                    Menu
                </button>
            </aside>

            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence>
                    {flash && (
                        <motion.div
                            key={flash}
                            className={`absolute inset-0 z-50 ${flash === 'hit' ? 'bg-green-400' : 'bg-red-400'
                                }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            exit={{ opacity: 0 }}
                        />
                    )}
                </AnimatePresence>

                <ZoomableImage
                    key={index}
                    src={puzzle.image}
                    enablePanZoom
                    setIsPanning={setIsPanning}
                    setImageSize={setNaturalSize}
                    onDoubleClick={handleFind}
                    ref={svgRef}
                >
                    {reveal && (
                        <motion.polygon
                            points={puzzle.polygon
                                .map(
                                    ([u, v]) =>
                                        `${u * naturalSize.width},${v * naturalSize.height
                                        }`
                                )
                                .join(' ')}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            fill="rgba(0,255,0,0.45)"
                        />
                    )}
                </ZoomableImage>
            </div>
        </div>
    );
}
