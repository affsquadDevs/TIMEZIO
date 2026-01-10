'use client';

import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';

interface InfoPanelProps {
  lat?: number;
  lng?: number;
  timezone?: string;
}

export default function InfoPanel({ lat, lng, timezone }: InfoPanelProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [utcOffset, setUtcOffset] = useState<string>('');

  useEffect(() => {
    if (!timezone) {
      setCurrentTime('');
      setUtcOffset('');
      return;
    }

    const updateTime = () => {
      try {
        const dt = DateTime.now().setZone(timezone);
        setCurrentTime(dt.toFormat('yyyy-LL-dd HH:mm:ss'));
        
        const offset = dt.offset / 60; // Convert minutes to hours
        const offsetStr = offset >= 0 
          ? `UTC+${offset}` 
          : `UTC${offset}`; // Negative already has minus sign
        setUtcOffset(offsetStr);
      } catch (error) {
        console.error('Error updating time:', error);
        setCurrentTime('Error');
        setUtcOffset('Error');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [timezone]);

  if (lat === undefined || lng === undefined || !timezone) {
    return (
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-slate-700/50">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Location Information
        </h2>
        <div className="flex items-center justify-center py-8">
          <p className="text-slate-400 text-center">
            Click on the globe to select a location
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-slate-700/50">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
        Location Information
      </h2>
      <div className="space-y-4">
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
          <label className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">
            Latitude
          </label>
          <p className="text-lg sm:text-xl font-mono text-blue-300 mt-1 font-semibold">
            {lat.toFixed(4)}
          </p>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
          <label className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">
            Longitude
          </label>
          <p className="text-lg sm:text-xl font-mono text-blue-300 mt-1 font-semibold">
            {lng.toFixed(4)}
          </p>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
          <label className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">
            IANA Timezone
          </label>
          <p className="text-base sm:text-lg font-mono text-cyan-300 mt-1 break-words">
            {timezone}
          </p>
        </div>
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg p-4 border border-blue-500/30">
          <label className="text-xs sm:text-sm font-medium text-slate-300 uppercase tracking-wider">
            Local Time
          </label>
          <p className="text-lg sm:text-xl font-mono text-white mt-1 font-semibold">
            {currentTime || 'Loading...'}
          </p>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
          <label className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider">
            UTC Offset
          </label>
          <p className="text-lg sm:text-xl font-mono text-green-400 mt-1 font-semibold">
            {utcOffset || 'Loading...'}
          </p>
        </div>
      </div>
    </div>
  );
}

