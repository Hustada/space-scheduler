import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { ClockIcon, RocketLaunchIcon, CheckCircleIcon, XCircleIcon, ArrowUturnLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import BlackHoleThree from './components/BlackHoleThree'

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

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleMissionComplete = (id) => {
    setMissions(missions.map(mission => 
      mission.id === id 
        ? { ...mission, status: 'complete', completedAt: new Date().toISOString() }
        : mission
    ));
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
    const now = new Date();
    const [hours, minutes] = mission.time.split(':').map(Number);
    const missionTime = new Date(now.setHours(hours, minutes, 0, 0));
    const endTime = new Date(missionTime.getTime() + mission.duration * 60000);
    
    if (mission.status === 'complete') return 'complete';
    if (now >= missionTime && now <= endTime) return 'active';
    if (now < missionTime) return 'pending';
    return 'overdue';
  };

  const getMissionStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'status-complete';
      case 'active': return 'status-active';
      case 'overdue': return 'status-critical';
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

  return (
    <div className="h-screen w-screen overflow-hidden bg-space-darker">
      {/* Black Hole Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas
          camera={{
            position: [8, 12, 15],
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

                {/* Mission Log Section */}
                <div className="mission-panel">
                  <h2 className="text-xl font-bold mb-4 text-space-primary">Mission Log</h2>
                  <div className="space-y-3">
                    {missions.filter(m => m.status === 'complete')
                      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                      .slice(0, 5)
                      .map(mission => (
                        <div key={mission.id} className="p-3 bg-space-darker/50 rounded-lg border border-space-gray/20">
                          <h3 className="text-sm font-space mb-1">{mission.title}</h3>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-space-gray">
                              {new Date(mission.completedAt).toLocaleTimeString()}
                            </span>
                            <button
                              onClick={() => handleMissionRevert(mission.id)}
                              className="text-space-warning hover:text-space-warning/80 flex items-center gap-1"
                            >
                              <ArrowUturnLeftIcon className="h-3 w-3" />
                              Revert
                            </button>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Mission Timeline Panel */}
              <motion.div 
                className="mission-panel col-span-1 md:col-span-2"
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
                      >
                        <div className={`mission-status ${getMissionStatusColor(getMissionStatus(mission))}`} />
                        
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
                            className="mission-button w-full sm:w-auto"
                            onClick={() => handleMissionComplete(mission.id)}
                          >
                            <span className="flex items-center justify-center gap-2">
                              <CheckCircleIcon className="h-4 w-4" />
                              Complete
                            </span>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-space-primary">New Mission</h2>
                <button
                  className="text-space-gray hover:text-space-light"
                  onClick={() => setShowMissionForm(false)}
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddMission} className="space-y-4">
                <div>
                  <label className="block text-sm font-space mb-1">Mission Title</label>
                  <input
                    type="text"
                    className="mission-input"
                    value={newMission.title}
                    onChange={(e) => setNewMission(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-space mb-1">Mission Brief</label>
                  <textarea
                    className="mission-input"
                    value={newMission.description}
                    onChange={(e) => setNewMission(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-space mb-1">Start Time</label>
                  <input
                    type="time"
                    className="mission-input"
                    value={newMission.time}
                    onChange={(e) => setNewMission(prev => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-space mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    className="mission-input"
                    value={newMission.duration}
                    onChange={(e) => setNewMission(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    min="5"
                    max="480"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-space mb-1">Mission Type</label>
                  <select
                    className="mission-input"
                    value={newMission.type}
                    onChange={(e) => setNewMission(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="routine">Routine</option>
                    <option value="critical">Critical</option>
                    <option value="break">Break</option>
                  </select>
                </div>

                {/* Recurring Mission Toggle */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-space mb-2">
                    <input
                      type="checkbox"
                      className="form-checkbox rounded border-space-gray/20 bg-space-darker text-space-primary"
                      checked={newMission.isRecurring}
                      onChange={(e) => setNewMission(prev => ({ 
                        ...prev, 
                        isRecurring: e.target.checked,
                        recurringDays: e.target.checked ? prev.recurringDays : []
                      }))}
                    />
                    <span>Recurring Orbital Pattern</span>
                  </label>
                </div>

                {/* Recurring Days Selection */}
                {newMission.isRecurring && (
                  <div className="space-y-2">
                    <label className="block text-sm font-space mb-1">Select Days</label>
                    <div className="flex flex-wrap gap-2">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                        <button
                          key={day}
                          type="button"
                          className={`px-3 py-1 rounded-full text-xs ${
                            newMission.recurringDays.includes(day)
                              ? 'bg-space-primary text-space-darker'
                              : 'bg-space-darker border border-space-gray/20'
                          }`}
                          onClick={() => handleRecurringDayToggle(day)}
                        >
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    className="mission-button w-1/2"
                    onClick={() => setShowMissionForm(false)}
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="mission-button w-1/2 border-space-success hover:border-space-success"
                  >
                    Launch Mission
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
