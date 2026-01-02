import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation, useNavigate } from 'react-router';
import {
    MdMenu,
    MdClose,
    MdSource,
    MdPaid,
    MdSupport,
    MdAssignmentInd,
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
        if (pathname.includes('lead-assign')) return 'lead-assign';
        if (pathname.includes('help-support')) return 'help-support';
        if (pathname.includes('paid-ads')) return 'paid-ad-settings';
        if (pathname.includes('lead-source')) return 'lead-source';
        if (pathname.includes('duplicate-leads')) return 'duplicate-leads';
        return 'lead-assign'; // Default to lead-assign if no match
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
            id: 'lead-assign',
            title: 'Lead Assign',
            isAccess: true,
            icon: MdAssignmentInd,
            description: 'Assign leads to team members',
            path: '/branch/settings/lead-assign'
        },
        {
            id: 'help-support',
            title: 'Help & Support',
            isAccess: true,
            icon: MdSupport,
            description: 'Get help and support',
            path: '/branch/settings/help-support'
        },
        {
            id: 'paid-ad-settings',
            title: 'Paid Ad Settings',
            isAccess: true,
            icon: MdPaid,
            description: 'Manage paid advertisement sources',
            path: '/branch/settings/paid-ads'
        },
        {
            id: 'lead-source',
            title: 'Lead Source',
            isAccess: true,
            icon: MdSource,
            description: 'Add and manage lead sources',
            path: '/branch/settings/lead-source'
        },
        {
            id: 'duplicate-leads',
            title: 'Duplicate Leads',
            isAccess: true,
            icon: MdSource,
            description: 'View duplicate leads',
            path: '/branch/settings/duplicate-leads'
        },
    ];



    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex h-full relative"
        >
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <motion.div
                initial={{ x: -200 }}
                animate={{ x: isSidebarOpen ? 0 : -200 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
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
                transition={{ delay: 0.4, duration: 0.3 }}
                className="flex-1"
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

                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-3"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default Settings;
