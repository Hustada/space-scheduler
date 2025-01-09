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

// Sample mission data
const initialMissions = [
  {
    id: uuidv4(),
    title: 'Launch Day Initialization',
    description: 'Wake up and begin day',
    time: '05:00',
    duration: 30,
    status: 'pending',
    type: 'critical',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  {
    id: uuidv4(),
    title: 'Physical Systems Calibration',
    description: 'Morning workout routine',
    time: '05:30',
    duration: 60,
    status: 'pending',
    type: 'routine',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  {
    id: uuidv4(),
    title: 'Recovery Protocol',
    description: 'Cool down and quick shower',
    time: '06:30',
    duration: 30,
    status: 'pending',
    type: 'routine',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  {
    id: uuidv4(),
    title: 'Mission Planning & Sustenance',
    description: 'Breakfast and daily planning',
    time: '07:00',
    duration: 30,
    status: 'pending',
    type: 'routine',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  {
    id: uuidv4(),
    title: 'Family Operations',
    description: 'School runs and morning responsibilities',
    time: '07:30',
    duration: 90,
    status: 'pending',
    type: 'critical',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  {
    id: uuidv4(),
    title: 'Primary Code Deployment',
    description: 'Focused coding work using Pomodoro Technique',
    time: '09:00',
    duration: 180,
    status: 'pending',
    type: 'routine',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  {
    id: uuidv4(),
    title: 'Midday Refueling',
    description: 'Healthy lunch break',
    time: '12:00',
    duration: 30,
    status: 'pending',
    type: 'break',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  {
    id: uuidv4(),
    title: 'System Recalibration',
    description: 'Brief physical activity or relaxation',
    time: '12:30',
    duration: 30,
    status: 'pending',
    type: 'break',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  {
    id: uuidv4(),
    title: 'Knowledge Enhancement Protocol',
    description: 'Career development and AI learning',
    time: '13:00',
    duration: 120,
    status: 'pending',
    type: 'routine',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  {
    id: uuidv4(),
    title: 'Creative Systems Activation',
    description: 'Personal projects and music writing',
    time: '15:00',
    duration: 60,
    status: 'pending',
    type: 'routine',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  {
    id: uuidv4(),
    title: 'Personal Enhancement Sequence',
    description: 'Personal development or additional coding',
    time: '16:00',
    duration: 60,
    status: 'pending',
    type: 'routine',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  {
    id: uuidv4(),
    title: 'Family Integration Protocol',
    description: 'Family time and dinner',
    time: '17:00',
    duration: 120,
    status: 'pending',
    type: 'critical',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  {
    id: uuidv4(),
    title: 'Harmonic Resonance Session',
    description: 'Music and band activities',
    time: '19:00',
    duration: 60,
    status: 'pending',
    type: 'routine',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  {
    id: uuidv4(),
    title: 'System Cool Down',
    description: 'Personal relaxation and wind-down',
    time: '20:00',
    duration: 60,
    status: 'pending',
    type: 'break',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  {
    id: uuidv4(),
    title: 'Mission Debrief & Prep',
    description: 'Evening planning and preparation',
    time: '21:00',
    duration: 60,
    status: 'pending',
    type: 'routine',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  {
    id: uuidv4(),
    title: 'Sleep Protocol Initiation',
    description: 'Bedtime sequence',
    time: '22:00',
    duration: 30,
    status: 'pending',
    type: 'critical',
    isRecurring: true,
    recurringDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  }
]

function App() {
  const [missions, setMissions] = useState(initialMissions)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showMissionForm, setShowMissionForm] = useState(false)
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    time: '',
    duration: 30,
    type: 'routine',
    isRecurring: false,
    recurringDays: []
  })
  const [showMissionLog, setShowMissionLog] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [activeMission, setActiveMission] = useState(null);
  const [missionStartTime, setMissionStartTime] = useState(null);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleMissionStart = (id) => {
    // Check if any mission is already in progress
    const hasActiveMission = missions.some(m => m.status === 'in-progress');
    if (hasActiveMission) {
      // Could add a toast notification here if you want to show an error
      return;
    }

    setMissions(missions.map(mission => {
      if (mission.id === id) {
        const startTime = new Date().toISOString();
        setActiveMission(id);
        setMissionStartTime(startTime);
        return { ...mission, status: 'in-progress', startTime };
      }
      return mission;
    }));
  };

  const handleMissionComplete = (id) => {
    const completedAt = new Date().toISOString();
    
    setMissions(missions.map(mission => {
      if (mission.id === id) {
        // Calculate actual duration in minutes
        const startTime = new Date(mission.startTime);
        const endTime = new Date(completedAt);
        const actualDuration = Math.round((endTime - startTime) / (1000 * 60));

        // Store the mission data for AI analysis
        const missionData = {
          ...mission,
          status: 'complete',
          completedAt,
          actualDuration,
          estimatedDuration: mission.duration
        };

        // Store in localStorage for analysis
        const missionHistory = JSON.parse(localStorage.getItem('missionHistory') || '[]');
        missionHistory.push(missionData);
        localStorage.setItem('missionHistory', JSON.stringify(missionHistory));

        setActiveMission(null);
        setMissionStartTime(null);
        
        return missionData;
      }
      return mission;
    }));

    // Show celebration
    setCelebrationMessage('Mission Accomplished! 🚀');
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const handleMissionRevert = (id) => {
    setMissions(missions.map(mission =>
      mission.id === id
        ? { ...mission, status: 'pending', completedAt: null }
        : mission
    ));
  };

  const handleAddMission = (e) => {
    e.preventDefault()
    const mission = {
      id: uuidv4(),
      ...newMission,
      status: 'pending'
    }
    setMissions(prev => [...prev, mission])
    setNewMission({
      title: '',
      description: '',
      time: '',
      duration: 30,
      type: 'routine',
      isRecurring: false,
      recurringDays: []
    })
    setShowMissionForm(false)
  }

  const handleRecurringDayToggle = (day) => {
    setNewMission(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day]
    }))
  }

  const getMissionStatus = (mission) => {
    if (mission.status === 'complete') return 'complete';
    if (mission.status === 'in-progress') return 'in-progress';
    return 'pending';
  };

  const getMissionStatusClass = (status) => {
    switch (status) {
      case 'complete': return 'status-complete';
      case 'in-progress': return 'status-in-progress';
      default: return 'status-pending';
    }
  };

  // Update mission statuses based on current time
  useEffect(() => {
    setMissions(missions.map(mission => ({
      ...mission,
      status: getMissionStatus(mission)
    })));
  }, [currentTime]);

  const handleTemplateSelect = (template) => {
    setNewMission({
      ...newMission,
      title: template.title,
      description: template.description,
      duration: template.duration,
      category: template.category
    });
    setShowMissionForm(true);
  };

  const getMissionHistory = () => {
    return JSON.parse(localStorage.getItem('missionHistory') || '[]');
  };

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
                          new Date(m.completedAt).toDateString() === new Date().toDateString()
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
                      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
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
                              {new Date(mission.completedAt).toLocaleTimeString()}
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
                              .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
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
                                      {new Date(mission.completedAt).toLocaleTimeString()}
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
                        <motion.div
                          key={mission.id}
                          className="mission-card"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className={`mission-status ${getMissionStatusClass(getMissionStatus(mission))}`} />
                          
                          {/* Title and Description */}
                          <div className="flex-1 mb-4">
                            <h3 className="text-lg font-space mb-1 text-gray-200">{mission.title}</h3>
                            {mission.isRecurring && (
                              <div className="flex items-center gap-1 text-xs text-space-success mb-2">
                                <ArrowPathIcon className="h-3 w-3" />
                                <span>Recurring Mission</span>
                              </div>
                            )}
                            <p className="text-gray-400 text-sm">{mission.description}</p>
                          </div>

                          {/* Time Info */}
                          <div className="flex items-center gap-2 text-sm mb-4">
                            <ClockIcon className="h-4 w-4 text-space-primary" />
                            <span>{mission.time} ({mission.duration}m)</span>
                          </div>

                          {/* Action Button */}
                          <div className="flex justify-end">
                            <button
                              onClick={() => mission.status === 'pending' 
                                ? handleMissionStart(mission.id)
                                : handleMissionComplete(mission.id)
                              }
                              className={`mission-button w-full sm:w-auto ${
                                mission.status === 'in-progress' 
                                  ? 'bg-red-500/20 hover:bg-red-500/40 text-red-400' 
                                  : missions.some(m => m.status === 'in-progress')
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                              }`}
                              disabled={mission.status === 'pending' && missions.some(m => m.status === 'in-progress')}
                            >
                              <span className="flex items-center justify-center gap-2">
                                {mission.status === 'pending' ? (
                                  <>
                                    <PlayIcon className="h-4 w-4" />
                                    {missions.some(m => m.status === 'in-progress') 
                                      ? 'Mission in Progress'
                                      : 'Start'
                                    }
                                  </>
                                ) : mission.status === 'in-progress' ? (
                                  <>
                                    <CheckCircleIcon className="h-4 w-4" />
                                    Complete
                                  </>
                                ) : null}
                              </span>
                            </button>
                          </div>
                        </motion.div>
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
              className="fixed inset-0 bg-space-darker/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-space-dark p-6 rounded-lg w-full max-w-md border border-space-gray/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-space-primary">New Mission</h2>
                  <button
                    onClick={() => setShowMissionForm(false)}
                    className="text-space-gray hover:text-space-primary transition-colors"
                    aria-label="Close"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleAddMission} className="space-y-4">
                  <div>
                    <label className="block text-sm font-space mb-1">Mission Title</label>
                    <input
                      type="text"
                      value={newMission.title}
                      onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                      className="w-full bg-space-darker border border-space-gray/20 rounded px-3 py-2 text-space-light focus:outline-none focus:border-space-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-space mb-1">Description</label>
                    <textarea
                      value={newMission.description}
                      onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                      className="w-full bg-space-darker border border-space-gray/20 rounded px-3 py-2 text-space-light focus:outline-none focus:border-space-primary"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-space mb-1">Start Time</label>
                    <select
                      value={newMission.time}
                      onChange={(e) => setNewMission({ ...newMission, time: e.target.value })}
                      className="w-full bg-space-darker border border-space-gray/20 rounded px-3 py-2 text-space-light focus:outline-none focus:border-space-primary"
                      required
                    >
                      <option value="">Select a time</option>
                      {Array.from({ length: 24 * 4 }).map((_, index) => {
                        const hour = Math.floor(index / 4);
                        const minute = (index % 4) * 15;
                        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                        return (
                          <option key={timeString} value={timeString}>
                            {new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-space mb-1">Duration (minutes)</label>
                    <select
                      value={newMission.duration}
                      onChange={(e) => setNewMission({ ...newMission, duration: parseInt(e.target.value) })}
                      className="w-full bg-space-darker border border-space-gray/20 rounded px-3 py-2 text-space-light focus:outline-none focus:border-space-primary"
                    >
                      {[15, 30, 45, 60, 90, 120, 180, 240].map(duration => (
                        <option key={duration} value={duration}>{duration} minutes</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-space mb-1">Mission Type</label>
                    <select
                      value={newMission.type}
                      onChange={(e) => setNewMission({ ...newMission, type: e.target.value })}
                      className="w-full bg-space-darker border border-space-gray/20 rounded px-3 py-2 text-space-light focus:outline-none focus:border-space-primary"
                    >
                      <option value="routine">Routine</option>
                      <option value="critical">Critical</option>
                      <option value="break">Break</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={newMission.isRecurring}
                      onChange={(e) => setNewMission({ ...newMission, isRecurring: e.target.checked })}
                      className="form-checkbox bg-space-darker border-space-gray/20 text-space-primary rounded focus:ring-space-primary"
                    />
                    <label htmlFor="isRecurring" className="text-sm font-space">Recurring Mission</label>
                  </div>

                  {newMission.isRecurring && (
                    <div className="space-y-2">
                      <label className="block text-sm font-space">Repeat on</label>
                      <div className="flex flex-wrap gap-2">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleRecurringDayToggle(day)}
                            className={`px-3 py-1 rounded-full text-xs capitalize ${
                              newMission.recurringDays.includes(day)
                                ? 'bg-space-primary text-space-dark'
                                : 'bg-space-darker text-space-gray border border-space-gray/20'
                            }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button type="submit" className="mission-button">
                      <span className="flex items-center gap-2">
                        <RocketLaunchIcon className="h-4 w-4" />
                        Launch Mission
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Celebration 
          show={showCelebration}
          message={celebrationMessage}
        />
      </div>
    </div>
  )
}

export default App
