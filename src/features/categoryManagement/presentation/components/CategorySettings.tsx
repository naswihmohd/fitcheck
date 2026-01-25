import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSettings } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchThemeData, updateCategorySettings } from '../../redux/themeSlice';
import type { RootState, AppDispatch } from '../../../../general/redux/store';
import type { CategorySettingsProps } from '../../data/categoryTypes';

interface CategoryToggleProps {
    label: string;
    description: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    delay?: number;
    loading?: boolean;
}

const CategoryToggle: React.FC<CategoryToggleProps> = ({
    label,
    description,
    enabled,
    onChange,
    delay = 0,
    loading,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className="bg-white rounded-lg border border-gray-200 p-3"
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{label}</h3>
                    <p className="text-xs text-gray-600">{description}</p>
                </div>
                <div className="ml-3">
                    <button
                        onClick={() => onChange(!enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-primary' : 'bg-red-400'
                            }`}
                        role="switch"
                        aria-checked={enabled}
                        disabled={loading}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const CategorySettings: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const { storeTheme, loading, error } = useSelector((state: RootState) => state.theme);
    const categorySettings = storeTheme?.categorySettings;

    // Load settings from Redux on mount
    useEffect(() => {
        if (!categorySettings) {
            dispatch(fetchThemeData());
        }
    }, []);

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    // Default settings if not loaded yet
    const settings: CategorySettingsProps = categorySettings || {
        firstCategoryEnabled: false,
        secondCategoryEnabled: false,
        thirdCategoryEnabled: false,
        fourthCategoryEnabled: false,
    };

    const handleFirstCategoryToggle = async (enabled: boolean) => {
        const newSettings = {
            ...settings,
            firstCategoryEnabled: enabled,
            // If disabling 1st category, disable all categories
            secondCategoryEnabled: enabled ? settings.secondCategoryEnabled : false,
            thirdCategoryEnabled: enabled ? settings.thirdCategoryEnabled : false,
            fourthCategoryEnabled: enabled ? settings.fourthCategoryEnabled : false,
        };

        try {
            await dispatch(updateCategorySettings(newSettings)).unwrap();
            toast.success(
                enabled
                    ? '1st Category has been enabled'
                    : '1st Category has been disabled'
            );
        } catch (error) {
            // Error toast is handled by Redux error state
        }
    };

    const handleSecondCategoryToggle = async (enabled: boolean) => {
        const newSettings = {
            ...settings,
            secondCategoryEnabled: enabled,
            // If disabling 2nd category, disable 3rd and 4th
            thirdCategoryEnabled: enabled ? settings.thirdCategoryEnabled : false,
            fourthCategoryEnabled: enabled ? settings.fourthCategoryEnabled : false,
            // If enabling 2nd category, enable 1st
            firstCategoryEnabled: enabled ? true : settings.firstCategoryEnabled,
        };

        try {
            await dispatch(updateCategorySettings(newSettings)).unwrap();
            toast.success(
                enabled
                    ? '2nd Category has been enabled'
                    : '2nd Category has been disabled'
            );
        } catch (error) {
            // Error toast is handled by Redux error state
        }
    };

    const handleThirdCategoryToggle = async (enabled: boolean) => {
        const newSettings = {
            ...settings,
            thirdCategoryEnabled: enabled,
            // If disabling 3rd category, disable 4th
            fourthCategoryEnabled: enabled ? settings.fourthCategoryEnabled : false,
            // If enabling 3rd category, enable 1st and 2nd
            firstCategoryEnabled: enabled ? true : settings.firstCategoryEnabled,
            secondCategoryEnabled: enabled ? true : settings.secondCategoryEnabled,
        };

        try {
            await dispatch(updateCategorySettings(newSettings)).unwrap();
            toast.success(
                enabled
                    ? '3rd Category has been enabled'
                    : '3rd Category has been disabled'
            );
        } catch (error) {
            // Error toast is handled by Redux error state
        }
    };

    const handleFourthCategoryToggle = async (enabled: boolean) => {
        const newSettings = {
            ...settings,
            fourthCategoryEnabled: enabled,
            // If enabling 4th category, enable all categories above it
            firstCategoryEnabled: enabled ? true : settings.firstCategoryEnabled,
            secondCategoryEnabled: enabled ? true : settings.secondCategoryEnabled,
            thirdCategoryEnabled: enabled ? true : settings.thirdCategoryEnabled,
        };

        try {
            await dispatch(updateCategorySettings(newSettings)).unwrap();
            toast.success(
                enabled
                    ? '4th Category has been enabled'
                    : '4th Category has been disabled'
            );
        } catch (error) {
            // Error toast is handled by Redux error state
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl space-y-2"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    {loading ? (
                        <motion.div
                            className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                    ) : (
                        <FiSettings className="w-4 h-4 text-primary" />
                    )}
                </div>
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Category Settings</h2>
                    <p className="text-xs text-gray-600">Enable or disable category types</p>
                </div>
            </div>

            {/* Toggle Cards */}
            <div className="grid grid-cols-2 gap-2">
                <CategoryToggle
                    label="1st Category"
                    description="Enable first-level category management"
                    enabled={settings.firstCategoryEnabled}
                    onChange={handleFirstCategoryToggle}
                    delay={0.1}
                    loading={loading}
                />
                <CategoryToggle
                    label="2nd Category"
                    description="Enable second-level category management"
                    enabled={settings.secondCategoryEnabled}
                    onChange={handleSecondCategoryToggle}
                    delay={0.2}
                    loading={loading}
                />
                <CategoryToggle
                    label="3rd Category"
                    description="Enable third-level category management"
                    enabled={settings.thirdCategoryEnabled}
                    onChange={handleThirdCategoryToggle}
                    delay={0.3}
                    loading={loading}
                />
                <CategoryToggle
                    label="4th Category"
                    description="Enable fourth-level category management"
                    enabled={settings.fourthCategoryEnabled}
                    onChange={handleFourthCategoryToggle}
                    delay={0.4}
                    loading={loading}
                />
            </div>
        </motion.div>
    );
};

export default CategorySettings;
