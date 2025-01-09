import { motion, AnimatePresence } from 'framer-motion';

export default function Celebration({ show, message }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="bg-space-darker/80 backdrop-blur-sm text-space-primary font-space font-bold text-2xl p-8 rounded-lg border border-space-primary"
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
              rotateZ: [0, -5, 5, 0]
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              times: [0, 0.5, 1],
              repeat: 0
            }}
          >
            {message}
            <motion.div
              className="absolute -inset-4 opacity-50"
              animate={{
                scale: [1, 1.5],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 1,
                ease: "easeOut",
                times: [0, 1],
                repeat: Infinity
              }}
            >
              <div className="w-full h-full border-2 border-space-primary rounded-lg" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
