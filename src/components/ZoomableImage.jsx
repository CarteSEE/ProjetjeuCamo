import React, { forwardRef, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default forwardRef(function ZoomableImage(
    { src, enablePanZoom = true, setIsPanning = () => { }, setImageSize = () => { }, onClick, children },
    svgRef
) {
    const imgRef = useRef(null);

    // Quand l'image se charge, on récupère sa taille pour le SVG
    useEffect(() => {
        const img = imgRef.current;
        if (!img) return;
        const handleLoad = () => {
            setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.addEventListener('load', handleLoad);
        if (img.complete) handleLoad();
        return () => img.removeEventListener('load', handleLoad);
    }, [src, setImageSize]);

    return (
        <div className="w-full h-full">
            <TransformWrapper
                disabled={!enablePanZoom}
                initialScale={1}
                minScale={1}
                maxScale={5}
                doubleClick={{ disabled: true }}
                wheel={{ step: 0.2 }}
                onPanningStart={() => setIsPanning(true)}
                onPanningStop={() => setTimeout(() => setIsPanning(false), 100)}
                wrapperStyle={{ width: '100%', height: '100%' }}
            >
                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                    <div className="w-full h-full relative">
                        <img
                            ref={imgRef}
                            src={src}
                            alt="jeu"
                            className="w-full h-full object-contain"
                            draggable="false"
                        />
                        <svg
                            ref={svgRef}
                            onClick={onClick}
                            className="absolute inset-0 w-full h-full"
                            viewBox={`0 0 ${imgRef.current?.naturalWidth || 1} ${imgRef.current?.naturalHeight || 1}`}
                            preserveAspectRatio="xMidYMid meet"
                            style={{ cursor: onClick ? 'crosshair' : 'default', display: 'block' }}
                        >
                            {children}
                        </svg>
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
});