import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMonitor, FiTablet, FiSmartphone, FiArrowRight } from 'react-icons/fi';
import { NavLink } from 'react-router';
import type { HeroBannerConfig } from '../../data/heroTypes';

type ViewportType = 'laptop' | 'tablet' | 'mobile';

const HeroDesign7: React.FC<{ data?: HeroBannerConfig }> = ({ data }) => {
  const [viewport, setViewport] = useState<ViewportType>('laptop');

  // Fixed data
  const contentData: HeroBannerConfig = {
    bannerId: data?.bannerId || 'hero-7',
    title: data?.title || 'New Arrivals',
    subtitle: data?.subtitle || 'Spring Collection 2024',
    description: data?.description || 'Discover the latest fashion trends and elevate your style with our exclusive spring collection. Limited time offers available now.',
    buttonText: data?.buttonText || 'Shop Now',
    buttonLink: data?.buttonLink || '#',
    imageUrl: data?.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80',
    textColor: data?.textColor || '#ffffff',
    buttonBackgroundColor: data?.buttonBackgroundColor || '#ffffff',
    buttonTextColor: data?.buttonTextColor || '#000000',
    subtitleTextColor: data?.subtitleTextColor || '#ffffff',
    descriptionTextColor: data?.descriptionTextColor || '#ffffff',
    bottomStats: data?.bottomStats || [
      {
        value: '50K+',
        label: 'Happy Customers',
      },
      {
        value: '200+',
        label: 'Products',
      },
      {
        value: '4.9★',
        label: 'Rating',
      },
    ],
  }

  return (
    <div className="w-full">
      {/* Responsive View Buttons */}
      <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => setViewport('laptop')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${viewport === 'laptop'
            ? 'bg-primary text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
        >
          <FiMonitor className="w-4 h-4" />
          <span>Laptop</span>
        </button>
        <button
          onClick={() => setViewport('tablet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${viewport === 'tablet'
            ? 'bg-primary text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
        >
          <FiTablet className="w-4 h-4" />
          <span>Tablet</span>
        </button>
        <button
          onClick={() => setViewport('mobile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${viewport === 'mobile'
            ? 'bg-primary text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
        >
          <FiSmartphone className="w-4 h-4" />
          <span>Mobile</span>
        </button>
      </div>

      {/* Hero Design Container with Viewport Constraint */}
      {viewport === 'laptop' && <HeroDesign7Laptop data={contentData} />}
      {viewport === 'tablet' && <HeroDesign7Tablet data={contentData} />}
      {viewport === 'mobile' && <HeroDesign7Mobile data={contentData} />}
    </div>
  );
};

export default HeroDesign7;


const HeroDesign7Laptop: React.FC<{ data: HeroBannerConfig }> = ({ data }) => {


  return (
    <div className={`mx-auto max-w-[1920px] transition-all duration-300`}>
      <div
        className="relative overflow-hidden min-h-[500px] md:min-h-[600px] lg:min-h-[700px]"
      >
        {/* Video-Style Background */}
        {data?.imageUrl && (
          <div className="absolute inset-0">
            <img
              src={data?.imageUrl}
              alt={data?.title || 'Hero'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Cinematic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        )}

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Content - Left Aligned */}
        <div className="relative z-10 h-full flex items-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-12 sm:py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-2xl"
            style={{ color: data?.textColor }}
          >
            {data?.subtitle && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-20"
              >
                <div className="h-px w-12 bg-white/50" />
                <p className="text-xs sm:text-sm md:text-base font-medium uppercase tracking-wider" style={{ color: data?.subtitleTextColor || '#ffffff' }}>
                  {data?.subtitle}
                </p>
              </motion.div>
            )}
            {data?.title && (
              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="font-bold mb-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight"
              >
                {data?.title}
              </motion.h1>
            )}
            {data?.description && (
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8 sm:mb-10 text-sm lg:text-base leading-relaxed max-w-xl"
                style={{ color: data?.descriptionTextColor || '#ffffff' }}
              >
                {data?.description}
              </motion.p>
            )}
            {data?.buttonText && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <NavLink
                  to={data?.buttonLink || '#'}
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 text-sm sm:text-base md:text-lg overflow-hidden"
                  style={{ 
                    backgroundColor: data?.buttonBackgroundColor || '#ffffff',
                    color: data?.buttonTextColor || '#000000'
                  }}
                >
                  <span>{data?.buttonText}</span>
                  <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <span className="absolute inset-0 flex items-center justify-center gap-2 text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {data?.buttonText}
                    <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </NavLink>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Bottom Stats Bar */}
        {data?.bottomStats && data.bottomStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="absolute bottom-0 left-0 right-0  backdrop-blur-md"
          >
            <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6">
              <div className={`grid gap-4 sm:gap-8 text-center ${data.bottomStats.length === 1 ? 'grid-cols-1' : data.bottomStats.length === 2 ? 'grid-cols-2' : data.bottomStats.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                {data.bottomStats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-xl hover:text-white/80 font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-xs hover:text-white/80 sm:text-sm text-white/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const HeroDesign7Tablet: React.FC<{ data: HeroBannerConfig }> = ({ data }) => {

  return (
    <div className={`mx-auto max-w-[768px] transition-all duration-300`}>
      <div
        className="relative overflow-hidden min-h-[600px]"
      >
        {/* Video-Style Background */}
        {data?.imageUrl && (
          <div className="absolute inset-0">
            <img
              src={data?.imageUrl}
              alt={data?.title || 'Hero'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Cinematic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        )}

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Content - Left Aligned */}
        <div className="relative z-10 h-full flex items-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-2xl"
            style={{ color: data?.textColor }}
          >
            {data?.subtitle && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-24"
              >
                <div className="h-px w-12 bg-white/50" />
                <p className="text-sm font-medium uppercase tracking-wider" style={{ color: data?.subtitleTextColor || '#ffffff' }}>
                  {data?.subtitle}
                </p>
              </motion.div>
            )}
            {data?.title && (
              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="font-bold mb-5 text-5xl leading-tight"
              >
                {data?.title}
              </motion.h1>
            )}
            {data?.description && (
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8 text-base leading-relaxed max-w-xl"
                style={{ color: data?.descriptionTextColor || '#ffffff' }}
              >
                {data?.description}
              </motion.p>
            )}
            {data?.buttonText && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <NavLink
                  to={data?.buttonLink || '#'}
                  className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 text-base overflow-hidden"
                  style={{ 
                    backgroundColor: data?.buttonBackgroundColor || '#ffffff',
                    color: data?.buttonTextColor || '#000000'
                  }}
                >
                  <span>{data?.buttonText}</span>
                  <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <span className="absolute inset-0 flex items-center justify-center gap-2 text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {data?.buttonText}
                    <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </NavLink>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Bottom Stats Bar */}
        {data?.bottomStats && data.bottomStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="absolute bottom-0 left-0 right-0  backdrop-blur-md"
          >
            <div className="px-6 py-5">
              <div className={`grid gap-6 text-center ${data.bottomStats.length === 1 ? 'grid-cols-1' : data.bottomStats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {data.bottomStats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-white/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const HeroDesign7Mobile: React.FC<{ data: HeroBannerConfig }> = ({ data }) => {

  return (
    <div className={`mx-auto max-w-[360px] transition-all duration-300`}>
      <div
        className="relative overflow-hidden min-h-[650px]"
      >
        {/* Video-Style Background */}
        {data?.imageUrl && (
          <div className="absolute inset-0">
            <img
              src={data?.imageUrl}
              alt={data?.title || 'Hero'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Cinematic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        )}

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Content - Left Aligned */}
        <div className="relative z-10 h-full flex items-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-2xl"
            style={{ color: data?.textColor }}
          >
            {data?.subtitle && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-28"
              >
                <div className="h-px w-12 bg-white/50" />
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: data?.subtitleTextColor || '#ffffff' }}>
                  {data?.subtitle}
                </p>
              </motion.div>
            )}
            {data?.title && (
              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="font-bold mb-5 text-center text-4xl leading-tight"
              >
                {data?.title}
              </motion.h1>
            )}
            {data?.description && (
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8 text-sm text-center leading-relaxed max-w-xl"
                style={{ color: data?.descriptionTextColor || '#ffffff' }}
              >
                {data?.description}
              </motion.p>
            )}
            {data?.buttonText && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className='flex justify-center'
              >
                <NavLink
                  to={data?.buttonLink || '#'}
                  className="group relative inline-flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 text-sm overflow-hidden"
                  style={{ 
                    backgroundColor: data?.buttonBackgroundColor || '#ffffff',
                    color: data?.buttonTextColor || '#000000'
                  }}
                >
                  <span>{data?.buttonText}</span>
                  <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <span className="absolute inset-0 flex items-center justify-center gap-2 text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {data?.buttonText}
                    <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </NavLink>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Bottom Stats Bar */}
        {data?.bottomStats && data.bottomStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="absolute bottom-0 left-0 right-0 backdrop-blur-md"
          >
            <div className="px-4 py-4 sm:py-6">
              <div className={`grid gap-4 sm:gap-8 text-center ${data.bottomStats.length === 1 ? 'grid-cols-1' : data.bottomStats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {data.bottomStats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-white/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
