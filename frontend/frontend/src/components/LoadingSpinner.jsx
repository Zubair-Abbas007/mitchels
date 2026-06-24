import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-cream)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo with spinning ring */}
        <div className="relative w-24 h-24">
          {/* Outer spinning ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-4 border-transparent"
            style={{ borderTopColor: '#3e6553', borderRightColor: '#3e6553' }}
          />
          {/* Inner static logo */}
          <div className="absolute inset-2 rounded-full overflow-hidden bg-white shadow-lg flex items-center justify-center">
            <img
              src="/mitchells-logo.png"
              alt="Mitchell's"
              className="w-full h-full object-contain p-1"
            />
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <p className="font-black text-[#1a2a8f] text-lg tracking-tight leading-none">MITCHELL'S</p>
          <p className="text-[9px] font-bold tracking-[0.3em] text-[#cc1111] uppercase mt-1">Farm Fresh Since 1933</p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#3e6553]"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
