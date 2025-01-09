import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TIMER_STATES = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
  IDLE: 'idle'
};

const DEFAULT_TIMES = {
  [TIMER_STATES.WORK]: 25 * 60, // 25 minutes in seconds
  [TIMER_STATES.SHORT_BREAK]: 5 * 60, // 5 minutes
  [TIMER_STATES.LONG_BREAK]: 15 * 60 // 15 minutes
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
      // After 4 work sessions, take a long break
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

  return (
    <div className="flex flex-col items-center space-y-4">
      <motion.div 
        className={`text-4xl font-space font-bold ${getTimerColor()}`}
        animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
        transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
      >
        {formatTime(timeLeft)}
      </motion.div>
      
      <div className="flex space-x-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="mission-button"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={() => {
            setTimerState(TIMER_STATES.WORK);
            setTimeLeft(DEFAULT_TIMES[TIMER_STATES.WORK]);
            setIsRunning(false);
          }}
          className="mission-button"
        >
          Reset
        </button>
      </div>

      <div className="text-space-gray text-sm">
        {timerState === TIMER_STATES.WORK ? (
          `Focus Session ${workSessionsCompleted + 1}/4`
        ) : (
          `${timerState === TIMER_STATES.SHORT_BREAK ? 'Short' : 'Long'} Break`
        )}
      </div>
    </div>
  );
}
