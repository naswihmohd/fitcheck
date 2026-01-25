import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMonitor, FiTablet, FiSmartphone, FiShoppingBag, FiArrowRight, FiStar, FiTag } from 'react-icons/fi';

type ViewportType = 'laptop' | 'tablet' | 'mobile';

const HeroDesign4: React.FC = () => {
  const [viewport, setViewport] = useState<ViewportType>('laptop');

  // Fixed data
  const title = 'Summer Sale';
  const subtitle = 'Limited Time Offer';
  const description = 'Get up to 50% off on selected items. Shop the latest fashion trends and elevate your style with premium quality products.';
  const buttonText = 'Shop Collection';
  const buttonLink = '#';
  const imageUrl = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80';
  const backgroundColor = '#ffffff';
  const textColor = '#1f2937';

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
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50" />
          
          {/* Floating Orbs */}
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-orange-400/30 to-yellow-400/30 rounded-full blur-3xl"
          />

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Main Content Container */}
          <div className="relative z-10 h-full flex flex-col lg:flex-row items-center">
            {/* Left Side - Content */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-12 sm:py-16 md:py-20">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-2xl"
                style={{ color: textColor }}
              >
                {/* Badge */}
                {subtitle && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 mb-4 sm:mb-5"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-50" />
                      <div className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs sm:text-sm font-semibold">
                        <FiTag className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{subtitle}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Title */}
                {title && (
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-extrabold mb-4 sm:mb-5 md:mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent"
                  >
                    {title}
                  </motion.h1>
                )}

                {/* Description */}
                {description && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6 sm:mb-8 text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-xl"
                  >
                    {description}
                  </motion.p>
                )}

                {/* CTA Buttons */}
                {buttonText && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8"
                  >
                    <a
                      href={buttonLink || '#'}
                      className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 text-sm sm:text-base md:text-lg overflow-hidden"
                    >
                      <FiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>{buttonText}</span>
                      <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                      <span className="absolute inset-0 flex items-center justify-center gap-2 z-10">
                        <FiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                        {buttonText}
                        <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </a>
                    <button className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-purple-500 hover:text-purple-600 transition-all duration-300 text-sm sm:text-base md:text-lg shadow-sm hover:shadow-md">
                      <span>Learn More</span>
                    </button>
                  </motion.div>
                )}

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-6 sm:gap-8"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-gray-700">4.9 Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-purple-600">50K+</span>
                    <span className="text-sm sm:text-base text-gray-600">Happy Customers</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Right Side - Image */}
            <div className="flex-1 relative w-full lg:w-auto lg:h-full min-h-[300px] lg:min-h-full">
              {imageUrl && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative h-full w-full"
                >
                  {/* Image Container with Decorative Elements */}
                  <div className="absolute inset-4 sm:inset-6 md:inset-8 lg:inset-12">
                    <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl">
                      <img
                        src={imageUrl}
                        alt={title || 'Hero'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20" />
                      
                      {/* Decorative Border */}
                      <div className="absolute inset-0 border-4 border-white/50 rounded-3xl" />
                    </div>

                    {/* Floating Product Cards */}
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 bg-white rounded-xl shadow-xl p-3 sm:p-4 border-2 border-purple-200 hidden md:block"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mb-2" />
                      <div className="text-xs font-semibold text-gray-800">New Arrival</div>
                      <div className="text-xs text-gray-500">$49.99</div>
                    </motion.div>

                    <motion.div
                      animate={{
                        y: [0, 10, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5
                      }}
                      className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-white rounded-xl shadow-xl p-3 sm:p-4 border-2 border-pink-200 hidden md:block"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-400 to-orange-400 rounded-lg mb-2" />
                      <div className="text-xs font-semibold text-gray-800">Best Seller</div>
                      <div className="text-xs text-gray-500">$39.99</div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Bottom Wave Decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/50 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default HeroDesign4;
