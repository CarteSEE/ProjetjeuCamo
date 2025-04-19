import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default forwardRef(function ZoomableImage(
    {
        src,
        enablePanZoom = true,
        setIsPanning = () => { },
        setImageSize = () => { },
        onClick,
        children,
    },
    svgRef
) {
    const wrapperRef = useRef(null);
    const containerRef = useRef(null);

    const [natural, setNatural] = useState({ width: 1, height: 1 });
    const [fitScale, setFitScale] = useState(1);

    /* 1. charge l’image pour connaître sa taille naturelle */
    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            const size = { width: img.naturalWidth, height: img.naturalHeight };
            setNatural(size);
            setImageSize(size);
        };
    }, [src]);

    /* 2. calcule (et recalcule) le scale‑to‑fit : **max**, pas min ! */
    useEffect(() => {
        if (!containerRef.current) return;

        const compute = () => {
            const rect = containerRef.current.getBoundingClientRect();
            const { width: cW, height: cH } = rect;
            const { width: imgW, height: imgH } = natural;

            // Remplit AU MOINS une dimension du conteneur
            const scale = Math.max(cW / imgW, cH / imgH) * 0.95;
            setFitScale(scale || 1);
            wrapperRef.current?.setTransform(0, 0, scale || 1); // applique immédiatement
        };

        compute();
        const ro = new ResizeObserver(compute);
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [natural]);

    /* 3. rendu */

    return (
        <div ref={containerRef} className="w-full h-full">
            <TransformWrapper
                key={fitScale.toFixed(4)}          /* remount si scale change    */
                ref={wrapperRef}
                initialScale={fitScale}
                minScale={fitScale}
                maxScale={5}
                disabled={!enablePanZoom}
                doubleClick={{ disabled: true }}
                wheel={{ step: 0.2 }}
                onPanningStart={() => setIsPanning(true)}
                onPanningStop={() => setTimeout(() => setIsPanning(false), 100)}
                wrapperStyle={{ width: '100%', height: '100%' }}
            >
                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                    <svg
                        ref={svgRef}
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${natural.width} ${natural.height}`}
                        preserveAspectRatio="xMidYMid meet"
                        onClick={onClick}
                        style={{ cursor: enablePanZoom ? 'grab' : 'crosshair', display: 'block' }}
                    >
                        <image
                            href={src}
                            width={natural.width}
                            height={natural.height}
                            preserveAspectRatio="xMidYMid meet"
                        />
                        {children}
                    </svg>
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
});
