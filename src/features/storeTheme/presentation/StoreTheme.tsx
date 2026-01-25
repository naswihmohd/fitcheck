import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Outlet, useLocation, useNavigate } from 'react-router';
import {
  MdMenu,
  MdImage,
  MdLocalOffer,
  MdColorLens,
  MdTextFields,
  MdViewQuilt,
  MdShoppingBag,
} from 'react-icons/md';
import type { AppDispatch, RootState } from '../../../general/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchThemeData } from '../../categoryManagement/redux/themeSlice';

interface StoreThemeMenuItem {
  id: string;
  title: string;
  isAccess: boolean;
  icon: any;
  description: string;
  path: string;
}

const StoreTheme = () => {
  const { storeTheme, error } = useSelector((state: RootState) => state.theme);
  const dispatch: AppDispatch = useDispatch();

  // Load settings from Redux on mount
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

  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Determine active menu from current pathname
  const getActiveMenuId = (): string => {
    const pathname = location.pathname;
    if (pathname.includes('hero-banner')) return 'hero-banner';
    if (pathname.includes('lead-banner')) return 'lead-banner';
    if (pathname.includes('offer-banner')) return 'offer-banner';
    if (pathname.includes('colors')) return 'colors';
    if (pathname.includes('typography')) return 'typography';
    if (pathname.includes('layout')) return 'layout';
    if (pathname.includes('product-display')) return 'product-display';
    return 'hero-banner'; // Default to hero-banner if no match
  };

  const selectedMenu = getActiveMenuId();

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const storeThemeMenuItems: StoreThemeMenuItem[] = [
    {
      id: 'hero-banner',
      title: 'Hero Banner',
      isAccess: true,
      icon: MdImage,
      description: 'Manage hero banners',
      path: '/store-theme'
    },
    {
      id: 'lead-banner',
      title: 'Lead Banner',
      isAccess: true,
      icon: MdImage,
      description: 'Manage lead banners',
      path: '/store-theme/lead-banner'
    },
    {
      id: 'offer-banner',
      title: 'Offer Banner',
      isAccess: true,
      icon: MdLocalOffer,
      description: 'Manage offer banners',
      path: '/store-theme/offer-banner'
    },
    {
      id: 'colors',
      title: 'Colors',
      isAccess: true,
      icon: MdColorLens,
      description: 'Manage store colors',
      path: '/store-theme/colors'
    },
    {
      id: 'typography',
      title: 'Typography',
      isAccess: true,
      icon: MdTextFields,
      description: 'Manage fonts and typography',
      path: '/store-theme/typography'
    },
    {
      id: 'layout',
      title: 'Layout',
      isAccess: true,
      icon: MdViewQuilt,
      description: 'Manage store layout',
      path: '/store-theme/layout'
    },
    {
      id: 'product-display',
      title: 'Product Display',
      isAccess: true,
      icon: MdShoppingBag,
      description: 'Manage product display settings',
      path: '/store-theme/product-display'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex h-full relative max-h-screen overflow-hidden"
    >
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed inset-0 z-30 lg:hidden bg-black/50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        className={`
                    fixed lg:relative z-40 h-full border border-secondary/20 rounded-2xl overflow-hidden bg-white
                    ${isSidebarOpen ? 'w-40' : 'w-0'} lg:w-40
                `}
        style={{ minWidth: isSidebarOpen ? 200 : 0, maxWidth: 200 }}
      >
        <div className="flex flex-col h-full">


          {/* Store Theme Menu */}
          <div className="flex-1 overflow-y-auto py-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="px-3"
            >
              <div className="space-y-1">
                {storeThemeMenuItems.map((item) => {
                  const isActive = selectedMenu === item.id;
                  const isAccess = item.isAccess;
                  const IconComponent = item.icon;
                  return (
                    isAccess &&
                    <motion.div
                      key={item.id}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={() => handleMenuClick(item.path)}
                        className={`
                                                    w-full flex cursor-pointer items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200
                                                    ${isActive
                            ? 'bg-primary text-white font-bold'
                            : 'text-gray-700 hover:bg-gray-100'
                          }
                                                `}
                      >
                        <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.title}</div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 max-h-screen overflow-y-auto scrollbar-none smooth-scroll"
      >
        {/* Mobile Header with Toggle Button */}
        <div className="flex items-center justify-between mb-6 lg:hidden p-4">
          <h2 className="text-xl font-semibold text-gray-800">Store Theme</h2>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors"
          >
            <MdMenu className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="px-4">
          <Outlet context={{ storeTheme }} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StoreTheme;
