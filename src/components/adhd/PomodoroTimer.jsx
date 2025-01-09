import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TIMER_STATES = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
  IDLE: 'idle'
};

const DEFAULT_TIMES = {
  [TIMER_STATES.WORK]: 25 * 60,
  [TIMER_STATES.SHORT_BREAK]: 5 * 60,
  [TIMER_STATES.LONG_BREAK]: 15 * 60
};

export default function PomodoroTimer() {
  const [timerState, setTimerState] = useState(TIMER_STATES.IDLE);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMES[TIMER_STATES.WORK]);
  const [isRunning, setIsRunning] = useState(false);
  const [workSessionsCompleted, setWorkSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    if (timerState === TIMER_STATES.WORK) {
      setWorkSessionsCompleted(prev => prev + 1);
      if (workSessionsCompleted % 4 === 3) {
        setTimerState(TIMER_STATES.LONG_BREAK);
        setTimeLeft(DEFAULT_TIMES[TIMER_STATES.LONG_BREAK]);
      } else {
        setTimerState(TIMER_STATES.SHORT_BREAK);
        setTimeLeft(DEFAULT_TIMES[TIMER_STATES.SHORT_BREAK]);
      }
    } else {
      setTimerState(TIMER_STATES.WORK);
      setTimeLeft(DEFAULT_TIMES[TIMER_STATES.WORK]);
    }
    setIsRunning(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    switch (timerState) {
      case TIMER_STATES.WORK:
        return 'text-space-primary';
      case TIMER_STATES.SHORT_BREAK:
        return 'text-space-success';
      case TIMER_STATES.LONG_BREAK:
        return 'text-space-accent';
      default:
        return 'text-space-light';
    }
  };

  const progress = 1 - (timeLeft / DEFAULT_TIMES[timerState || TIMER_STATES.WORK]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        {/* Progress Circle */}
        <svg 
          className="w-32 h-32 transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            className="text-space-darker/20"
            strokeWidth="2"
            stroke="currentColor"
            fill="transparent"
            r="48"
            cx="50"
            cy="50"
          />
          
          {/* Progress circle */}
          <motion.circle
            className={getTimerColor()}
            strokeWidth="2"
            stroke="currentColor"
            fill="transparent"
            r="48"
            cx="50"
            cy="50"
            strokeDasharray="301.59"
            strokeDashoffset={301.59 * (1 - progress)}
            initial={{ strokeDashoffset: 301.59 }}
            animate={{ strokeDashoffset: 301.59 * (1 - progress) }}
            transition={{ duration: 0.5, ease: "linear" }}
          />

          {/* Inner circle */}
          <circle
            className="text-space-darker/30"
            fill="currentColor"
            r="44"
            cx="50"
            cy="50"
          />
        </svg>

        {/* Timer Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div 
            className={`text-3xl font-space font-bold ${getTimerColor()}`}
            animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
            transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
          >
            {formatTime(timeLeft)}
          </motion.div>
          <div className="text-sm text-space-gray mt-1">
            {timerState === TIMER_STATES.WORK ? (
              `Session ${workSessionsCompleted + 1}/4`
            ) : (
              `${timerState === TIMER_STATES.SHORT_BREAK ? 'Short' : 'Long'} Break`
            )}
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="mission-button px-6"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={() => {
            setTimerState(TIMER_STATES.WORK);
            setTimeLeft(DEFAULT_TIMES[TIMER_STATES.WORK]);
            setIsRunning(false);
          }}
          className="mission-button px-6"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
