import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMonitor, FiTablet, FiSmartphone } from 'react-icons/fi';

type ViewportType = 'laptop' | 'tablet' | 'mobile';

const HeroDesign5: React.FC = () => {
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
        <div className="relative overflow-hidden min-h-[500px] md:min-h-[550px] lg:min-h-[600px] bg-gray-100 flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12 lg:py-16">
          {/* Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Background Image */}
            {imageUrl && (
              <div className="absolute inset-0">
                <img
                  src={imageUrl}
                  alt={title || 'Hero'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-secondary/90" />
              </div>
            )}

            {/* Content Card */}
            <div className="relative z-10 flex flex-col lg:flex-row min-h-[400px] md:min-h-[450px] lg:min-h-[500px]">
              {/* Left Side - Content */}
              <div className="flex-1 flex items-center justify-center px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16 py-8 sm:py-10 md:py-12">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-full max-w-lg"
                  style={{ color: textColor }}
                >
                  {subtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xs sm:text-sm md:text-base font-semibold uppercase tracking-wider mb-3 sm:mb-4 text-white/90"
                    >
                      {subtitle}
                    </motion.p>
                  )}
                  {title && (
                    <motion.h1
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="font-bold mb-4 sm:mb-5 md:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight"
                    >
                      {title}
                    </motion.h1>
                  )}
                  {description && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mb-6 sm:mb-7 md:mb-8 text-sm sm:text-base md:text-lg text-white/90 leading-relaxed"
                    >
                      {description}
                    </motion.p>
                  )}
                  {buttonText && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <a
                        href={buttonLink || '#'}
                        className="inline-block px-6 py-3 sm:px-8 sm:py-3.5 md:px-10 md:py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-lg hover:scale-105 text-sm sm:text-base md:text-lg"
                      >
                        {buttonText}
                      </a>
                    </motion.div>
                  )}
                </motion.div>
              </div>

              {/* Right Side - Image */}
              <div className="flex-1 relative min-h-[250px] lg:min-h-full hidden lg:block">
                {imageUrl && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={imageUrl}
                      alt={title || 'Hero'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Subtle overlay */}
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-primary/20" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Decorative Corner Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full hidden lg:block" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-tr-full hidden lg:block" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroDesign5;
