import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMonitor, FiTablet, FiSmartphone, FiArrowRight, FiCheck } from 'react-icons/fi';

type ViewportType = 'laptop' | 'tablet' | 'mobile';

const HeroDesign10: React.FC = () => {
  const [viewport, setViewport] = useState<ViewportType>('laptop');

  // Fixed data
  const title = 'Modern Luxury';
  const subtitle = 'Premium Experience';
  const description = 'Indulge in our curated collection of luxury products. Where sophistication meets innovation, and quality is never compromised.';
  const buttonText = 'Discover More';
  const buttonLink = '#';
  const imageUrl = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80';
  const backgroundColor = '#0f172a';
  const textColor = '#ffffff';

  // Viewport width constraints
  const viewportWidths = {
    laptop: 'w-full max-w-[1920px]',
    tablet: 'w-full max-w-[768px]',
    mobile: 'w-full max-w-[375px]',
  };

  const benefits = [
    'Premium Quality Guarantee',
    'Exclusive Member Benefits',
    '24/7 Customer Support',
  ];

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
          {/* Background with Glassmorphism Effect */}
          {imageUrl && (
            <div className="absolute inset-0">
              <img
                src={imageUrl}
                alt={title || 'Hero'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
            </div>
          )}

          {/* Animated Background Shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20">
            <div className="w-full max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Side - Content */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{ color: textColor }}
                >
                  {subtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xs sm:text-sm md:text-base font-medium uppercase tracking-wider mb-4 text-white/70"
                    >
                      {subtitle}
                    </motion.p>
                  )}
                  {title && (
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="font-bold mb-5 sm:mb-6 md:mb-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight"
                    >
                      {title}
                    </motion.h1>
                  )}
                  {description && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mb-8 sm:mb-10 text-base sm:text-lg md:text-xl text-white/90 leading-relaxed"
                    >
                      {description}
                    </motion.p>
                  )}

                  {/* Benefits List */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8 space-y-3"
                  >
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <FiCheck className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm sm:text-base text-white/90">{benefit}</span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {buttonText && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <a
                        href={buttonLink || '#'}
                        className="group inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 hover:border-white/40 transition-all duration-300 text-sm sm:text-base md:text-lg"
                      >
                        <span>{buttonText}</span>
                        <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </a>
                    </motion.div>
                  )}
                </motion.div>

                {/* Right Side - Glassmorphism Card */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative"
                >
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl">
                    {imageUrl && (
                      <div className="relative rounded-xl overflow-hidden mb-6">
                        <img
                          src={imageUrl}
                          alt={title || 'Hero'}
                          className="w-full h-64 sm:h-80 object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    )}
                    <div className="space-y-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Special Offer</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-white/90">
                          <span>Free Shipping</span>
                          <FiCheck className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex items-center justify-between text-white/90">
                          <span>Premium Packaging</span>
                          <FiCheck className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex items-center justify-between text-white/90">
                          <span>Extended Warranty</span>
                          <FiCheck className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/10">
                        <div className="text-3xl sm:text-4xl font-bold text-white mb-2">$299</div>
                        <div className="text-sm text-white/70 line-through">$399</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDesign10;
