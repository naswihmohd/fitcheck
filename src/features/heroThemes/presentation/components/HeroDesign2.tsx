import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMonitor, FiTablet, FiSmartphone, FiArrowRight, FiStar, FiAward } from 'react-icons/fi';

type ViewportType = 'laptop' | 'tablet' | 'mobile';

const HeroDesign2: React.FC = () => {
  const [viewport, setViewport] = useState<ViewportType>('laptop');

  // Fixed data
  const title = 'Welcome to Our Store';
  const subtitle = 'New Collection';
  const description = 'Discover the latest trends and exclusive deals. Shop now and get amazing discounts on your favorite products.';
  const buttonText = 'Shop Now';
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
          className="relative overflow-hidden min-h-[500px] md:min-h-[600px] lg:min-h-[700px]"
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
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent lg:from-black/80 lg:via-black/50 lg:to-transparent" />
              {/* Gold Accent Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-transparent to-transparent" />
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
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-amber-400 rounded-full"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                  opacity: 0,
                }}
                animate={{
                  y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)],
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

          {/* Split Layout Container */}
          <div className="relative z-10 h-full flex flex-col lg:flex-row">
            {/* Left Side - Premium Content */}
            <div className="flex-1 flex items-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-10 md:py-12 lg:py-16">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="w-full max-w-xl"
                style={{ color: textColor }}
              >
                {/* Premium Badge */}
                {subtitle && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="mb-6 sm:mb-8"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                      <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 backdrop-blur-sm border border-amber-500/30 rounded-full">
                        <FiStar className="w-3 h-3 text-amber-400" />
                        <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-amber-400">
                          {subtitle}
                        </p>
                        <FiStar className="w-3 h-3 text-amber-400" />
                      </div>
                      <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                    </div>
                  </motion.div>
                )}

                {/* Premium Title with Gradient */}
                {title && (
                  <motion.h1
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="font-bold mb-5 sm:mb-6 md:mb-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight"
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
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="mb-8 sm:mb-10 md:mb-12 text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 leading-relaxed font-light"
                  >
                    {description}
                  </motion.p>
                )}

                {/* Premium CTA Buttons */}
                {buttonText && (
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6"
                  >
                    {/* Primary Premium Button */}
                    <a
                      href={buttonLink || '#'}
                      className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-black font-bold rounded-lg overflow-hidden transition-all duration-300 text-base sm:text-lg shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 hover:scale-105"
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
                    <button className="group inline-flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5 bg-white/5 backdrop-blur-md border-2 border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 hover:border-white/40 transition-all duration-300 text-base sm:text-lg">
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
                  className="mt-10 sm:mt-12 md:mt-16 grid grid-cols-3 gap-4 sm:gap-6 md:gap-8"
                >
                  {[
                    { value: '10K+', label: 'Products' },
                    { value: '500+', label: 'Brands' },
                    { value: '5★', label: 'Rating' },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="text-left"
                    >
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-b from-white via-gray-200 to-amber-400 bg-clip-text text-transparent">
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

            {/* Right Side - Premium Image */}
            <div className="flex-1 relative min-h-[300px] lg:min-h-full">
              {imageUrl && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  className="absolute inset-0"
                >
                  <img
                    src={imageUrl}
                    alt={title || 'Hero'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Premium Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent lg:from-transparent lg:via-transparent lg:to-transparent" />
                  {/* Gold accent overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-900/10 via-transparent to-transparent lg:from-transparent lg:via-transparent lg:to-transparent" />
                  
                  {/* Premium decorative border */}
                  <div className="absolute inset-0 border-l-2 border-amber-500/30 hidden lg:block" />
                  
                  {/* Floating sparkles */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        initial={{
                          x: `${20 + i * 25}%`,
                          y: `${30 + i * 15}%`,
                          opacity: 0,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                          duration: 3 + i,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      >
                        <FiStar className="w-4 h-4 text-amber-400" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Premium Bottom Accent Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
          />

          {/* Premium Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 hidden lg:block" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 hidden lg:block" />
        </div>
      </div>
    </div>
  );
};

export default HeroDesign2;
