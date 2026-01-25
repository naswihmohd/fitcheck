import { useState } from 'react';
import { motion } from 'framer-motion';
import { Outlet, useLocation, useNavigate } from 'react-router';
import {
    MdMenu,
    MdClose,
    MdAccountCircle,
    MdPublic,
    MdPrivacyTip,
    MdSupport,
    MdPhoneAndroid,
    MdLocalShipping,
    MdSearch,
    MdPayment,
    MdFilterAlt,
} from 'react-icons/md';
import LogoutButton from '../../login/presentation/components/LogoutButton';

interface SettingsMenuItem {
    id: string;
    title: string;
    isAccess: boolean;
    icon: any;
    description: string;
    path: string;
}

const Settings = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

    // Determine active menu from current pathname
    const getActiveMenuId = (): string => {
        const pathname = location.pathname;
        if (pathname.includes('account')) return 'account';
        if (pathname.includes('social-media')) return 'social-media';
        if (pathname.includes('privacy-policy')) return 'privacy-policy';
        if (pathname.includes('help-support')) return 'help-support';
        if (pathname.includes('onboarding')) return 'onboarding';
        if (pathname.includes('delivery')) return 'delivery';
        if (pathname.includes('keyword-settings')) return 'keyword-settings';
        if (pathname.includes('payment-gateway')) return 'payment-gateway';
        if (pathname.includes('perfume-filters')) return 'perfume-filters';
        return 'account'; // Default to account if no match
    };

    const selectedMenu = getActiveMenuId();

    const handleMenuClick = (path: string) => {
        navigate(path);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const settingsMenuItems: SettingsMenuItem[] = [
        {
            id: 'account',
            title: 'Account Info',
            isAccess: true,
            icon: MdAccountCircle,
            description: 'Manage account settings',
            path: '/settings'
        },
        {
            id: 'social-media',
            title: 'Social Media',
            isAccess: true,
            icon: MdPublic,
            description: 'Manage social media settings',
            path: '/settings/social-media'
        },
        {
            id: 'privacy-policy',
            title: 'Privacy & Policy',
            isAccess: true,
            icon: MdPrivacyTip,
            description: 'Manage privacy policy',
            path: '/settings/privacy-policy'
        },
        {
            id: 'help-support',
            title: 'Help & Support',
            isAccess: true,
            icon: MdSupport,
            description: 'Get help and support',
            path: '/settings/help-support'
        },
        {
            id: 'onboarding',
            title: 'On-Boarding Screen',
            isAccess: true,
            icon: MdPhoneAndroid,
            description: 'Manage onboarding screens',
            path: '/settings/onboarding'
        },
        {
            id: 'delivery',
            title: 'Delivery',
            isAccess: true,
            icon: MdLocalShipping,
            description: 'Manage delivery settings',
            path: '/settings/delivery'
        },
        {
            id: 'keyword-settings',
            title: 'Keyword Settings',
            isAccess: true,
            icon: MdSearch,
            description: 'Manage keyword settings',
            path: '/settings/keyword-settings'
        },
        {
            id: 'payment-gateway',
            title: 'Payment Gateway',
            isAccess: true,
            icon: MdPayment,
            description: 'Manage payment gateway',
            path: '/settings/payment-gateway'
        },
        {
            id: 'perfume-filters',
            title: 'Perfume Filters',
            isAccess: true,
            icon: MdFilterAlt,
            description: 'Manage perfume filters',
            path: '/settings/perfume-filters'
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
                    className="fixed inset-0 z-30 lg:hidden"
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
                    fixed lg:relative z-40 h-full border border-secondary/20 rounded-2xl overflow-hidden
                    ${isSidebarOpen ? 'w-40' : 'w-0'} lg:w-40
                `}
                style={{ minWidth: isSidebarOpen ? 200 : 0, maxWidth: 200 }}
            >
                <div className="flex flex-col h-full">
                    {/* Header with Toggle Button */}
                    <div className="flex items-center justify-between">
                        <p></p>
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 m-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <MdClose className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Settings Menu */}
                    <div className="flex-1 overflow-y-auto py-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                            className="px-3"
                        >
                            <div className="space-y-1">
                                {settingsMenuItems.map((item) => {
                                    const isActive = selectedMenu === item.id;
                                    const isAccess = item.isAccess;
                                    return (
                                        isAccess &&
                                        <motion.div
                                            key={item.id}
                                            whileHover={{ x: 4 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <button
                                                onClick={() => handleMenuClick(item.path)}
                                                className={`
                                                    w-full flex cursor-pointer items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200
                                                    ${isActive
                                                        ? 'text-primary font-bold'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                    }
                                                `}
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">{item.title}</div>
                                                </div>
                                            </button>
                                        </motion.div>
                                    );
                                })}

                                {/* <ChangeCompanyButton /> */}

                                <LogoutButton />
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
                <div className="flex items-center justify-between mb-6 lg:hidden">
                    <div></div>
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        <MdMenu className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                <div
                    className="px-4"
                >
                    <Outlet />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Settings;
