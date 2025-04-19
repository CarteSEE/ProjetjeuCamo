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
        enablePanZoom = true,
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
    const [fillScale, setFillScale] = useState(1);
    const [fitScale, setFitScale] = useState(1);

    // 1️⃣ Charge la taille naturelle de l’image
    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            const size = { width: img.naturalWidth, height: img.naturalHeight };
            setNaturalSize(size);
            setImageSize(size);
        };
    }, [src, setImageSize]);

    // 2️⃣ Calcule les échelles de zoom (cover et contain) en fonction de la fenêtre
    useEffect(() => {
        if (!containerRef.current) return;

        const compute = () => {
            if (!containerRef.current) return; // 🔒 sécurité contre null
            const { width: cW, height: cH } = containerRef.current.getBoundingClientRect();
            const { width: iW, height: iH } = naturalSize;
            setFillScale(Math.max(cW / iW, cH / iH) || 1);
            setFitScale(Math.min(cW / iW, cH / iH) || 1);
        };

        compute();
        const ro = new ResizeObserver(() => compute()); // safe callback
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [naturalSize]);

    // 3️⃣ Expose des méthodes vers le parent
    useImperativeHandle(ref, () => ({
        resetZoom: () => wrapperRef.current?.setTransform(0, 0, fillScale),
        dezoomToFit: () => wrapperRef.current?.setTransform(0, 0, fitScale),
        getSvgPoint: (x, y) => {
            const pt = svgRef.current.createSVGPoint();
            pt.x = x;
            pt.y = y;
            return pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
        }
    }), [fillScale, fitScale]);

    return (
        <div ref={containerRef} className="w-full h-full">
            <TransformWrapper
                ref={wrapperRef}
                disabled={!enablePanZoom}
                initialScale={fillScale}
                minScale={fitScale}
                maxScale={fillScale * 5}
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
