
import { motion } from 'framer-motion';
import { Outlet } from 'react-router';
import CategorySettings from './components/CategorySettings';
import type { RootState } from '../../../general/redux/store';
import { useSelector } from 'react-redux';

function CategoryManagement() {

  const { storeTheme } = useSelector((state: RootState) => state.theme);
  const categorySettings = storeTheme?.categorySettings || null;

  return (
    <div className="space-y-6 pb-6">
      {/* Category Settings Section */}
      <CategorySettings />

      <hr className="border-gray-200" />

      {/* Child Routes Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Outlet context={{ categorySettings }} />
      </motion.div>
    </div>
  );
}

export default CategoryManagement;
