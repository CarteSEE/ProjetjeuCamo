import React, {
    forwardRef,
    useRef,
    useState,
    useEffect,
    useImperativeHandle
} from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default forwardRef(function ZoomableImage(
    {
        src,
        setImageSize = () => { },
        onDoubleClick = () => { },
        children
    },
    ref
) {
    const containerRef = useRef(null);
    const wrapperRef = useRef(null);
    const svgRef = useRef(null);

    const [naturalSize, setNaturalSize] = useState({ width: 1, height: 1 });
    const [initialScale, setInitialScale] = useState(1);
    const [fitScale, setFitScale] = useState(1);

    // Charger les dimensions naturelles de l’image
    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            const size = { width: img.naturalWidth, height: img.naturalHeight };
            setNaturalSize(size);
            setImageSize(size);
        };
    }, [src, setImageSize]);

    // Calculer les échelles en fonction du conteneur
    useEffect(() => {
        const compute = () => {
            if (!containerRef.current) return;
            const { width: cw, height: ch } = containerRef.current.getBoundingClientRect();
            const { width: iw, height: ih } = naturalSize;
            const scaleCover = Math.max(cw / iw, ch / ih); // zoom de base (remplir)
            const scaleContain = Math.min(cw / iw, ch / ih); // zoom fit-to-screen
            setInitialScale(scaleCover || 1);
            setFitScale(scaleContain || 1);
        };
        compute();
        const ro = new ResizeObserver(compute);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [naturalSize]);

    // Exposer les fonctions vers Game.jsx
    useImperativeHandle(ref, () => ({
        resetZoom: () => wrapperRef.current?.setTransform(0, 0, initialScale),
        dezoomToFit: () => wrapperRef.current?.setTransform(0, 0, fitScale),
        getSvgPoint: (x, y) => {
            const pt = svgRef.current.createSVGPoint();
            pt.x = x;
            pt.y = y;
            return pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
        }
    }), [initialScale, fitScale]);

    return (
        <div ref={containerRef} className="w-full h-full">
            <TransformWrapper
                key={initialScale.toFixed(5)}
                ref={wrapperRef}
                initialScale={initialScale}
                minScale={fitScale}
                maxScale={initialScale * 5}
                doubleClick={{ disabled: true }}
                wheel={{ step: 0.2 }}
                wrapperStyle={{ width: '100%', height: '100%' }}
            >
                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                    <div className="w-full h-full relative">
                        <img
                            src={src}
                            alt="jeu"
                            className="w-full h-full object-contain"
                            draggable="false"
                        />
                        <svg
                            ref={svgRef}
                            onDoubleClick={onDoubleClick}
                            className="absolute inset-0 w-full h-full"
                            viewBox={`0 0 ${naturalSize.width} ${naturalSize.height}`}
                            preserveAspectRatio="xMidYMid meet"
                            style={{ cursor: 'crosshair', display: 'block' }}
                        >
                            {children}
                        </svg>
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
});
