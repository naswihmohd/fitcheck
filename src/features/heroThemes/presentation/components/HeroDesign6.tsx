import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMonitor, FiTablet, FiSmartphone, FiShoppingBag, FiStar, FiTruck } from 'react-icons/fi';

type ViewportType = 'laptop' | 'tablet' | 'mobile';

const HeroDesign6: React.FC = () => {
  const [viewport, setViewport] = useState<ViewportType>('laptop');

  // Fixed data
  const title = 'Premium Collection';
  const subtitle = 'Luxury Redefined';
  const description = 'Experience elegance and sophistication with our curated selection of premium products. Crafted for those who appreciate quality and style.';
  const buttonText = 'Explore Collection';
  const buttonLink = '#';
  const imageUrl = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&q=80';
  const backgroundColor = '#1a1a2e';
  const textColor = '#ffffff';

  // Viewport width constraints
  const viewportWidths = {
    laptop: 'w-full max-w-[1920px]',
    tablet: 'w-full max-w-[768px]',
    mobile: 'w-full max-w-[375px]',
  };

  const features = [
    { icon: <FiShoppingBag />, text: 'Free Shipping' },
    { icon: <FiStar />, text: 'Premium Quality' },
    { icon: <FiTruck />, text: 'Fast Delivery' },
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
          className="relative overflow-hidden min-h-[600px] md:min-h-[650px] lg:min-h-[700px]"
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
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
            </motion.div>
          )}

          {/* Floating Decorative Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl hidden lg:block" />
          <div className="absolute top-40 right-20 w-32 h-32 bg-primary/20 rounded-full blur-2xl hidden lg:block" />
          <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl hidden lg:block" />

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20">
            <div className="w-full max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-8"
                style={{ color: textColor }}
              >
                {subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xs sm:text-sm md:text-base font-light uppercase tracking-[0.3em] mb-4 text-white/80"
                  >
                    {subtitle}
                  </motion.p>
                )}
                {title && (
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-light mb-6 sm:mb-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight"
                  >
                    {title}
                  </motion.h1>
                )}
                {description && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8 sm:mb-10 text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto font-light"
                  >
                    {description}
                  </motion.p>
                )}
                {buttonText && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center gap-4 flex-wrap"
                  >
                    <a
                      href={buttonLink || '#'}
                      className="group relative inline-block px-8 py-4 bg-white text-gray-900 font-medium rounded-none hover:bg-gray-100 transition-all duration-300 text-sm sm:text-base md:text-lg overflow-hidden"
                    >
                      <span className="relative z-10">{buttonText}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                      <span className="absolute inset-0 flex items-center justify-center text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {buttonText}
                      </span>
                    </a>
                  </motion.div>
                )}
              </motion.div>

              {/* Feature Cards */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-12"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 sm:p-6 text-center hover:bg-white/20 transition-all duration-300"
                  >
                    <div className="flex justify-center mb-3 text-white text-2xl">
                      {feature.icon}
                    </div>
                    <p className="text-white/90 text-sm sm:text-base font-medium">{feature.text}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDesign6;
