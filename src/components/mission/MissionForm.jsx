import { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import AITaskBreakdown from './AITaskBreakdown';
import toast from 'react-hot-toast'; // Assuming you have react-hot-toast installed

const MissionForm = ({ onSubmit, onClose }) => {
  // Helper function to get current time in HH:mm format
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [mission, setMission] = useState({
    title: '',
    description: '',
    duration: 30,
    time: getCurrentTime(),
    isRecurring: false,
    subtasks: null,
    aiSuggestions: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(mission);
  };

  const handleMissionUpdate = (updatedMission) => {
    // Keep the user-entered duration if no subtasks
    const duration = updatedMission.subtasks?.length > 0 
      ? updatedMission.subtasks.reduce((total, subtask) => total + (parseInt(subtask.estimatedDuration) || 0), 0)
      : mission.duration;

    setMission({
      ...updatedMission,
      duration
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <div className="bg-space-darker rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="p-6 border-b border-space-gray">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-space text-space-primary">New Mission</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={mission.title}
                  onChange={(e) => setMission({ ...mission, title: e.target.value })}
                  className="mission-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={mission.description}
                  onChange={(e) => setMission({ ...mission, description: e.target.value })}
                  className="mission-input w-full h-32"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={mission.subtasks?.length > 0 
                      ? mission.subtasks.reduce((total, subtask) => total + (parseInt(subtask.estimatedDuration) || 0), 0)
                      : mission.duration}
                    onChange={(e) => setMission({ ...mission, duration: parseInt(e.target.value) })}
                    className="mission-input w-full"
                    min="1"
                    required
                    disabled={mission.subtasks?.length > 0}
                  />
                  {mission.subtasks?.length > 0 && (
                    <p className="text-sm text-space-gray mt-1">Duration is calculated from subtasks</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Start Time (24h)</label>
                  <input
                    type="time"
                    value={mission.time}
                    onChange={(e) => setMission({ ...mission, time: e.target.value })}
                    className="mission-input w-full"
                    required
                  />
                </div>
              </div>

              {mission.description && (
                <AITaskBreakdown
                  mission={mission}
                  onUpdateMission={handleMissionUpdate}
                />
              )}
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 border-t border-space-gray">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-space-primary text-white rounded hover:bg-space-primary-dark"
            >
              Create Mission
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MissionForm;
