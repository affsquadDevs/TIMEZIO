'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ui from '@/components/ui/ui.module.css';

interface TimePickerProps {
  value: string; // HH:mm format
  onChange: (time: string) => void;
  durationMinutes: number; // Step in minutes (15, 30, 45, 60, 90, 120)
}

export function TimePicker({ value, onChange, durationMinutes }: TimePickerProps) {
  const t = useTranslations('ui.timePicker');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const [hour, minute] = value ? value.split(':').map(Number) : [14, 0];
  const selectedHour = isNaN(hour) ? 14 : hour;
  const selectedMinute = isNaN(minute) ? 0 : minute;

  // Normalize minute to nearest step
  const normalizedMinute = Math.round(selectedMinute / durationMinutes) * durationMinutes;
  const currentMinute = normalizedMinute >= 60 ? 0 : normalizedMinute;

  // Calculate end time
  const startMinutes = selectedHour * 60 + currentMinute;
  const endMinutes = startMinutes + durationMinutes;
  const endHour = Math.floor(endMinutes / 60) % 24;
  const endMin = endMinutes % 60;

  const formatTime = (h: number, m: number) => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const displayValue = formatTime(selectedHour, currentMinute);
  const displayEnd = formatTime(endHour, endMin);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Generate minute options based on duration step
  const minuteOptions: number[] = [];
  for (let m = 0; m < 60; m += durationMinutes) {
    minuteOptions.push(m);
  }

  const handleTimeChange = (newHour: number, newMinute: number) => {
    const newTime = formatTime(newHour, newMinute);
    onChange(newTime);
  };

  const incrementHour = () => {
    const newHour = (selectedHour + 1) % 24;
    handleTimeChange(newHour, currentMinute);
  };

  const decrementHour = () => {
    const newHour = selectedHour === 0 ? 23 : selectedHour - 1;
    handleTimeChange(newHour, currentMinute);
  };

  const incrementMinute = () => {
    const currentIndex = minuteOptions.indexOf(currentMinute);
    const nextIndex = (currentIndex + 1) % minuteOptions.length;
    handleTimeChange(selectedHour, minuteOptions[nextIndex]);
  };

  const decrementMinute = () => {
    const currentIndex = minuteOptions.indexOf(currentMinute);
    const prevIndex = currentIndex === 0 ? minuteOptions.length - 1 : currentIndex - 1;
    handleTimeChange(selectedHour, minuteOptions[prevIndex]);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={ui.input}
        style={{
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          userSelect: 'none',
        }}
      >
        <span>{displayValue} - {displayEnd}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 8,
            zIndex: 1000,
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            padding: 20,
            minWidth: 200,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            {/* Hours */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  incrementHour();
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  border: '1px solid var(--card-border)',
                  backgroundColor: 'var(--card-bg)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--highlight)';
                  e.currentTarget.style.borderColor = 'var(--highlight)';
                  e.currentTarget.style.color = 'var(--background)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                  e.currentTarget.style.borderColor = 'var(--card-border)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </button>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  minWidth: 60,
                  textAlign: 'center',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--card-bg)',
                  border: '2px solid var(--highlight)',
                }}
              >
                {selectedHour.toString().padStart(2, '0')}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  decrementHour();
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  border: '1px solid var(--card-border)',
                  backgroundColor: 'var(--card-bg)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--highlight)';
                  e.currentTarget.style.borderColor = 'var(--highlight)';
                  e.currentTarget.style.color = 'var(--background)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                  e.currentTarget.style.borderColor = 'var(--card-border)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 4 }}>{t('hour')}</div>
            </div>

            <div style={{ fontSize: '32px', fontWeight: 600, color: 'var(--text-secondary)', paddingTop: 8 }}>:</div>

            {/* Minutes */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  incrementMinute();
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  border: '1px solid var(--card-border)',
                  backgroundColor: 'var(--card-bg)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--highlight)';
                  e.currentTarget.style.borderColor = 'var(--highlight)';
                  e.currentTarget.style.color = 'var(--background)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                  e.currentTarget.style.borderColor = 'var(--card-border)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </button>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  minWidth: 60,
                  textAlign: 'center',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--card-bg)',
                  border: '2px solid var(--highlight)',
                }}
              >
                {currentMinute.toString().padStart(2, '0')}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  decrementMinute();
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  border: '1px solid var(--card-border)',
                  backgroundColor: 'var(--card-bg)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--highlight)';
                  e.currentTarget.style.borderColor = 'var(--highlight)';
                  e.currentTarget.style.color = 'var(--background)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                  e.currentTarget.style.borderColor = 'var(--card-border)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 4 }}>{t('min')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
