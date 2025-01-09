import { motion } from 'framer-motion';
import { ChevronRightIcon, BeakerIcon, BookOpenIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const TEMPLATES = [
  {
    id: 'deep-focus',
    title: 'Deep Focus',
    description: 'Intense concentration period',
    duration: 45,
    icon: BeakerIcon,
    category: 'focus'
  },
  {
    id: 'study-session',
    title: 'Study Session',
    description: 'Learning and research',
    duration: 30,
    icon: BookOpenIcon,
    category: 'study'
  },
  {
    id: 'quick-task',
    title: 'Quick Task',
    description: 'Short but important',
    duration: 15,
    icon: SparklesIcon,
    category: 'quick'
  },
  {
    id: 'refresh',
    title: 'Refresh Break',
    description: 'Rest and recharge',
    duration: 15,
    icon: ArrowPathIcon,
    category: 'break'
  }
];

export default function MissionTemplates({ onSelectTemplate }) {
  return (
    <div className="space-y-2">
      {TEMPLATES.map(template => {
        const Icon = template.icon;
        return (
          <motion.button
            key={template.id}
            className="w-full mission-card hover:bg-space-darker/30 p-3 flex items-center justify-between group"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-space-darker/40 flex items-center justify-center">
                <Icon className="w-5 h-5 text-space-primary" />
              </div>
              <div className="text-left">
                <h3 className="text-space-light font-space font-bold">
                  {template.title}
                </h3>
                <p className="text-space-gray text-sm">
                  {template.duration}m · {template.description}
                </p>
              </div>
            </div>
            <ChevronRightIcon 
              className="w-5 h-5 text-space-gray opacity-0 group-hover:opacity-100 transition-opacity" 
            />
          </motion.button>
        );
      })}
    </div>
  );
}
