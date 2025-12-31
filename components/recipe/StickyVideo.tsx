'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface StickyVideoProps {
    src: string;
    aspectRatio?: '9/16' | '16/9';
}

// StickyVideo.tsx with Seamless Playback
// StickyVideo.tsx with Dismiss Logic
export default function StickyVideo({ src, aspectRatio = '9/16' }: StickyVideoProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isSticky, setIsSticky] = useState(false);
    const [isClosed, setIsClosed] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                const sticky = !entry.isIntersecting;
                setIsSticky(sticky);

                // If scrolling back to view, un-close the video so it reappears
                if (!sticky) {
                    setIsClosed(false);
                }
            },
            {
                threshold: 0,
                rootMargin: '-100px 0px 0px 0px',
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) observer.unobserve(containerRef.current);
        };
    }, []);

    const handleClose = () => {
        setIsClosed(true);
    };

    return (
        <div ref={containerRef} className={`relative w-full bg-black rounded-3xl ${aspectRatio === '16/9' ? 'aspect-video' : 'aspect-[9/16]'}`}>
            {/* 
              Player Wrapper
              - Rendered if: Not Sticky OR (Sticky AND Not Closed)
              - If Sticky + Closed: Unmounts (stops video, hides UI)
            */}
            {(!isSticky || !isClosed) && (
                <div
                    className={`
                        transition-all duration-500 ease-in-out z-50 overflow-hidden bg-black shadow-2xl
                        ${isSticky
                            ? `fixed bottom-4 right-4 ${aspectRatio === '16/9' ? 'w-64 aspect-video' : 'w-40 sm:w-48 aspect-[9/16]'} rounded-2xl border-2 border-white/20 ring-4 ring-black/5`
                            : 'absolute inset-0 w-full h-full rounded-3xl'
                        }
                    `}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClose();
                        }}
                        className={`
                            absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/90 z-20 backdrop-blur-sm transition-opacity duration-300
                            ${isSticky ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                        `}
                    >
                        <X size={16} />
                    </button>

                    <iframe
                        src={src}
                        className="w-full h-full object-cover"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ pointerEvents: 'auto' }}
                    />
                </div>
            )}
        </div>
    );
}
