export const calculateStreak = (missions) => {
  if (!missions.length) return 0;

  // Sort completed missions by date
  const completedMissions = missions
    .filter(m => m.completed_at)
    .sort((a, b) => b.completed_at - a.completed_at);

  if (!completedMissions.length) return 0;

  let streak = 1;
  let currentDate = new Date(completedMissions[0].completed_at);
  
  // Set time to midnight for consistent day comparison
  currentDate.setHours(0, 0, 0, 0);
  
  for (let i = 1; i < completedMissions.length; i++) {
    const missionDate = new Date(completedMissions[i].completed_at);
    missionDate.setHours(0, 0, 0, 0);
    
    // Check if this mission was completed the previous day
    const dayDiff = Math.floor((currentDate - missionDate) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      streak++;
      currentDate = missionDate;
    } else if (dayDiff > 1) {
      // Streak broken
      break;
    }
  }

  return streak;
};

export const calculateAchievements = (missions) => {
  const achievements = [];
  const completedMissions = missions.filter(m => m.completed_at);

  // First Mission
  if (completedMissions.length === 1) {
    achievements.push("First Mission Complete! 🚀");
  }

  // Mission Milestones
  const milestones = [5, 10, 25, 50, 100];
  for (const milestone of milestones) {
    if (completedMissions.length === milestone) {
      achievements.push(`${milestone} Missions Complete! 🎯`);
    }
  }

  // Perfect Week (7-day streak)
  const currentStreak = calculateStreak(missions);
  if (currentStreak === 7) {
    achievements.push("Perfect Week! 🌟");
  }

  // Speed Demon (complete mission in under 1 hour)
  const speedMissions = completedMissions.filter(mission => {
    if (!mission.started_at || !mission.completed_at) return false;
    const start = new Date(mission.started_at);
    const end = new Date(mission.completed_at);
    return (end - start) < 1000 * 60 * 60; // less than 1 hour
  });

  if (speedMissions.length > 0) {
    achievements.push("Speed Demon! ⚡");
  }

  return achievements;
};

export const getRecentAchievements = (missions) => {
  // Get achievements from the last 7 days
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const recentMissions = missions.filter(m => 
    m.completed_at && new Date(m.completed_at) > lastWeek
  );
  
  return calculateAchievements(recentMissions);
};
