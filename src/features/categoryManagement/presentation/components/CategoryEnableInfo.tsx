import { motion } from 'framer-motion';
import { FiSettings, FiLock } from 'react-icons/fi';
import { useNavigate } from 'react-router';

function CategoryEnableInfo({ category }: { category: string }) {
    const navigate = useNavigate();

    const handleNavigateToSettings = () => {
        navigate('/category-management');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center min-h-[400px] p-8"
        >
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mb-6 p-3 rounded-full shadow-sm"
            >
                <FiLock className="w-8 h-8 text-gray-400" />
            </motion.div>

            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-xl font-bold text-gray-900 mb-3 text-center"
            >
                {`${category} Category is Disabled`}
            </motion.h2>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="text-gray-600 text-center mb-8 max-w-md"
            >
                To manage {category} categories, please enable {category} category feature in the Category settings.
            </motion.p>

            {category !== "First" && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    onClick={handleNavigateToSettings}
                    className="flex items-center gap-2 px-4 text-sm py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
                >
                    <FiSettings className="w-5 h-5" />
                    Go Back
                </motion.button>
            )}
        </motion.div>
    );
}

export default CategoryEnableInfo;
