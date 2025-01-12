import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { 
  ClockIcon, 
  RocketLaunchIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowUturnLeftIcon, 
  ArrowPathIcon,
  ChevronDownIcon,
  PlusIcon,
  PlayIcon 
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import BlackHoleThree from './components/BlackHoleThree'
import PomodoroTimer from './components/adhd/PomodoroTimer';
import StreakCounter from './components/adhd/StreakCounter';
import MissionTemplates from './components/adhd/MissionTemplates';
import Celebration from './components/adhd/Celebration';
import { useMissions } from './hooks/useMissions';
import { seedDatabase } from './firebase/seedData';
import MissionForm from './components/mission/MissionForm';
import MissionCard from './components/mission/MissionCard';
import { useAuth } from './hooks/useAuth';
import toast, { Toaster } from 'react-hot-toast';
import { calculateStreak, getRecentAchievements } from './utils/stats';

// Mission status helper functions
const getMissionStatus = (mission) => {
  if (mission.completed_at) return 'complete';
  if (mission.started_at) return 'in-progress';
  return 'pending';
};

const getMissionStatusClass = (status) => {
  switch (status) {
    case 'complete':
      return 'bg-space-success';
    case 'in-progress':
      return 'bg-space-warning';
    case 'pending':
    default:
      return 'bg-space-gray';
  }
};

function App() {
  const { user, convertToPermamentAccount, signOut } = useAuth();
  const { missions, loading, error, createMission, startMission, completeMission, revertMission, updateSubtask, deleteMission } = useMissions();
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showMissionForm, setShowMissionForm] = useState(false)
  const [showMissionLog, setShowMissionLog] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    subtasks: [],
    isRecurring: false,
    recurringDays: []
  })
  const [recentAchievements, setRecentAchievements] = useState([]);

  useEffect(() => {
    if (missions.length > 0) {
      setRecentAchievements(getRecentAchievements(missions));
    }
  }, [missions]);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCreateMission = async (missionData) => {
    console.log('🌟 Creating new mission:', missionData);

    if (!missionData.title?.trim()) {
      toast.error('Please enter a mission title');
      return;
    }

    try {
      await createMission(missionData);
      setShowMissionForm(false);
      console.log('✅ Mission created successfully');
      toast.success('Mission created!');
    } catch (err) {
      console.error('❌ Error creating mission:', err);
      toast.error(err.message);
    }
  };

  const handleMissionStart = async (missionId) => {
    try {
      await startMission(missionId);
      toast.success('Mission started!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleMissionComplete = async (missionId) => {
    try {
      await completeMission(missionId);
      toast.success('Mission completed!');
      
      // Show celebration
      setCelebrationMessage('Mission Accomplished!');
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    } catch (err) {
      console.error('❌ Error completing mission:', err);
      toast.error(err.message);
    }
  };

  const handleMissionRevert = async (missionId) => {
    try {
      await revertMission(missionId);
      toast.success('Mission reverted!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleMissionDelete = async (missionId) => {
    try {
      await deleteMission(missionId);
      toast.success('Mission deleted');
    } catch (err) {
      console.error('❌ Error deleting mission:', err);
      toast.error(err.message);
    }
  };

  const handleSubtaskComplete = async (missionId, subtaskId) => {
    console.log('📋 Completing subtask:', subtaskId, 'for mission:', missionId);
    try {
      await updateSubtask(missionId, subtaskId, 'completed');
      console.log('✅ Subtask completed successfully');
    } catch (err) {
      console.error('❌ Error completing subtask:', err);
    }
  };

  const handleTemplateSelect = async (template) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const missionData = {
      title: template.title,
      description: template.description,
      duration: template.duration,
      time: `${hours}:${minutes}`,
      category: template.category,
      isRecurring: false,
      subtasks: null,
      aiSuggestions: null
    };

    try {
      await createMission(missionData);
      console.log('✅ Quick mission created:', template.title);
    } catch (err) {
      console.error('❌ Error creating quick mission:', err);
    }
  };

  const handleRecurringDayToggle = (day) => {
    setNewMission(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day]
    }))
  }

  const showCelebrationMessage = (message) => {
    setCelebrationMessage(message);
    setShowCelebration(true);
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
  };

  const [showWelcome, setShowWelcome] = useState(true);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-space-darker">
        <div className="text-space-primary">Loading missions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-space-darker">
        <div className="text-red-500">Error loading missions: {error.message}</div>
      </div>
    );
  }

  // Filter missions for timeline
  const timelineMissions = missions.filter(mission => !mission.completed_at);
  console.log('📋 Timeline missions:', {
    total: missions.length,
    incomplete: timelineMissions.length,
    missions: timelineMissions.map(m => ({
      id: m.id,
      title: m.title,
      completed: !!m.completed_at
    }))
  });

  return (
    <div className="h-screen w-screen overflow-hidden bg-space-darker">
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#38bdf8',
              secondary: '#1a1a2e',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1a1a2e',
            },
          },
        }}
      />
      <AnimatePresence>
        {!loading && showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
          >
            {user?.isAnonymous ? (
              // New User Welcome
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-space-darker/95 p-6 rounded-lg border border-space-primary/20 max-w-md w-full shadow-xl"
              >
                <h2 className="text-2xl font-space text-space-primary mb-4">Welcome to Space Scheduler</h2>
                <p className="text-space-gray mb-6">Ready to start your space journey? You can:</p>
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      const email = window.prompt('Enter your email to get started:');
                      if (email) {
                        convertToPermamentAccount(email)
                          .then(() => toast.success('Check your email for a magic link!'))
                          .catch(error => toast.error(error.message));
                      }
                    }}
                    className="w-full px-4 py-3 rounded-md bg-space-primary/20 text-space-primary border border-space-primary/30 hover:bg-space-primary/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Sign Up with Email
                  </button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-space-gray/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-space-darker text-space-gray">or</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWelcome(false)}
                    className="w-full px-4 py-3 rounded-md bg-space-gray/10 text-space-gray border border-space-gray/20 hover:bg-space-gray/20 transition-colors"
                  >
                    Continue as Guest
                  </button>
                </div>
              </motion.div>
            ) : (
              // Returning User Welcome with Stats
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-space-darker/95 p-6 rounded-lg border border-space-primary/20 max-w-md w-full shadow-xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <h2 className="text-2xl font-space text-space-primary">Welcome Back, Commander!</h2>
                </div>
                
                {/* Mission Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-space-primary/5 p-4 rounded-lg border border-space-primary/10">
                    <div className="text-2xl font-bold text-space-primary">
                      {missions.filter(m => m.completed_at).length}
                    </div>
                    <div className="text-sm text-space-gray">Missions Completed</div>
                  </div>
                  <div className="bg-space-primary/5 p-4 rounded-lg border border-space-primary/10">
                    <div className="text-2xl font-bold text-space-primary">
                      {calculateStreak(missions)}
                    </div>
                    <div className="text-sm text-space-gray">Day Streak</div>
                  </div>
                </div>

                {/* Recent Achievements */}
                {recentAchievements.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-space-primary text-sm font-medium mb-2">Recent Achievements</h3>
                    <div className="space-y-2">
                      {recentAchievements.map((achievement, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-space-gray text-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h4a3 3 0 01-3 3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          {achievement}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowWelcome(false)}
                  className="w-full px-4 py-3 rounded-md bg-space-primary/20 text-space-primary border border-space-primary/30 hover:bg-space-primary/30 transition-colors"
                >
                  Continue to Mission Control
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Move the buttons to the top-left corner */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <button
          onClick={async () => {
            try {
              await seedDatabase();
            } catch (err) {
              console.error('Error seeding database:', err);
            }
          }}
          className="px-3 py-1.5 rounded-full bg-space-darker/80 border border-space-primary/20 text-space-primary hover:bg-space-primary/10 transition-colors"
        >
          Seed Database
        </button>
        <Link 
          to="/black-hole-test"
          className="px-4 py-2 rounded-md bg-space-primary/20 text-space-primary border border-space-primary/30 hover:bg-space-primary/30"
        >
          View Black Hole
        </Link>
        <button
          onClick={() => {
            const title = window.prompt('Enter mission title:');
            if (!title?.trim()) {
              toast.error('Mission title is required');
              return;
            }
            createMission({
              title,
              description: "Testing the missions system",
              subtasks: [],
              created_at: new Date()
            }).then(() => {
              toast.success('Test mission created!');
            }).catch(err => {
              toast.error(err.message);
            });
          }}
          className="px-4 py-2 bg-space-primary/20 text-space-primary rounded-md hover:bg-space-primary/30 transition-colors"
        >
          Create Test Mission
        </button>
      </div>

      {/* Keep the user status in top-right */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {user && !user.isAnonymous ? (
          <div className="flex items-center gap-2 bg-space-darker/80 px-3 py-1.5 rounded-full border border-space-primary/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-space-primary">{user.email}</span>
            <button
              onClick={signOut}
              className="ml-2 text-space-gray hover:text-space-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-space-darker/80 px-3 py-1.5 rounded-full border border-space-gray/20">
            <div className="w-2 h-2 rounded-full bg-space-gray animate-pulse" />
            <span className="text-sm text-space-gray">Anonymous Explorer</span>
          </div>
        )}
      </div>
      {/* Black Hole Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas
          camera={{
            position: [6, 9, 12], // Moved camera slightly back
            fov: 45
          }}
          style={{
            background: '#000'
          }}
        >
          <BlackHoleThree />
        </Canvas>
      </div>

      {/* Main Content - above the black hole */}
      <div className="relative z-10 h-screen overflow-y-auto">
        {/* Background Grid */}
        <div className="fixed inset-0 w-full h-full">
          <div className="grid-bg" />
        </div>

        {/* Main Content */}
        <div className="relative w-full min-h-full">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <header className="text-center mb-8">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-space-primary mb-2 animate-glow"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Mission Control
              </motion.h1>
              <p className="text-space-gray text-lg font-mono">
                Orbital Time: {currentTime.toLocaleTimeString()}
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="mission-panel flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4 text-space-primary">Focus Timer</h2>
                <PomodoroTimer 
                  activeMission={missions.find(m => getMissionStatus(m) === 'in-progress')} 
                />
              </div>
              
              <div className="mission-panel">
                <h2 className="text-xl font-bold mb-4 text-space-primary">Mission Streaks</h2>
                <StreakCounter missions={missions} />
              </div>
              
              <div className="mission-panel">
                <h2 className="text-xl font-bold mb-4 text-space-primary">Quick Missions</h2>
                <MissionTemplates onSelectTemplate={handleTemplateSelect} />
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-full">
              {/* Left Panel - Stats & Logs */}
              <motion.div 
                className="space-y-6 col-span-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {/* Mission Stats */}
                <div className="mission-panel">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-space-primary mb-1">
                        {missions.filter(m => !m.completed_at).length}
                      </div>
                      <div className="text-sm text-space-gray">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-space-primary mb-1">
                        {missions.filter(m => m.completed_at).length}
                      </div>
                      <div className="text-sm text-space-gray">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-space-primary mb-1">
                        {calculateStreak(missions)}
                      </div>
                      <div className="text-sm text-space-gray">Day Streak</div>
                    </div>
                  </div>
                </div>

                {/* Desktop Mission Log */}
                <div className="mission-panel">
                  <h2 className="text-xl font-bold mb-4 text-space-primary">Mission Logs</h2>
                  <div className="space-y-3">
                    {missions.filter(m => m.completed_at)
                      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
                      .slice(0, 5)
                      .map(mission => (
                        <div key={mission.id} className="p-3 bg-space-darker/50 rounded-lg border border-space-gray/20">
                          <h3 className="text-sm font-space mb-1 text-space-light">{mission.title}</h3>
                          {mission.isRecurring && (
                            <div className="flex items-center gap-1 text-xs text-space-success mb-2">
                              <ArrowPathIcon className="h-3 w-3" />
                              <span>Recurring Mission</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-space-gray">
                              {new Date(mission.completed_at).toLocaleTimeString()}
                            </span>
                            <button
                              onClick={() => handleMissionRevert(mission.id)}
                              className="text-space-primary hover:text-space-primary/80 flex items-center gap-1"
                            >
                              <ArrowUturnLeftIcon className="h-3 w-3" />
                              <span>Revert</span>
                            </button>
                          </div>
                          <p className="text-gray-400 text-sm">{mission.description}</p>
                        </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Mission Log */}
                {missions.filter(m => m.completed_at).length > 0 && (
                  <div className="block md:hidden">
                    <div className="mission-panel">
                      <button 
                        onClick={() => setShowMissionLog(!showMissionLog)}
                        className="w-full flex items-center justify-between text-xl font-bold text-space-light"
                      >
                        <span>Mission Logs</span>
                        <ChevronDownIcon 
                          className={`h-5 w-5 transition-transform ${showMissionLog ? 'rotate-180' : ''}`}
                        />
                      </button>
                      
                      <AnimatePresence>
                        {showMissionLog && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3 mt-4 overflow-hidden"
                          >
                            {missions.filter(m => m.completed_at)
                              .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
                              .slice(0, 5)
                              .map(mission => (
                                <div key={mission.id} className="p-3 bg-space-darker/50 rounded-lg border border-space-gray/20">
                                  <h3 className="text-sm font-space mb-1 text-space-light">{mission.title}</h3>
                                  {mission.isRecurring && (
                                    <div className="flex items-center gap-1 text-xs text-space-success mb-2">
                                      <ArrowPathIcon className="h-3 w-3" />
                                      <span>Recurring Mission</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-space-gray">
                                      {new Date(mission.completed_at).toLocaleTimeString()}
                                    </span>
                                    <button
                                      onClick={() => handleMissionRevert(mission.id)}
                                      className="text-space-primary hover:text-space-primary/80 flex items-center gap-1"
                                    >
                                      <ArrowUturnLeftIcon className="h-3 w-3" />
                                      <span>Revert</span>
                                    </button>
                                  </div>
                                  <p className="text-gray-400 text-sm">{mission.description}</p>
                                </div>
                              ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Center Panel - Mission Timeline */}
              <motion.div 
                className="mission-panel col-span-1 md:col-span-2 w-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-space-primary">Mission Timeline</h2>
                  <button
                    onClick={() => setShowMissionForm(true)}
                    className="mission-button"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Mission
                  </button>
                </div>

                <AnimatePresence mode="popLayout">
                  {timelineMissions.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-8"
                    >
                      <RocketLaunchIcon className="h-12 w-12 mx-auto text-space-gray mb-4" />
                      <p className="text-space-gray">No missions yet. Create one to get started!</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3 w-full">
                      {timelineMissions.map(mission => (
                        <MissionCard
                          key={mission.id}
                          mission={mission}
                          onStart={handleMissionStart}
                          onComplete={handleMissionComplete}
                          onDelete={() => handleMissionDelete(mission.id)}
                          onSubtaskComplete={handleSubtaskComplete}
                          isActive={getMissionStatus(mission) === 'in-progress'}
                          disabled={false}
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showMissionForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <MissionForm
                onSubmit={handleCreateMission}
                onClose={() => setShowMissionForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-space-darker p-6 rounded-lg border border-space-primary/20 max-w-md w-full text-center relative"
              >
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <motion.div
                    initial={{ rotate: -30, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    🎉
                  </motion.div>
                  <motion.div
                    initial={{ rotate: 30, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    🚀
                  </motion.div>
                  <motion.div
                    initial={{ rotate: -30, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    ⭐️
                  </motion.div>
                </div>

                <h2 className="text-2xl font-space text-space-primary mb-4">Mission Accomplished!</h2>
                <p className="text-space-gray mb-6">Great work, Commander! Would you like to join our email list for mission updates?</p>
                
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      const email = window.prompt('Enter your email to get started:');
                      if (email) {
                        convertToPermamentAccount(email)
                          .then(() => {
                            toast.success('Check your email for a magic link!');
                            setShowCelebration(false);
                          })
                          .catch(error => toast.error(error.message));
                      }
                    }}
                    className="w-full px-4 py-3 rounded-md bg-space-primary/20 text-space-primary border border-space-primary/30 hover:bg-space-primary/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Sign Up with Email
                  </button>
                  <button
                    onClick={() => setShowCelebration(false)}
                    className="w-full px-4 py-3 rounded-md bg-space-gray/10 text-space-gray border border-space-gray/20 hover:bg-space-gray/20 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
