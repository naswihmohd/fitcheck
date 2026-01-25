import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiLayout, FiArrowRight } from 'react-icons/fi';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import toast from 'react-hot-toast';
import HeroDesign1 from './components/HeroDesign1';
import HeroDesign2 from './components/HeroDesign2';
import HeroDesign3 from './components/HeroDesign3';
import HeroDesign4 from './components/HeroDesign4';
import HeroDesign5 from './components/HeroDesign5';
import HeroDesign6 from './components/HeroDesign6';
import HeroDesign7 from './components/HeroDesign7';
import HeroDesign8 from './components/HeroDesign8';
import HeroDesign9 from './components/HeroDesign9';
import HeroDesign10 from './components/HeroDesign10';
import HeroDesign11 from './components/HeroDesign11';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../general/redux/store';
import { updateHeroThemeLocal } from '../../categoryManagement/redux/themeSlice';
import type { StoreThemeProps } from '../../storeTheme/data/themeTypes';
import { useOutletContext, useNavigate } from 'react-router';

function HeroThemes() {

  const { storeTheme } = useOutletContext<{ storeTheme: StoreThemeProps }>();
  const navigate = useNavigate();

  // All hero themes
  const [heroThemes] = useState([
    {
      id: 'hero-1',
      name: 'Hero Design 1',
      component: <HeroDesign1 />,
    },
    {
      id: 'hero-2',
      name: 'Hero Design 2',
      component: <HeroDesign2 />,
    },
    {
      id: 'hero-3',
      name: 'Hero Design 3',
      component: <HeroDesign3 />,
    },
    {
      id: 'hero-4',
      name: 'Hero Design 4',
      component: <HeroDesign4 />,
    },
    {
      id: 'hero-5',
      name: 'Hero Design 5',
      component: <HeroDesign5 />,
    },
    {
      id: 'hero-6',
      name: 'Hero Design 6',
      component: <HeroDesign6 />,
    },
    {
      id: 'hero-7',
      name: 'Hero Design 7',
      component: <HeroDesign7 />,
    },
    {
      id: 'hero-8',
      name: 'Hero Design 8',
      component: <HeroDesign8 />,
    },
    {
      id: 'hero-9',
      name: 'Hero Design 9',
      component: <HeroDesign9 />,
    },
    {
      id: 'hero-10',
      name: 'Hero Design 10',
      component: <HeroDesign10 />,
    },
    {
      id: 'hero-11',
      name: 'Hero Design 11',
      component: <HeroDesign11 />,
    },
  ]);

  const [selectedTheme, setSelectedTheme] = useState<StoreThemeProps['heroTheme'] | null>(null);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (storeTheme?.heroTheme) {
      setSelectedTheme(storeTheme.heroTheme);
    }
  }, [storeTheme]);

  console.log(selectedTheme);

  // Find the selected theme
  const selectedThemeData = selectedTheme
    ? heroThemes.find(theme => theme.id === selectedTheme)
    : null;

  const handleSelectTheme = async (themeId: string) => {
    try {
      const themeValue = selectedTheme === themeId ? null : themeId as StoreThemeProps['heroTheme'];
      setSelectedTheme(themeValue);
      // Update Firebase
      const docRef = doc(db, 'general', 'themes');
      await setDoc(docRef, { heroTheme: themeValue }, { merge: true });
      dispatch(updateHeroThemeLocal(themeValue));

      toast.success(
        themeValue
          ? `Hero theme "${heroThemes.find(t => t.id === themeId)?.name}" selected successfully!`
          : 'Hero theme deselected successfully!'
      );
    } catch (error) {
      console.error('Error saving hero theme:', error);
      toast.error('Failed to save hero theme. Please try again.');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Themes</h1>
          <p className="text-sm text-gray-600 mt-1">
            Choose and customize your hero section design for the homepage
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg">
          <FiLayout className="w-4 h-4" />
          <span className="text-sm font-medium">{heroThemes.length} Themes Available</span>
        </div>
      </motion.div>

      {/* Selected Hero Theme Preview */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-lg overflow-hidden"
      >
        {/* Header Section */}
        {selectedThemeData ? (
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Currently Selected Theme
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedThemeData.name}
                </p>
              </div>
              <button
                onClick={() => navigate('/banner-management')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium text-sm"
              >
                Edit Your Banner
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className='text-center'>
                <FiLayout className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h2 className="text-base font-semibold text-gray-900">
                  No Selected Theme
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Please select a hero section theme from the options below
                </p>
              </div>
          </div>
        )}
      </motion.div>

      <hr className="my-4 border-gray-200" />

      {/* All Hero Designs Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Explore Hero Themes</h2>
        <div className="flex flex-col gap-4">
          {heroThemes.map((theme) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-lg"
            >
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {theme.name}
                  </h2>
                  <button
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${selectedTheme === theme.id ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    role="switch"
                    aria-checked={selectedTheme === theme.id}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${selectedTheme === theme.id ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              </div>
              <div className="w-full">
                {theme.component}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default HeroThemes;
