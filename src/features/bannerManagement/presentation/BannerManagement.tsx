import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink, Outlet } from 'react-router';
import { FiInfo } from 'react-icons/fi';
import type { AppDispatch, RootState } from '../../../general/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchThemeData } from '../../categoryManagement/redux/themeSlice';

function BannerManagement() {
  const [showExplanation, setShowExplanation] = useState(true);

  const { storeTheme, error, loading } = useSelector((state: RootState) => state.theme);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (!storeTheme) {
      dispatch(fetchThemeData());
    }
  }, []);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);


  const tabs = [
    { label: 'Hero Banner', to: '.' },
    { label: 'Lead Banner', to: 'lead-banner' },
    { label: 'Offer Banner', to: 'offer-banner' },
  ];

  return (
    <div className="space-y-6 pb-6">

      {/* Explanation Section */}
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6 shadow-sm"
        >
          <button
            onClick={() => setShowExplanation(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close explanation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-start gap-4 pr-8">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <FiInfo className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About Banner Management</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Banner Management allows you to organize and manage different types of banners displayed throughout your store:
                <span className="font-semibold text-primary"> Hero Banner</span>,
                <span className="font-semibold text-primary"> Lead Banner</span>, and
                <span className="font-semibold text-primary"> Offer Banner</span>.
                These banners help promote products, showcase offers, and guide customers through your store.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Use the tabs below to manage each banner type. You can add, edit, or remove banners that will
                be displayed on your storefront to attract and engage customers.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs Section */}
      <div className="flex gap-x-0 gap-y-2 flex-wrap border-b border-gray-200">
        {tabs.map(({ label, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '.'}
            className={({ isActive }) => `px-3 py-2 min-w-[120px] text-center font-medium text-sm cursor-pointer transition-colors ${isActive
              ? 'border-b-4 border-primary text-primary bg-primary/5 duration-300'
              : 'text-black hover:bg-primary/5'
              }`}
          >
            {label}
          </NavLink>
        ))}
      </div>

      <Outlet context={{ storeTheme, loading }} />
    </div>
  );
}

export default BannerManagement;
