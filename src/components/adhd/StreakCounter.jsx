import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function StreakCounter({ missions }) {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    // Load streaks from localStorage
    const savedBestStreak = localStorage.getItem('bestStreak');
    if (savedBestStreak) {
      setBestStreak(parseInt(savedBestStreak));
    }

    calculateCurrentStreak();
  }, [missions]);

  const calculateCurrentStreak = () => {
    if (!missions.length) return;

    // Get completed missions sorted by date
    const completedMissions = missions
      .filter(m => m.status === 'complete')
      .map(m => ({
        ...m,
        completedDate: new Date(m.completedAt).toISOString().split('T')[0]
      }))
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    if (completedMissions.length === 0) {
      setCurrentStreak(0);
      return;
    }

    // Get unique dates of completion
    const uniqueCompletionDates = [...new Set(completedMissions.map(m => m.completedDate))];
    
    let streak = 1; // Start with 1 for today if we have a completion
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if most recent completion was today
    const mostRecentCompletion = new Date(uniqueCompletionDates[0]);
    if (mostRecentCompletion.toISOString().split('T')[0] !== currentDate.toISOString().split('T')[0]) {
      setCurrentStreak(0);
      return;
    }

    // Check consecutive days
    for (let i = 1; i < uniqueCompletionDates.length; i++) {
      const currentDay = new Date(uniqueCompletionDates[i - 1]);
      const previousDay = new Date(uniqueCompletionDates[i]);
      
      // Calculate difference in days
      const diffTime = currentDay.getTime() - previousDay.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    console.log('Current streak:', streak); // Debug log
    setCurrentStreak(streak);

    // Update best streak if current is higher
    if (streak > bestStreak) {
      setBestStreak(streak);
      localStorage.setItem('bestStreak', streak.toString());
    }
  };

  return (
    <div className="flex items-center space-x-6">
      <motion.div 
        className="text-center"
        whileHover={{ scale: 1.1 }}
      >
        <div className="text-xl font-space font-bold text-space-primary">
          {currentStreak}
        </div>
        <div className="text-sm text-space-gray">
          Current Streak
        </div>
      </motion.div>

      <motion.div 
        className="text-center"
        whileHover={{ scale: 1.1 }}
      >
        <div className="text-xl font-space font-bold text-space-success">
          {bestStreak}
        </div>
        <div className="text-sm text-space-gray">
          Best Streak
        </div>
      </motion.div>
    </div>
  );
}
