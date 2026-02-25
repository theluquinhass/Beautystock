import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import BibiTooltip from './BibiTooltip';
import { useOnboarding } from '../../contexts/OnboardingContext';

export default function SpotlightOverlay({ targetSelector, title, text, padding = 4, isLast = false, onNext, isModal = false }) {
    const { skipOnboarding } = useOnboarding();
    const [rect, setRect] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isModal) return; // Modals don't need spotlight rect calculations

        const updateRect = () => {
            const el = document.querySelector(targetSelector);
            if (el) {
                const r = el.getBoundingClientRect();

                // If element is hidden (e.g. display: none or completely covered/zero-sized)
                if (r.width === 0 || r.height === 0) {
                    setRect(null);
                    return;
                }

                setRect({
                    top: r.top - padding,
                    left: r.left - padding,
                    width: r.width + padding * 2,
                    height: r.height + padding * 2,
                });

                // Scroll into view if not visible
                if (r.top < 0 || r.bottom > window.innerHeight) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                setRect(null); // Element not strictly found yet
            }
        };

        // Try to find the element a bit after render, useful for dynamic content
        const timeout = setTimeout(updateRect, 100);
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect, { passive: true });

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect);
        };
    }, [targetSelector, padding, isModal]);

    useEffect(() => {
        if (!rect) return;

        // Calculate tooltip position to not cover the spotlight
        const padding = 16;
        const isMobile = window.innerWidth < 640;
        const tooltipWidth = isMobile ? 320 : 384; // w-80 or w-96

        let top = rect.top + rect.height + padding;
        let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

        // Adjust for viewport edges
        if (top + 180 > window.innerHeight) { // If it goes below screen, put it above element
            top = rect.top - 180 - padding;
        }
        if (left < padding) left = padding;
        if (left + tooltipWidth > window.innerWidth - padding) left = window.innerWidth - tooltipWidth - padding;

        setTooltipPos({ top, left });
    }, [rect]);

    if (isModal) {
        return createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] pointer-events-auto" />
                <div className="relative z-10 pointer-events-auto">
                    <BibiTooltip
                        title={title}
                        text={text}
                        onNext={onNext}
                        onSkip={skipOnboarding}
                        isLast={isLast}
                    />
                </div>
            </div>,
            document.body
        );
    }

    // If we're not a modal and the target element isn't found/visible,
    // show a floating non-blocking tooltip at the bottom right.
    if (!rect) {
        return createPortal(
            <div className="fixed bottom-6 right-6 z-[100] pointer-events-auto">
                <BibiTooltip
                    title={title}
                    text={text}
                    onNext={onNext}
                    onSkip={skipOnboarding}
                    isLast={isLast}
                />
            </div>,
            document.body
        );
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* The dark overlay with a "hole" cut out using border masks */}
            <div
                className="absolute bg-gray-900/60 backdrop-blur-[2px] transition-all duration-300 ease-in-out pointer-events-auto"
                style={{
                    clipPath: `polygon(
                        0% 0%, 0% 100%, ${rect.left}px 100%, 
                        ${rect.left}px ${rect.top}px, 
                        ${rect.left + rect.width}px ${rect.top}px, 
                        ${rect.left + rect.width}px ${rect.top + rect.height}px, 
                        ${rect.left}px ${rect.top + rect.height}px, 
                        ${rect.left}px 100%, 100% 100%, 100% 0%
                    )`
                }}
                onClick={(e) => {
                    // Prevent clicks on the dark area
                    e.stopPropagation();
                    e.preventDefault();
                }}
            />

            {/* The outline ring around the element */}
            <div
                className="absolute border-2 border-pink-500 rounded-xl pointer-events-none transition-all duration-300 ease-in-out pulse-glow"
                style={{
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    boxShadow: '0 0 0 4px rgba(236, 72, 153, 0.2), inset 0 0 0 2px rgba(236, 72, 153, 0.1)'
                }}
            />

            {/* The Tooltip card */}
            <div
                className="absolute pointer-events-auto transition-all duration-300 ease-in-out"
                style={{ top: tooltipPos.top, left: tooltipPos.left }}
            >
                <BibiTooltip
                    title={title}
                    text={text}
                    onNext={onNext}
                    onSkip={skipOnboarding}
                    isLast={isLast}
                />
            </div>
        </div>,
        document.body
    );
}
