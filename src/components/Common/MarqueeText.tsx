import React, { useRef, useState, useEffect } from 'react';

interface MarqueeTextProps {
  text: string;
  className?: string;
  isActive?: boolean;
  speed?: number; // duration in seconds
}

export const MarqueeText: React.FC<MarqueeTextProps> = ({
  text,
  className = '',
  isActive = false,
  speed = 10
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const isOverflowing = textRef.current.scrollWidth > containerRef.current.clientWidth;
        setShouldScroll(isOverflowing);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  const activeAnimation = shouldScroll && (isHovered || isActive);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={text}
      className={`marquee-wrapper overflow-hidden select-none ${className}`}
    >
      <div
        className={`marquee-track inline-flex items-center gap-6 whitespace-nowrap ${
          activeAnimation ? 'marquee-scrollable' : ''
        }`}
        style={{
          animationDuration: `${speed}s`
        }}
      >
        <span ref={textRef} className="shrink-0">{text}</span>
        {activeAnimation && (
          <>
            <span className="shrink-0 text-slate-400 font-mono">·</span>
            <span className="shrink-0">{text}</span>
          </>
        )}
      </div>
    </div>
  );
};
