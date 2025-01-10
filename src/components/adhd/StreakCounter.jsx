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
    if (!missions?.length) {
      setCurrentStreak(0);
      return;
    }

    // Get completed missions sorted by date
    const completedMissions = missions
      .filter(m => m.completed_at)
      .map(m => ({
        ...m,
        // Format the date as YYYY-MM-DD
        completedDate: m.completed_at.toISOString().split('T')[0]
      }))
      .sort((a, b) => b.completed_at - a.completed_at);

    if (completedMissions.length === 0) {
      setCurrentStreak(0);
      return;
    }

    // Get unique dates of completion
    const uniqueCompletionDates = [...new Set(completedMissions.map(m => m.completedDate))];
    
    // Calculate last 7 days of activity
    const last7Days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
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
    
    // Calculate streak
    let streak = 0;
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if there's a completion today
    if (uniqueCompletionDates[0] === todayStr) {
      streak = 1;
      
      // Check previous days
      let checkDate = new Date(today);
      let index = 1;
      
      while (index < uniqueCompletionDates.length) {
        checkDate.setDate(checkDate.getDate() - 1);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        if (uniqueCompletionDates[index] === checkDateStr) {
          streak++;
          index++;
        } else {
          break;
        }
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
          <div className="text-xl font-space font-bold text-space-primary">
            {bestStreak}
          </div>
          <div className="text-sm text-space-gray">
            Best Streak
          </div>
        </motion.div>
      </div>

      <div className="flex justify-between">
        {recentDays.map((day, index) => (
          <motion.div
            key={day.date}
            className={`w-8 h-8 rounded-lg ${
              day.completed ? 'bg-space-success' : 'bg-space-gray/20'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.1 }}
          />
        ))}
      </div>
    </div>
  );
}
