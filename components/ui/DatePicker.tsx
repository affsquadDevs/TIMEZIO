'use client';

import { useState, useRef, useEffect } from 'react';
import { DateTime } from 'luxon';
import ui from '@/components/ui/ui.module.css';

interface DatePickerProps {
  value: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void;
  minDate?: string; // ISO date string (YYYY-MM-DD)
  maxDate?: string; // ISO date string (YYYY-MM-DD)
}

export function DatePicker({ value, onChange, minDate, maxDate }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const dt = DateTime.fromISO(value || DateTime.now().toISODate() || '');
    return dt.isValid ? dt : DateTime.now();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = DateTime.fromISO(value);
  const currentDate = DateTime.now();

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

  const formatDisplayDate = (dateStr: string) => {
    const dt = DateTime.fromISO(dateStr);
    if (!dt.isValid) return dateStr;
    return dt.toFormat('MMM dd, yyyy');
  };

  const handleDateSelect = (day: DateTime) => {
    const dateStr = day.toFormat('yyyy-MM-dd');
    onChange(dateStr);
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setViewMonth((prev) => {
      const newMonth = direction === 'prev' ? prev.minus({ months: 1 }) : prev.plus({ months: 1 });
      return newMonth;
    });
  };

  const goToToday = () => {
    const today = DateTime.now();
    setViewMonth(today);
    handleDateSelect(today);
  };

  const generateCalendarDays = () => {
    const firstDay = viewMonth.startOf('month');
    const lastDay = viewMonth.endOf('month');
    const startDate = firstDay.startOf('week'); // Start from Sunday
    const endDate = lastDay.endOf('week'); // End on Saturday

    const days: DateTime[] = [];
    let current = startDate;
    while (current <= endDate) {
      days.push(current);
      current = current.plus({ days: 1 });
    }
    return days;
  };

  const days = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isToday = (day: DateTime) => day.hasSame(currentDate, 'day');
  const isSelected = (day: DateTime) => day.hasSame(selectedDate, 'day');
  const isCurrentMonth = (day: DateTime) => day.hasSame(viewMonth, 'month');
  const isDisabled = (day: DateTime) => {
    if (minDate) {
      const min = DateTime.fromISO(minDate);
      if (min.isValid && day < min.startOf('day')) return true;
    }
    if (maxDate) {
      const max = DateTime.fromISO(maxDate);
      if (max.isValid && day > max.endOf('day')) return true;
    }
    return false;
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
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
        }}
      >
        <span>{formatDisplayDate(value)}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </button>

      {isOpen && (
        <div
          className={ui.card}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 8,
            zIndex: 1000,
            padding: 16,
            minWidth: 280,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-primary)',
                borderRadius: '6px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
              {viewMonth.toFormat('MMMM yyyy')}
            </div>
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-primary)',
                borderRadius: '6px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          {/* Week day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {weekDays.map((day) => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  padding: '8px 4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {days.map((day) => {
              const disabled = isDisabled(day);
              const selected = isSelected(day);
              const today = isToday(day);
              const currentMonth = isCurrentMonth(day);

              return (
                <button
                  key={day.toISO()}
                  type="button"
                  onClick={() => !disabled && handleDateSelect(day)}
                  disabled={disabled}
                  style={{
                    aspectRatio: '1',
                    padding: 0,
                    borderRadius: '8px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: selected ? 600 : 500,
                    backgroundColor: selected
                      ? 'var(--highlight)'
                      : today
                        ? 'var(--card-bg)'
                        : 'transparent',
                    color: disabled
                      ? 'var(--text-secondary)'
                      : selected
                        ? 'var(--background)'
                        : !currentMonth
                          ? 'var(--text-secondary)'
                          : 'var(--text-primary)',
                    border: today && !selected ? '2px solid var(--highlight)' : '2px solid transparent',
                    transition: 'all 0.2s ease',
                    opacity: disabled ? 0.4 : 1,
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!disabled && !selected) {
                      e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!disabled && !selected) {
                      e.currentTarget.style.backgroundColor = today ? 'var(--card-bg)' : 'transparent';
                      e.currentTarget.style.transform = '';
                    }
                  }}
                >
                  {day.day}
                </button>
              );
            })}
          </div>

          {/* Footer - Today button */}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--card-border)' }}>
            <button
              type="button"
              onClick={goToToday}
              className={ui.btn}
              style={{
                width: '100%',
                fontSize: '13px',
                padding: '8px 12px',
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

