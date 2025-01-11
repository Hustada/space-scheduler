import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { ClockIcon, RocketLaunchIcon, CheckCircleIcon, XCircleIcon, ArrowUturnLeftIcon, ArrowPathIcon, ChevronDownIcon, PlayIcon } from '@heroicons/react/24/outline'
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
  const { missions, loading, error, createMission, startMission, completeMission, revertMission, updateSubtask } = useMissions();
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showMissionForm, setShowMissionForm] = useState(false)
  const [showMissionLog, setShowMissionLog] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    time: '',
    duration: 30,
    type: 'routine',
    isRecurring: false,
    recurringDays: []
  })

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCreateMission = async (missionData) => {
    console.log('🌟 Creating new mission:', missionData);
    try {
      await createMission(missionData);
      setShowMissionForm(false);
      console.log('✅ Mission created successfully');
    } catch (err) {
      console.error('❌ Error creating mission:', err);
    }
  };

  const handleMissionStart = async (id) => {
    console.log('🚀 Starting mission:', id);
    try {
      await startMission(id);
      console.log('✅ Mission started successfully');
    } catch (err) {
      console.error('❌ Error starting mission:', err);
    }
  };

  const handleMissionComplete = async (id) => {
    console.log('🎯 Completing mission:', id);
    try {
      await completeMission(id);
      setCelebrationMessage('Mission Accomplished');
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      console.log('✅ Mission completed successfully');
    } catch (err) {
      console.error('❌ Error completing mission:', err);
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

  const handleMissionRevert = async (missionId) => {
    try {
      await revertMission(missionId);
    } catch (error) {
      console.error('Error reverting mission:', error);
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

  return (
    <div className="h-screen w-screen overflow-hidden bg-space-darker">
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
        {/* Navigation */}
        <div className="fixed top-4 right-4 z-50">
          <Link 
            to="/black-hole-test"
            className="px-4 py-2 rounded-md bg-space-primary/20 text-space-primary border border-space-primary/30 hover:bg-space-primary/30"
          >
            View Black Hole
          </Link>
          <button
            onClick={async () => {
              try {
                await seedDatabase();
              } catch (err) {
                console.error('Error seeding database:', err);
              }
            }}
            className="mission-button ml-4"
          >
            Seed Database
          </button>
        </div>

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
                  activeMission={missions.find(m => m.status === 'in-progress')} 
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mission Stats & Log Panel */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {/* Stats Section */}
                <div className="mission-panel">
                  <h2 className="text-xl font-bold mb-4 text-space-primary">Mission Stats</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Active Missions</span>
                      <span className="text-space-primary">{missions.filter(m => m.status === 'active').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Upcoming</span>
                      <span className="text-space-warning">{missions.filter(m => m.status === 'pending').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Completed Today</span>
                      <span className="text-space-success">
                        {missions.filter(m => 
                          m.status === 'complete' && 
                          new Date(m.completed_at).toDateString() === new Date().toDateString()
                        ).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-space-gray">
                      <span>Overdue</span>
                      <span className="text-space-danger">{missions.filter(m => m.status === 'overdue').length}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Mission Log */}
                <div className="mission-panel hidden md:block">
                  <h2 className="text-xl font-bold mb-4 text-space-primary">Mission Logs</h2>
                  <div className="space-y-3">
                    {missions.filter(m => m.status === 'complete')
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
                {missions.filter(m => m.status === 'complete').length > 0 && (
                  <div className="order-2 md:hidden">
                    <div className="mission-card">
                      <button 
                        onClick={() => setShowMissionLog(!showMissionLog)}
                        className="w-full flex items-center justify-between text-xl font-bold text-space-light bg-space-darker/10 rounded-lg p-3 border border-space-gray/20"
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
                            {missions.filter(m => m.status === 'complete')
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

              {/* Mission Timeline Panel */}
              <motion.div 
                className={`mission-panel col-span-1 md:col-span-2 ${
                  missions.filter(m => m.status !== 'complete').length === 0 ? 'bg-space-darker/20' : ''
                }`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-space-primary">Mission Timeline</h2>
                    <p className="text-sm text-space-gray">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                    </p>
                  </div>
                  <button 
                    className="mission-button"
                    onClick={() => setShowMissionForm(true)}
                  >
                    <span className="flex items-center gap-2">
                      <RocketLaunchIcon className="h-4 w-4" />
                      New Mission
                    </span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <AnimatePresence>
                    {missions
                      .filter(m => m.status !== 'complete')
                      .map(mission => (
                        <MissionCard
                          key={mission.id}
                          mission={mission}
                          onStart={handleMissionStart}
                          onComplete={handleMissionComplete}
                          onSubtaskComplete={handleSubtaskComplete}
                          isActive={mission.started_at && !mission.completed_at}
                          disabled={!mission.started_at && missions.some(m => m.started_at && !m.completed_at)}
                        />
                      ))}
                  </AnimatePresence>

                  {/* Empty State */}
                  {missions.filter(m => m.status !== 'complete').length === 0 && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="flex flex-col items-center justify-center py-20"
                    >
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                          opacity: [1, 0.7, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="mb-6"
                      >
                        <RocketLaunchIcon className="h-16 w-16 text-space-primary/50" />
                      </motion.div>
                      <p className="text-space-primary/80 text-lg font-medium">Ready for New Missions</p>
                    </motion.div>
                  )}
                </div>
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
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="bg-space-darker/90 text-space-primary p-6 rounded-lg shadow-lg border border-space-primary/20">
                <div className="flex items-center gap-3 text-2xl font-space">
                  <RocketLaunchIcon className="h-8 w-8 text-space-primary animate-bounce" />
                  <span>{celebrationMessage}</span>
                  <RocketLaunchIcon className="h-8 w-8 text-space-primary animate-bounce" style={{ transform: 'scaleX(-1)' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
