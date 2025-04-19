import React, { useRef, useState } from 'react';

export default function CreateLevel() {
    const [imageURL, setImageURL] = useState(null);
    const [points, setPoints] = useState([]);
    const [exportText, setExportText] = useState('');
    const [zoom, setZoom] = useState(1);

    const imgRef = useRef();
    const svgRef = useRef();

    const onFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageURL(URL.createObjectURL(file));
            setPoints([]);
            setExportText('');
        }
    };

    const onClick = (e) => {
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
        setPoints((ps) => [...ps, [loc.x, loc.y]]);
    };

    const exportCoords = () => {
        if (!imgRef.current) return;
        const { width, height } = imgRef.current.getBoundingClientRect();
        const norm = points.map(([x, y]) => [
            +(x / width).toFixed(4),
            +(y / height).toFixed(4),
        ]);
        setExportText(JSON.stringify(norm, null, 2));
    };

    const resetPoints = () => {
        setPoints([]);
        setExportText('');
    };

    return (
        <div className="h-screen p-8 bg-gray-50 overflow-auto">
            <h2 className="text-2xl mb-4">Créer un niveau</h2>

            <input
                type="file"
                accept="image/*"
                onChange={onFile}
                className="mb-4"
            />

            {imageURL && (
                <>
                    <label className="flex items-center space-x-2 mb-4">
                        <span>Zoom</span>
                        <input
                            type="range"
                            min="0.5"
                            max="4"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(+e.target.value)}
                            className="flex-1"
                        />
                        <span className="w-12 text-right tabular-nums">
                            {zoom.toFixed(1)}×
                        </span>
                    </label>

                    <div
                        className="relative inline-block border border-gray-300 origin-top-left"
                        style={{ transform: `scale(${zoom})` }}
                    >
                        <img
                            src={imageURL}
                            ref={imgRef}
                            alt="nouveau niveau"
                            className="max-w-lg max-h-screen block select-none"
                            draggable="false"
                        />
                        <svg
                            ref={svgRef}
                            onClick={onClick}
                            className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                        >
                            <polygon
                                points={points.map((p) => p.join(',')).join(' ')}
                                fill="rgba(0,255,0,0.3)"
                                stroke="lime"
                                strokeWidth={2}
                            />
                        </svg>
                    </div>
                </>
            )}

            {imageURL && (
                <div className="mt-4 flex flex-col space-y-2">
                    <div className="flex space-x-2">
                        <button
                            onClick={exportCoords}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                        >
                            Donner les coordonnées
                        </button>
                        <button
                            onClick={resetPoints}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                            Réinitialiser
                        </button>
                    </div>

                    <textarea
                        value={exportText}
                        readOnly
                        rows={Math.min(10, exportText.split('\n').length)}
                        className="w-full border border-gray-300 p-2 rounded font-mono text-sm"
                        placeholder="Les coordonnées normalisées apparaîtront ici..."
                    />
                </div>
            )}
        </div>
    );
}
