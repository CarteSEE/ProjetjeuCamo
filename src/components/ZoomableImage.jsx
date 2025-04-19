import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

/**
 * ZoomableImage
 *  - Affiche l’image SVG + enfants
 *  - Calcule un scale‑to‑fit (95 %) et le donne à TransformWrapper
 *  - Le wrapper est remonté (key=scale) → aucune régression de zoom
 */
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
    const containerRef = useRef(null);

    const [natural, setNatural] = useState({ width: 1, height: 1 });
    const [fitScale, setFitScale] = useState(1);

    /* 1. Charge l’image pour connaître sa taille naturelle ------------- */
    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            const size = { width: img.naturalWidth, height: img.naturalHeight };
            setNatural(size);
            setImageSize(size);
        };
    }, [src]);

    /* 2. Observe la taille réelle du conteneur et calcule fitScale ----- */
    useEffect(() => {
        if (!containerRef.current) return;

        const compute = () => {
            const { width: cW, height: cH } =
                containerRef.current.getBoundingClientRect();
            const scale = Math.min(cW / natural.width, cH / natural.height) * 0.95;
            setFitScale(scale || 1);
        };

        compute();                                     // premier calcul
        const ro = new ResizeObserver(compute);        // recalcul si resize
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [natural]);

    /* 3. Rendu : la key={fitScale} force un remount propre ------------- */
    return (
        <div ref={containerRef} className="w-full h-full">
            <TransformWrapper
                key={fitScale.toFixed(4)}           /* remount si scale change   */
                disabled={!enablePanZoom}
                initialScale={fitScale}
                minScale={fitScale}
                maxScale={5}
                doubleClick={{ disabled: true }}
                wheel={{ step: 0.2 }}
                onPanningStart={() => setIsPanning(true)}
                onPanningStop={() => setTimeout(() => setIsPanning(false), 100)}
                wrapperStyle={{ width: '100%', height: '100%' }}
            >
                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                    <svg
                        ref={svgRef}
                        onClick={onClick}
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${natural.width} ${natural.height}`}
                        preserveAspectRatio="xMidYMid meet"
                        style={{ cursor: enablePanZoom ? 'grab' : 'crosshair', display: 'block' }}
                    >
                        <image
                            href={src}
                            x="0"
                            y="0"
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
