/**
 * PageTransition Component
 * Gestisce le transizioni animate tra pagine usando Framer Motion
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const transitions = {
  slide: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 }
  }
};

const PageTransition = ({
  children,
  type = 'slide',
  duration = 0.3,
  delay = 0,
  className = ''
}) => {
  const transition = transitions[type] || transitions.slide;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={transition.initial}
        animate={transition.animate}
        exit={transition.exit}
        transition={{
          duration,
          delay,
          ease: [0.4, 0, 0.2, 1]
        }}
        className={className}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
