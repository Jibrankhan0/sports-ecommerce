import { useState, useEffect } from 'react';

export default function ImageZoom({ src, alt }) {
    const [zoom, setZoom] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;
        setPos({ x, y });
    };

    return (
        <div
            className="image-zoom-container"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleMouseMove}
            style={{
                position: 'relative',
                overflow: 'hidden',
                cursor: 'zoom-in',
                borderRadius: 'var(--radius-lg)',
                aspectRatio: '1',
                background: 'var(--bg-card2)'
            }}
        >
            <img
                src={src}
                alt={alt}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transform: zoom ? `scale(2)` : 'scale(1)',
                    transformOrigin: `${pos.x}% ${pos.y}%`,
                    transition: zoom ? 'none' : 'transform 0.3s ease'
                }}
            />
        </div>
    );
}
