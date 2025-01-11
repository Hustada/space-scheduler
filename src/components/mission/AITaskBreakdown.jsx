import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeTask, formatAIResponse } from '../../services/aiService';

const SubtaskCard = ({ subtask, onComplete }) => {
  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    hard: 'bg-red-500/20 text-red-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 rounded-lg mb-3 ${subtask.status === 'completed' ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-lg font-space text-gray-200">{subtask.title}</h4>
          <p className="text-sm text-gray-400 mt-1">{subtask.description}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-space-gray">
              {subtask.estimatedDuration}m
            </span>
            <span className={`text-sm px-2 py-1 rounded ${difficultyColors[subtask.difficulty]}`}>
              {subtask.difficulty}
            </span>
          </div>
        </div>
        <button
          onClick={() => onComplete(subtask.id)}
          disabled={subtask.status === 'completed'}
          className={`mission-button ${
            subtask.status === 'completed' 
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-space-primary/20'
          }`}
        >
          Complete
        </button>
      </div>
    </motion.div>
  );
};

const AITaskBreakdown = ({ mission, onUpdateMission }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleAIBreakdown = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log('🚀 [AITaskBreakdown] Starting AI analysis for:', mission.description);
      const aiResponse = await analyzeTask(mission.description);
      
      console.log('📝 [AITaskBreakdown] AI Response received:', aiResponse);
      if (!aiResponse) {
        throw new Error('No response received from AI service');
      }

      console.log('🔄 [AITaskBreakdown] Formatting response...');
      const formattedResponse = formatAIResponse(aiResponse);
      console.log('✨ [AITaskBreakdown] Formatted response:', formattedResponse);
      
      onUpdateMission({
        ...mission,
        subtasks: formattedResponse.subtasks,
        aiSuggestions: formattedResponse.suggestions
      });
      
      console.log('✅ [AITaskBreakdown] Mission updated successfully');
    } catch (error) {
      console.error('❌ [AITaskBreakdown] Error:', error);
      setError(error.message || 'Failed to analyze task. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubtaskComplete = (subtaskId) => {
    const updatedSubtasks = mission.subtasks.map(subtask =>
      subtask.id === subtaskId
        ? { ...subtask, status: 'completed' }
        : subtask
    );

    onUpdateMission({
      ...mission,
      subtasks: updatedSubtasks
    });
  };

  const handleClearSubtasks = () => {
    onUpdateMission({
      ...mission,
      subtasks: null,
      aiSuggestions: null
    });
  };

  return (
    <div className="space-y-4">
      {!mission.subtasks ? (
        <button
          onClick={handleAIBreakdown}
          disabled={isAnalyzing}
          className="flex items-center justify-center w-full px-4 py-2 bg-space-primary/20 hover:bg-space-primary/40 rounded text-space-primary"
        >
          {isAnalyzing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 mr-2"
              >
                <SparklesIcon className="w-5 h-5" />
              </motion.div>
              Analyzing Task...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              AI Task Breakdown
            </>
          )}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-space-primary">AI Task Analysis</h3>
            <button
              onClick={handleClearSubtasks}
              className="text-gray-400 hover:text-red-400 text-sm flex items-center"
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              Remove Analysis
            </button>
          </div>

          <div className="bg-space-darker/50 p-4 rounded">
            <h3 className="text-lg font-medium text-space-primary mb-2">AI Suggestions</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                <span className="text-space-primary">Break Strategy:</span>{' '}
                {mission.aiSuggestions?.breakStrategy}
              </p>
              <p>
                <span className="text-space-primary">Time Management:</span>{' '}
                {mission.aiSuggestions?.timeManagement}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-space-primary mb-2">Subtasks</h3>
            <div className="space-y-2">
              {mission.subtasks.map((subtask) => (
                <SubtaskCard
                  key={subtask.id}
                  subtask={subtask}
                  onComplete={() => handleSubtaskComplete(subtask.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default AITaskBreakdown;
