import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMonitor, FiTablet, FiSmartphone, FiArrowRight, FiStar, FiAward } from 'react-icons/fi';

type ViewportType = 'laptop' | 'tablet' | 'mobile';

const HeroDesign9: React.FC = () => {
  const [viewport, setViewport] = useState<ViewportType>('laptop');

  // Fixed data
  const title = 'Luxury Redefined';
  const subtitle = 'Premium Collection';
  const description = 'Experience unparalleled elegance and sophistication. Our exclusive collection embodies timeless luxury crafted for the discerning few.';
  const buttonText = 'Explore Collection';
  const buttonLink = '#';
  const imageUrl = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80';
  const backgroundColor = '#0a0a0a';
  const textColor = '#ffffff';

  // Viewport width constraints
  const viewportWidths = {
    laptop: 'w-full max-w-[1920px]',
    tablet: 'w-full max-w-[768px]',
    mobile: 'w-full max-w-[375px]',
  };

  return (
    <div className="w-full">
      {/* Responsive View Buttons */}
      <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => setViewport('laptop')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
            viewport === 'laptop'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          <FiMonitor className="w-4 h-4" />
          <span>Laptop</span>
        </button>
        <button
          onClick={() => setViewport('tablet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
            viewport === 'tablet'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          <FiTablet className="w-4 h-4" />
          <span>Tablet</span>
        </button>
        <button
          onClick={() => setViewport('mobile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
            viewport === 'mobile'
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          <FiSmartphone className="w-4 h-4" />
          <span>Mobile</span>
        </button>
      </div>

      {/* Hero Design Container with Viewport Constraint */}
      <div className={`mx-auto ${viewportWidths[viewport]} transition-all duration-300`}>
        <div
          className="relative overflow-hidden min-h-[600px] md:min-h-[700px] lg:min-h-[800px]"
          style={{ backgroundColor: backgroundColor }}
        >
          {/* Premium Background Image */}
          {imageUrl && (
            <div className="absolute inset-0">
              <img
                src={imageUrl}
                alt={title || 'Hero'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Luxury Overlay - Dark with Gold Accents */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/85 to-black/90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              {/* Gold Accent Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-900/10 to-transparent" />
            </div>
          )}

          {/* Animated Premium Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,215,0,0.3) 1px, transparent 0)',
              backgroundSize: '60px 60px'
            }} />
          </div>

          {/* Floating Gold Particles Effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-amber-400 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  opacity: 0,
                }}
                animate={{
                  y: [null, Math.random() * window.innerHeight],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Content - Centered Premium Layout */}
          <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-12 sm:py-16 md:py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="w-full max-w-4xl text-center"
              style={{ color: textColor }}
            >
              {/* Premium Badge */}
              {subtitle && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="flex items-center justify-center gap-3 mb-6"
                >
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 backdrop-blur-sm border border-amber-500/30 rounded-full">
                    <FiStar className="w-4 h-4 text-amber-400" />
                    <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-amber-400">
                      {subtitle}
                    </p>
                    <FiStar className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                </motion.div>
              )}

              {/* Premium Title */}
              {title && (
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="font-bold mb-6 sm:mb-8 md:mb-10 text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 50%, #d4af37 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {title}
                </motion.h1>
              )}

              {/* Elegant Description */}
              {description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="mb-10 sm:mb-12 md:mb-14 text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 leading-relaxed max-w-3xl mx-auto font-light"
                >
                  {description}
                </motion.p>
              )}

              {/* Premium CTA Buttons */}
              {buttonText && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
                >
                  {/* Primary Premium Button */}
                  <a
                    href={buttonLink || '#'}
                    className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-black font-bold rounded-lg overflow-hidden transition-all duration-300 text-base sm:text-lg md:text-xl shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {buttonText}
                      <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    {/* Shine Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  </a>

                  {/* Secondary Elegant Button */}
                  <button className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/5 backdrop-blur-md border-2 border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 hover:border-white/40 transition-all duration-300 text-base sm:text-lg md:text-xl">
                    <FiAward className="w-5 h-5 text-amber-400" />
                    <span>Learn More</span>
                  </button>
                </motion.div>
              )}

              {/* Premium Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-16 sm:mt-20 md:mt-24 grid grid-cols-3 gap-6 sm:gap-8 md:gap-12 max-w-2xl mx-auto"
              >
                {[
                  { value: '10K+', label: 'Elite Members' },
                  { value: '500+', label: 'Premium Products' },
                  { value: '5★', label: 'Luxury Rating' },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-b from-white via-gray-200 to-amber-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Premium Bottom Accent Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroDesign9;
