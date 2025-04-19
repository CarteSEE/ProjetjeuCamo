import React, {
    forwardRef,
    useRef,
    useEffect,
    useImperativeHandle,
} from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

/**
 * Image pannable / zoomable + overlay SVG.
 * – drag pour se déplacer
 * – double‑clic capturé via onDoubleClick
 * Exporte le SVG + une méthode zoomTo(x, y, scale)
 */
const ZoomableImage = forwardRef(function ZoomableImage(
    {
        src,
        enablePanZoom = true,
        setIsPanning = () => { },
        setImageSize = () => { },
        onDoubleClick,
        children,
    },
    externalRef,
) {
    const imgRef = useRef(null);
    const wrapperRef = useRef(null);
    const svgInnerRef = useRef(null);

    /* ------------------------------------------------------------- */
    /* expose : SVG element + helper zoomTo()                        */
    /* ------------------------------------------------------------- */
    useImperativeHandle(externalRef, () => {
        const svgEl = svgInnerRef.current;
        if (!svgEl) return null;

        /**
         * Centre (x,y) à l’écran avec un zoom `scale`.
         *  – x,y sont dans le référentiel image (px avant transform).
         */
        svgEl.zoomTo = (x, y, scale = 2) => {
            if (!wrapperRef.current || !wrapperRef.current.setTransform) return;

            // 1. wrapper visible
            const wrapperEl =
                wrapperRef.current.wrapperComponent ||
                svgEl.parentElement ||
                document.body;
            const w = wrapperEl.clientWidth || window.innerWidth;
            const h = wrapperEl.clientHeight || window.innerHeight;

            // 2. taille naturelle de l'image
            const natW = imgRef.current?.naturalWidth || 1;
            const natH = imgRef.current?.naturalHeight || 1;

            // 3. scale appliqué à l’image pour qu’elle tienne dans le wrapper (object-contain)
            const fitScale = Math.min(w / natW, h / natH);

            // 4. bandes horizontales / verticales créées par object-contain
            const marginX = (w - natW * fitScale) / 2;
            const marginY = (h - natH * fitScale) / 2;

            // 5. position de (x,y) dans le wrapper avant zoom
            const dispX = marginX + x * fitScale;
            const dispY = marginY + y * fitScale;

            // 6. translation pour recentrer ce point à l’écran avec le zoom
            const tx = w / 2 - dispX * scale;
            const ty = h / 2 - dispY * scale;

            // 7. anime la transformation
            wrapperRef.current.setTransform(tx, ty, scale, 200, 'easeOut');
        };

        return svgEl;
    });

    /* ------------------------------------------------------------- */
    /* récupère la taille naturelle de l’image                       */
    /* ------------------------------------------------------------- */
    useEffect(() => {
        const img = imgRef.current;
        if (!img) return;

        const handleLoad = () => {
            setImageSize({
                width: img.naturalWidth,
                height: img.naturalHeight,
            });
        };

        img.addEventListener('load', handleLoad);
        if (img.complete) handleLoad();

        return () => img.removeEventListener('load', handleLoad);
    }, [src, setImageSize]);

    /* ------------------------------------------------------------- */
    /* rendu                                                         */
    /* ------------------------------------------------------------- */
    return (
        <div className="w-full h-full">
            <TransformWrapper
                ref={wrapperRef}
                disabled={!enablePanZoom}
                initialScale={1}
                minScale={1}
                maxScale={5}
                doubleClick={{ disabled: true }} // on gère le double-clic nous-mêmes
                wheel={{ step: 0.2 }}
                onPanningStart={() => setIsPanning(true)}
                onPanningStop={() => setTimeout(() => setIsPanning(false), 100)}
                wrapperStyle={{ width: '100%', height: '100%' }}
            >
                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                    <div className="w-full h-full relative select-none">
                        <img
                            ref={imgRef}
                            src={src}
                            alt="jeu"
                            className="w-full h-full object-contain"
                            draggable="false"
                            onDragStart={e => e.preventDefault()}
                        />

                        <svg
                            ref={svgInnerRef}
                            onDoubleClick={onDoubleClick}
                            className="absolute inset-0 w-full h-full"
                            viewBox={`0 0 ${imgRef.current?.naturalWidth || 1} ${imgRef.current?.naturalHeight || 1
                                }`}
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

export default ZoomableImage;
