import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function StreakCounter({ missions }) {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [recentDays, setRecentDays] = useState([]);

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
    
    // Calculate last 7 days of activity
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push({
        date: dateStr,
        completed: uniqueCompletionDates.includes(dateStr)
      });
    }
    setRecentDays(last7Days);
    
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
      
      const diffTime = currentDay.getTime() - previousDay.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    setCurrentStreak(streak);

    // Update best streak if current is higher
    if (streak > bestStreak) {
      setBestStreak(streak);
      localStorage.setItem('bestStreak', streak.toString());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

      {/* Activity Graph */}
      <div className="space-y-2">
        <div className="text-sm text-space-gray mb-2">Last 7 Days</div>
        <div className="flex justify-between gap-1.5">
          {recentDays.map((day, index) => (
            <motion.div
              key={day.date}
              className="flex-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                className={`h-8 rounded-md ${
                  day.completed 
                    ? 'bg-space-primary' 
                    : 'bg-space-darker/40 border border-space-gray/20'
                }`}
                whileHover={{ scale: 1.1 }}
                animate={day.completed ? {
                  boxShadow: ['0 0 0 0 rgba(0, 255, 255, 0)', '0 0 20px 2px rgba(0, 255, 255, 0.2)', '0 0 0 0 rgba(0, 255, 255, 0)']
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="text-center text-xs text-space-gray mt-1">
                {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
