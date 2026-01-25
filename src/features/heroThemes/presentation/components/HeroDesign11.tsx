import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMonitor, FiTablet, FiSmartphone, FiArrowRight, FiPlay } from 'react-icons/fi';

type ViewportType = 'laptop' | 'tablet' | 'mobile';

const HeroDesign11: React.FC = () => {
  const [viewport, setViewport] = useState<ViewportType>('laptop');

  // Fixed data
  const title = 'Welcome to Our Store';
  const subtitle = 'New Collection';
  const description = 'Discover the latest trends and exclusive deals. Shop now and get amazing discounts on your favorite products.';
  const buttonText = 'Shop Now';
  const buttonLink = '#';
  const imageUrl = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80';
  const backgroundColor = '#6366f1';
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
          {/* Background Image with Parallax Effect */}
          {imageUrl && (
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5 }}
            >
              <img
                src={imageUrl}
                alt={title || 'Hero'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-secondary/90" />
            </motion.div>
          )}

          {/* Floating Geometric Shapes */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Large Circle */}
            <motion.div
              className="absolute top-20 right-10 w-64 h-64 bg-white/5 rounded-full blur-2xl"
              animate={{
                y: [0, 30, 0],
                x: [0, 20, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Medium Circle */}
            <motion.div
              className="absolute bottom-32 left-16 w-48 h-48 bg-white/5 rounded-full blur-2xl"
              animate={{
                y: [0, -25, 0],
                x: [0, -15, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            />
            {/* Small Circle */}
            <motion.div
              className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-xl"
              animate={{
                y: [0, 20, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
              }}
            />
          </div>

          {/* Content Container - Asymmetric Layout */}
          <div className="relative z-10 h-full flex items-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 md:py-20">
            <div className="w-full max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Side - Content */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="space-y-6 lg:space-y-8"
                  style={{ color: textColor }}
                >
                  {/* Subtitle Badge */}
                  {subtitle && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="inline-block"
                    >
                      <span className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider">
                        {subtitle}
                      </span>
                    </motion.div>
                  )}

                  {/* Title with Gradient */}
                  {title && (
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight"
                      style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {title}
                    </motion.h1>
                  )}

                  {/* Description */}
                  {description && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-xl"
                    >
                      {description}
                    </motion.p>
                  )}

                  {/* CTA Buttons */}
                  {buttonText && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                      className="flex flex-col sm:flex-row items-start gap-4"
                    >
                      {/* Primary Button */}
                      <a
                        href={buttonLink || '#'}
                        className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-primary font-bold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 hover:scale-105"
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

                      {/* Secondary Button */}
                      <button className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300">
                        <FiPlay className="w-5 h-5" />
                        <span>Watch Video</span>
                      </button>
                    </motion.div>
                  )}

                  {/* Stats Row */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                    className="flex flex-wrap gap-6 sm:gap-8 pt-4"
                  >
                    {[
                      { value: '10K+', label: 'Products' },
                      { value: '500+', label: 'Brands' },
                      { value: '5★', label: 'Rating' },
                    ].map((stat, index) => (
                      <div key={index} className="flex flex-col">
                        <span className="text-2xl sm:text-3xl font-bold">{stat.value}</span>
                        <span className="text-xs sm:text-sm text-white/70 uppercase tracking-wider">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Right Side - Floating Image Card */}
                <motion.div
                  initial={{ opacity: 0, x: 50, rotate: -5 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                  className="relative hidden lg:block"
                >
                  {imageUrl && (
                    <div className="relative">
                      {/* Main Image Card */}
                      <motion.div
                        animate={{
                          y: [0, -15, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="relative rounded-2xl overflow-hidden shadow-2xl"
                      >
                        <img
                          src={imageUrl}
                          alt={title || 'Hero'}
                          className="w-full h-[500px] object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      </motion.div>

                      {/* Floating Decorative Elements */}
                      <motion.div
                        className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 backdrop-blur-md rounded-xl border border-white/20"
                        animate={{
                          rotate: [0, 5, 0],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                      <motion.div
                        className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 backdrop-blur-md rounded-xl border border-white/20"
                        animate={{
                          rotate: [0, -5, 0],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 1.5,
                        }}
                      />
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Bottom Wave Decoration */}
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1 }}
            className="absolute bottom-0 left-0 right-0"
          >
            <svg
              className="w-full h-24"
              viewBox="0 0 1440 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                fill="white"
                fillOpacity="0.1"
              />
            </svg>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroDesign11;
