import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, PauseIcon, StopIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const DEFAULT_WORK_TIME = 25 * 60; // 25 minutes in seconds
const DEFAULT_BREAK_TIME = 5 * 60; // 5 minutes in seconds

export default function PomodoroTimer({ activeMission }) {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const timerRef = useRef(null);
  const prevMissionRef = useRef(null);

  // Handle mission changes
  useEffect(() => {
    if (activeMission && activeMission.id !== prevMissionRef.current) {
      // New mission started
      clearInterval(timerRef.current);
      const duration = activeMission.duration * 60;
      setTimeLeft(duration);
      setIsBreak(false);
      setIsRunning(true);
      startTimer(duration);
      prevMissionRef.current = activeMission.id;
    } else if (!activeMission && prevMissionRef.current) {
      // Mission completed or cleared
      clearInterval(timerRef.current);
      setTimeLeft(DEFAULT_WORK_TIME);
      setIsBreak(false);
      setIsRunning(false);
      prevMissionRef.current = null;
    }
  }, [activeMission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = (initialTime) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePlayPause = () => {
    if (isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);
    } else {
      setIsRunning(true);
      startTimer(timeLeft);
    }
  };

  const handleReset = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    if (activeMission) {
      setTimeLeft(activeMission.duration * 60);
    } else {
      setTimeLeft(isBreak ? DEFAULT_BREAK_TIME : DEFAULT_WORK_TIME);
    }
  };

  const toggleMode = () => {
    if (!activeMission) {
      clearInterval(timerRef.current);
      setIsRunning(false);
      const newIsBreak = !isBreak;
      setIsBreak(newIsBreak);
      setTimeLeft(newIsBreak ? DEFAULT_BREAK_TIME : DEFAULT_WORK_TIME);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = activeMission 
    ? 1 - (timeLeft / (activeMission.duration * 60))
    : 1 - (timeLeft / (isBreak ? DEFAULT_BREAK_TIME : DEFAULT_WORK_TIME));

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xs mx-auto p-4">
      <div className="relative w-32 h-32 mb-6">
        <svg 
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            className="text-space-darker/20"
            strokeWidth="2"
            stroke="currentColor"
            fill="transparent"
            r="48"
            cx="50"
            cy="50"
          />
          
          <motion.circle
            className={`${
              timeLeft === 0 
                ? "text-red-400" 
                : isBreak 
                  ? "text-green-400" 
                  : "text-space-primary"
            }`}
            strokeWidth="2"
            stroke="currentColor"
            fill="transparent"
            r="48"
            cx="50"
            cy="50"
            strokeDasharray="301.59"
            strokeDashoffset={301.59 * (1 - progress)}
            initial={{ strokeDashoffset: 301.59 }}
            animate={{ 
              strokeDashoffset: 301.59 * (1 - progress),
              stroke: timeLeft < 60 ? ["#f87171", "#60a5fa"] : undefined
            }}
            transition={{ 
              duration: 0.5, 
              ease: "linear",
              stroke: { duration: 1, repeat: timeLeft < 60 ? Infinity : 0 }
            }}
          />

          <circle
            className="text-space-darker/30"
            fill="currentColor"
            r="44"
            cx="50"
            cy="50"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div 
            className={`text-3xl font-space font-bold ${
              timeLeft === 0 
                ? "text-red-400" 
                : isBreak 
                  ? "text-green-400" 
                  : "text-space-primary"
            }`}
            animate={{ 
              scale: isRunning ? [1, 1.02, 1] : 1,
              opacity: timeLeft < 60 ? [1, 0.7, 1] : 1
            }}
            transition={{ 
              duration: timeLeft < 60 ? 0.5 : 1, 
              repeat: Infinity 
            }}
          >
            {formatTime(timeLeft)}
          </motion.div>
          <div className="text-sm text-space-gray mt-1">
            {activeMission ? activeMission.title : (isBreak ? 'Break Time' : 'Work Time')}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col w-full space-y-2">
        <button
          onClick={handlePlayPause}
          className={`mission-button h-10 flex items-center justify-center gap-1.5 ${
            !isRunning ? 'bg-space-primary/20 hover:bg-space-primary/40' : ''
          }`}
        >
          {isRunning ? (
            <>
              <PauseIcon className="h-4 w-4" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <PlayIcon className="h-4 w-4" />
              <span>{timeLeft === 0 ? 'Start' : 'Resume'}</span>
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="mission-button h-10 flex items-center justify-center gap-1.5 bg-space-darker/40 hover:bg-space-darker/60"
        >
          <StopIcon className="h-4 w-4" />
          <span>Reset</span>
        </button>
        {!activeMission && (
          <button
            onClick={toggleMode}
            className="mission-button h-10 flex items-center justify-center gap-1.5 bg-space-darker/40 hover:bg-space-darker/60"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>{isBreak ? 'Work' : 'Break'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
