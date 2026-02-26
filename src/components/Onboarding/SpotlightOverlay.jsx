import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import BibiTooltip from './BibiTooltip';

export default function SpotlightOverlay({
    targetSelector,
    title,
    text,
    padding = 6,
    stepIndex,
    totalSteps,
    isLast = false,
    onNext,
    onPrev,
    onSkip,
    isModal = false
}) {
    const [rect, setRect] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isModal) return;

        const updateRect = () => {
            const el = document.querySelector(targetSelector);
            if (el) {
                const r = el.getBoundingClientRect();

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

                // Scroll into view if not fully visible
                const isVisible = (
                    r.top >= 0 &&
                    r.left >= 0 &&
                    r.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    r.right <= (window.innerWidth || document.documentElement.clientWidth)
                );

                if (!isVisible) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                setRect(null);
            }
        };

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

        const tipMargin = 16;
        const isMobile = window.innerWidth < 640;
        const tooltipWidth = isMobile ? 320 : 384;

        // Tooltip Default Position (Below element)
        let top = rect.top + rect.height + tipMargin;
        let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

        // Vertical adjustment if it spills off bottom
        if (top + 200 > window.innerHeight) {
            // put above
            top = rect.top - 200 - tipMargin;
        }

        // Bounds checking horizontally
        if (left < tipMargin) left = tipMargin;
        if (left + tooltipWidth > window.innerWidth - tipMargin) {
            left = window.innerWidth - tooltipWidth - tipMargin;
        }

        setTooltipPos({ top, left });
    }, [rect]);

    if (isModal) {
        return createPortal(
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-auto">
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]" />
                <div className="relative z-10">
                    <BibiTooltip
                        title={title}
                        text={text}
                        stepIndex={stepIndex}
                        totalSteps={totalSteps}
                        onNext={onNext}
                        onPrev={onPrev}
                        onSkip={onSkip}
                        isLast={isLast}
                    />
                </div>
            </div>,
            document.body
        );
    }

    if (!rect) {
        return createPortal(
            <div className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-[120] pointer-events-auto">
                <BibiTooltip
                    title={title}
                    text={text}
                    stepIndex={stepIndex}
                    totalSteps={totalSteps}
                    onNext={onNext}
                    onPrev={onPrev}
                    onSkip={onSkip}
                    isLast={isLast}
                />
            </div>,
            document.body
        );
    }

    return createPortal(
        <div className="fixed inset-0 z-[120] pointer-events-none">
            {/* Cutout Mask */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] transition-all duration-300 ease-in-out pointer-events-auto"
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
                    e.stopPropagation();
                    e.preventDefault();
                }}
            />

            {/* Target Highlight Ring */}
            <div
                className="absolute border-2 border-pink-500 rounded-2xl transition-all duration-300 ease-in-out pulse-glow pointer-events-none"
                style={{
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    boxShadow: '0 0 0 4px rgba(236, 72, 153, 0.2), inset 0 0 0 2px rgba(236, 72, 153, 0.1)'
                }}
            />

            {/* Tooltip Wrapper */}
            <div
                className="absolute transition-all duration-300 ease-in-out pointer-events-none z-10"
                style={{ top: tooltipPos.top, left: tooltipPos.left }}
            >
                <BibiTooltip
                    title={title}
                    text={text}
                    stepIndex={stepIndex}
                    totalSteps={totalSteps}
                    onNext={onNext}
                    onPrev={onPrev}
                    onSkip={onSkip}
                    isLast={isLast}
                />
            </div>
        </div>,
        document.body
    );
}
