
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Position } from '../types';

interface DraggableToggleProps {
  active: boolean;
  onToggle: () => void;
}

const DraggableToggle: React.FC<DraggableToggleProps> = ({ active, onToggle }) => {
  const [pos, setPos] = useState<Position>({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouse: Position; initial: Position } | null>(null);
  const hasMovedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      mouse: { x: clientX, y: clientY },
      initial: { x: pos.x, y: pos.y }
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const dx = clientX - dragStartRef.current.mouse.x;
    const dy = clientY - dragStartRef.current.mouse.y;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      hasMovedRef.current = true;
    }

    // Keep within bounds
    const newX = Math.min(Math.max(20, dragStartRef.current.initial.x + dx), window.innerWidth - 64);
    const newY = Math.min(Math.max(20, dragStartRef.current.initial.y + dy), window.innerHeight - 64);

    setPos({ x: newX, y: newY });
  }, [isDragging, pos.x, pos.y]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleClick = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onToggle();
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onClick={handleClick}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      className={`fixed z-[10001] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/20 select-none
        ${active ? 'bg-blue-600 text-white scale-110' : 'bg-slate-800/80 text-blue-200'} 
        hover:scale-105 active:scale-95 group overflow-hidden`}
      title="Toggle Snow Effect"
    >
      <div className={`absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
      <i className={`fas fa-snowflake text-2xl transition-transform duration-500 ${active ? 'rotate-180 scale-125' : 'rotate-0'}`}></i>
    </button>
  );
};

export default DraggableToggle;
