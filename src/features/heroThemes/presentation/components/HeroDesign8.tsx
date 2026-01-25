import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMonitor, FiTablet, FiSmartphone, FiShoppingCart, FiHeart } from 'react-icons/fi';

type ViewportType = 'laptop' | 'tablet' | 'mobile';

const HeroDesign8: React.FC = () => {
  const [viewport, setViewport] = useState<ViewportType>('laptop');

  // Fixed data
  const title = 'Elevate Your Style';
  const subtitle = 'Exclusive Offer';
  const description = 'Transform your wardrobe with our handpicked selection of premium fashion. Quality meets elegance in every piece.';
  const buttonText = 'Shop Collection';
  const buttonLink = '#';
  const imageUrl = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80';
  const backgroundColor = '#f8fafc';
  const textColor = '#1e293b';

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
        <div className="relative overflow-hidden min-h-[500px] md:min-h-[600px] lg:min-h-[700px] bg-white">
          {/* Split Layout */}
          <div className="relative z-10 h-full flex flex-col lg:flex-row">
            {/* Left Side - Product Showcase */}
            <div className="flex-1 relative min-h-[300px] lg:min-h-full bg-gradient-to-br from-gray-50 to-gray-100">
              {imageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  className="absolute inset-0 flex items-center justify-center p-8 sm:p-12 md:p-16 lg:p-20"
                >
                  <div className="relative w-full max-w-md">
                    {/* Product Image Container */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
                    >
                      <img
                        src={imageUrl}
                        alt={title || 'Hero'}
                        className="w-full h-full object-cover aspect-square"
                        loading="lazy"
                      />
                      {/* Product Actions */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg">
                          <FiHeart className="w-5 h-5 text-gray-700" />
                        </button>
                        <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg">
                          <FiShoppingCart className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                      {/* Badge */}
                      <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
                        New
                      </div>
                    </motion.div>
                    {/* Floating Elements */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 }}
                      className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-xl"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Side - Content */}
            <div className="flex-1 flex items-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 md:py-20">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-xl"
                style={{ color: textColor }}
              >
                {subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs sm:text-sm md:text-base font-semibold uppercase tracking-wider mb-4 text-primary"
                  >
                    {subtitle}
                  </motion.p>
                )}
                {title && (
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-bold mb-5 sm:mb-6 md:mb-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight"
                  >
                    {title}
                  </motion.h1>
                )}
                {description && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8 sm:mb-10 text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed"
                  >
                    {description}
                  </motion.p>
                )}
                {buttonText && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <a
                      href={buttonLink || '#'}
                      className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base md:text-lg hover:scale-105"
                    >
                      <span>{buttonText}</span>
                      <FiShoppingCart className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </a>
                    <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-primary hover:text-primary transition-all duration-300 text-sm sm:text-base md:text-lg">
                      Learn More
                    </button>
                  </motion.div>
                )}

                {/* Features List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-10 space-y-3"
                >
                  {['Premium Quality Materials', 'Free Worldwide Shipping', '30-Day Return Policy'].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-sm sm:text-base text-gray-600">{feature}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDesign8;
