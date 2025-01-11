import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  RocketLaunchIcon, 
  CheckCircleIcon, 
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

const SubtaskList = ({ subtasks, onSubtaskComplete }) => {
  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    hard: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="mt-4 space-y-3">
      {subtasks.map(subtask => (
        <div 
          key={subtask.id}
          className={`p-3 rounded bg-space-darker/30 ${
            subtask.status === 'completed' ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-space text-gray-200">{subtask.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-space-gray">
                  {subtask.estimatedDuration}m
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${difficultyColors[subtask.difficulty]}`}>
                  {subtask.difficulty}
                </span>
              </div>
            </div>
            <button
              onClick={() => onSubtaskComplete(subtask.id)}
              disabled={subtask.status === 'completed'}
              className={`text-sm mission-button py-1 ${
                subtask.status === 'completed'
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-space-primary/20'
              }`}
            >
              {subtask.status === 'completed' ? 'Done' : 'Complete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const MissionCard = ({ 
  mission, 
  onStart, 
  onComplete, 
  onSubtaskComplete,
  onDelete,
  isActive,
  disabled 
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);

  const toggleSteps = () => {
    setShowSubtasks(!showSubtasks);
  };

  return (
    <motion.div
      className={`mission-card relative ${
        isActive ? 'ring-1 ring-space-primary' : ''
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        boxShadow: isActive
          ? ['0 0 0 0 rgba(0, 255, 159, 0)', '0 0 20px 2px rgba(0, 255, 159, 0.2)', '0 0 0 0 rgba(0, 255, 159, 0)']
          : 'none'
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.3,
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-space-primary/5 pointer-events-none"
          animate={{
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      <div className="relative">
        {/* Mission Header */}
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

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {mission.subtasks && mission.subtasks.length > 0 && (
              <button
                onClick={toggleSteps}
                className="text-space-primary hover:text-space-primary-light text-sm flex items-center"
              >
                {showSubtasks ? (
                  <>
                    <ChevronUpIcon className="w-4 h-4 mr-1" />
                    Hide Steps
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="w-4 h-4 mr-1" />
                    Show Steps ({mission.subtasks.length})
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-red-400"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => isActive ? onComplete(mission.id) : onStart(mission.id)}
            disabled={disabled}
            className={`mission-button ${
              isActive 
                ? 'bg-red-500/20 hover:bg-red-500/40 text-red-400' 
                : disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
            }`}
          >
            <span className="flex items-center gap-2">
              {isActive ? (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  Complete
                </>
              ) : (
                <>
                  <RocketLaunchIcon className="h-4 w-4" />
                  Start
                </>
              )}
            </span>
          </button>
        </div>

        {/* Subtasks */}
        {showSubtasks && mission.subtasks && (
          <SubtaskList 
            subtasks={mission.subtasks} 
            onSubtaskComplete={(subtaskId) => onSubtaskComplete(mission.id, subtaskId)}
          />
        )}

        {/* AI Suggestions */}
        {showSubtasks && mission.aiSuggestions && (
          <div className="mt-4 p-3 rounded bg-space-darker/50">
            <h4 className="text-space-primary font-space text-sm mb-2">AI Suggestions</h4>
            <p className="text-xs text-gray-400 mb-1">
              <span className="text-space-gray">Break Strategy:</span> {mission.aiSuggestions.breakStrategy}
            </p>
            <p className="text-xs text-gray-400">
              <span className="text-space-gray">Time Management:</span> {mission.aiSuggestions.timeManagement}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MissionCard;
