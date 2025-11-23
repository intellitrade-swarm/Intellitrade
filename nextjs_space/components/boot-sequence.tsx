
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const bootMessages = [
  'INITIALIZING SWARM INTELLIGENCE PROTOCOL...',
  'LOADING NEURAL NETWORK MODULES...',
  'CONNECTING TO BLOCKCHAIN ORACLES...',
  'SYNCHRONIZING AI AGENTS...',
  'ESTABLISHING HIVE MIND CONSENSUS...',
  'ACTIVATING AUTONOMOUS TRADING SYSTEMS...',
  'CALIBRATING QUANTUM PRICE FEEDS...',
  'LOADING WHALE DETECTION ALGORITHMS...',
  'INITIALIZING SENTIMENT ANALYSIS ENGINE...',
  'DEPLOYING MULTI-DEX ROUTING MATRIX...',
  'SYSTEM READY - SWARM ONLINE'
];

export function BootSequence() {
  const [currentLine, setCurrentLine] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Check if boot sequence has been shown before
    const hasBooted = sessionStorage.getItem('intellitrade_booted');
    if (hasBooted) {
      setShow(false);
      setIsComplete(true);
      return;
    }

    const interval = setInterval(() => {
      setCurrentLine((prev) => {
        if (prev < bootMessages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setIsComplete(true);
            sessionStorage.setItem('intellitrade_booted', 'true');
          }, 1000);
          return prev;
        }
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
        >
          <div className="w-full max-w-4xl px-8">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 text-center"
            >
              <h1 className="text-6xl font-bold mb-4 font-mono tracking-wider">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 animate-pulse">
                  INTELLITRADE
                </span>
              </h1>
              <p className="text-blue-400 font-mono text-xl tracking-widest">
                SWARM INTELLIGENCE PROTOCOL
              </p>
            </motion.div>

            {/* Boot messages */}
            <div className="space-y-2 font-mono text-sm">
              {bootMessages.slice(0, currentLine + 1).map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center"
                >
                  <span className="text-green-400 mr-3">{'>'}</span>
                  <span className={`${
                    index === currentLine ? 'text-blue-400' : 'text-green-400'
                  }`}>
                    {message}
                  </span>
                  {index === currentLine && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="ml-1 text-blue-400"
                    >
                      _
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-12">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentLine + 1) / bootMessages.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-blue-500 via-blue-500 to-blue-600"
                  style={{
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
                  }}
                />
              </div>
              <p className="text-center text-blue-400 mt-2 font-mono text-xs">
                {Math.round(((currentLine + 1) / bootMessages.length) * 100)}% COMPLETE
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
