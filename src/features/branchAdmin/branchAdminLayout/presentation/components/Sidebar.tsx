import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { MdChevronRight } from 'react-icons/md';
import { RiMenuFold3Line, RiMenuUnfold3Line } from 'react-icons/ri';
import { RxExit } from "react-icons/rx";
import { Constants } from '../../../../../general/constants/constants';

import dashboardIcon from '../../../../../assets/images/branch-admin-sidebar-icons/dashboard-icon.svg'
import agreementIcon from '../../../../../assets/images/branch-admin-sidebar-icons/agreement-icon.svg'
import appointmentIcon from '../../../../../assets/images/branch-admin-sidebar-icons/appointment-icon.svg'
import batchManagementIcon from '../../../../../assets/images/branch-admin-sidebar-icons/batch-management-icon.svg'
import feeManagementCoinIcon from '../../../../../assets/images/branch-admin-sidebar-icons/fee-management-coin.svg'
import noticeSettingsIcon from '../../../../../assets/images/branch-admin-sidebar-icons/notice-settings-icon.svg'
import placementManagementIcon from '../../../../../assets/images/branch-admin-sidebar-icons/placement-management-icon.svg'
import studentManagementIcon from '../../../../../assets/images/branch-admin-sidebar-icons/student-management-icon.svg'
import testPortalIcon from '../../../../../assets/images/branch-admin-sidebar-icons/test-portal-icon.svg'
import tutorMangementIcon from '../../../../../assets/images/branch-admin-sidebar-icons/tutor-mangement-icon.svg'
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../../general/redux/store';



export interface NavItem {
    id: string;
    title: string;
    icon?: string;
    path?: string;
    hasSubmenu?: boolean;
    subItems?: NavItem[];
}

interface SidebarProps {
    isOpen?: boolean;
    toggleSidebar: () => void;
    sidebarOpen: boolean;
}

const Sidebar = ({ isOpen = true, toggleSidebar, sidebarOpen }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    const { user } = useSelector((state: RootState) => state.user);
    const isAdmin = user?.role === "admin";

    const navigationData: NavItem[] = [
        {
            id: 'dashboard',
            title: 'Dashboard',
            icon: dashboardIcon,
            path: '/branch',
        },
        {
            id: 'sales-executive-management',
            title: 'Sales Exe. Management',
            icon: agreementIcon,
            path: '/branch/sales-executive-management',
        },
        {
            id: 'fee-management',
            title: 'Fee Management',
            icon: feeManagementCoinIcon,
            path: '/branch/fee-management',
        },
        {
            id: 'batch-management',
            title: 'Batch Management',
            icon: batchManagementIcon,
            path: '/branch/batch-management',
        },
        {
            id: 'tutor-management',
            title: 'Tutor Management',
            icon: tutorMangementIcon,
            path: '/branch/tutor-management',
        },
        {
            id: 'student-management',
            title: 'Student Management',
            icon: studentManagementIcon,
            path: '/branch/student-management',
        },
        {
            id: 'placement-management',
            title: 'Placement Management',
            icon: placementManagementIcon,
            path: '/branch/placement-management',
        },
        {
            id: 'notice-settings',
            title: 'Notice Settings',
            icon: noticeSettingsIcon,
            path: '/branch/notice-settings',
        },
        {
            id: 'test-portal',
            title: 'Test Portal',
            icon: testPortalIcon,
            path: '/branch/test-portal',
        },
        {
            id: 'appointments',
            title: 'Appointments',
            icon: appointmentIcon,
            path: '/branch/appointments',
        },
    ];

    // Helper: Find parent id for current route
    const findParentIdByPath = (pathname: string): string | null => {
        for (const item of navigationData) {
            if (item.hasSubmenu && item.subItems) {
                if (item.subItems.some(sub => {
                    if (sub.path) {
                        // Check for exact match or if the current path starts with the subitem path (for dynamic routes)
                        return pathname === sub.path || pathname.startsWith(sub.path + '/');
                    }
                    return false;
                })) {
                    return item.id;
                }
            }
        }
        return null;
    };

    // Set expandedItems based on current route
    const [expandedItems, setExpandedItems] = useState<string[]>(() => {
        const parentId = findParentIdByPath(location.pathname);
        return parentId ? [parentId] : [];
    });

    useEffect(() => {
        const parentId = findParentIdByPath(location.pathname);
        setExpandedItems(parentId ? [parentId] : []);
    }, [location.pathname]);

    // Only allow one expanded at a time
    const toggleExpanded = (itemId: string) => {
        setExpandedItems(prev => (prev[0] === itemId ? [] : [itemId]));
    };

    const handleItemClick = (item: NavItem) => {
        if (item.hasSubmenu) {
            toggleExpanded(item.id);
        } else if (item.path) {
            navigate(item.path);
        }
    };

    // Highlight active item or subitem
    const isItemActive = (item: NavItem): boolean => {
        if (item.path) {
            if (item.path === "/branch" || item.path === "/branch/") {
                return location.pathname === item.path
            }
            // Check for exact match or if the current path starts with the item path (for dynamic routes)
            return location.pathname === item.path || location.pathname.startsWith(item.path);
        }
        if (item.hasSubmenu && item.subItems) {
            return item.subItems.some(sub => {
                if (sub.path) {
                    // Check for exact match or if the current path starts with the subitem path (for dynamic routes)
                    return location.pathname === sub.path || location.pathname.startsWith(sub.path);
                }
                return false;
            });
        }
        return false;
    };

    const renderNavItem = (item: NavItem, level: number = 0) => {
        const isExpanded = expandedItems.includes(item.id);
        const isActive = isItemActive(item);
        const hasSubmenu = item.hasSubmenu && item.subItems;
        const isSubmenuItem = level > 0;

        return (
            <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                    delay: 0.2 + (level * 0.05),
                    duration: 0.3
                }}
            >
                <button
                    className={`
                        flex items-center w-full justify-between rounded-[16px] px-4 py-3 duration-300 transform cursor-pointer
                        ${level > 0 ? 'ml-4' : ''}
                        ${isActive && !(item.hasSubmenu && item.subItems) ? (isSubmenuItem ? 'bg-primary/40 text-black' : 'bg-primary text-white') : 'text-gray-700'}
                        ${level === 0 ? 'border-l-4 border-transparent' : ''}
                    `}
                    onClick={() => handleItemClick(item)}
                >
                    <div className="flex items-center space-x-3">
                        {item.icon && (
                            <img
                                src={item.icon}
                                alt={item.title}
                                className={`w-5 h-5 ${isActive && !(item.hasSubmenu && item.subItems)
                                    ? 'filter brightness-0 invert'
                                    : ''
                                    }`}
                            />
                        )}
                        <span className="font-normal text-sm">{item.title}</span>
                    </div>
                    {hasSubmenu && (
                        <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MdChevronRight
                                size={16}
                                className={isActive ? 'text-white' : 'text-gray-500'}
                            />
                        </motion.div>
                    )}
                </button>

                {hasSubmenu && (
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden text-sm bg-gray-100"
                            >
                                {item.subItems?.map((subItem) => renderNavItem(subItem, level + 1))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </motion.div>
        );
    };

    return (
        <motion.div
            key={isOpen ? 'open' : 'closed'}
            initial={{ width: 0, opacity: 0 }}
            animate={{
                width: isOpen ? 280 : 0,
                opacity: isOpen ? 1 : 0
            }}
            transition={{
                duration: 0.3,
                ease: "easeInOut"
            }}
            className="h-full bg-white overflow-hidden"
            style={{ minWidth: isOpen ? 280 : 0, maxWidth: isOpen ? 280 : 0 }}
        >
            <div className="flex flex-col shadow-lg overflow-hidden h-full">
                {/* User Profile Section */}
                <motion.div
                    key={`profile-${isOpen}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="px-3 py-4 flex items-center justify-between relative"
                >

                    <img src={Constants.APP_LOGO} alt="logo" className="max-w-[159px] mx-auto w-full" />

                    <button
                        onClick={toggleSidebar}
                        className={`${!sidebarOpen && 'hidden'} absolute right-4 top-4 text-gray-600 hover:text-gray-900 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors p-2`}
                    >
                        {sidebarOpen ? <RiMenuFold3Line size={20} /> : <RiMenuUnfold3Line size={20} />}
                    </button>
                </motion.div>

                {/* back to super admin button */}
                {isAdmin && (
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 flex items-center gap-2 mb-1 text-xs border border-secondary py-2 text-secondary w-fit mx-auto font-medium cursor-pointer hover:bg-secondary hover:text-white duration-300 rounded-lg"
                    >
                        <RxExit size={16} />
                        Back to Super Admin
                    </button>
                )}

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto scrollbar-none pt-2 pb-4">
                    <motion.div
                        key={`nav-${isOpen}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -20 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                    >
                        {navigationData.map((item) => renderNavItem(item))}
                    </motion.div>
                </div>

                <div>
                    <motion.div
                        key={`button-${isOpen}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                        className="p-2 border-t border-gray-200 bg-gray-50"
                    >
                        <p className="text-xs font-medium text-center pt-2 text-gray-500">Version: {Constants.WEB_VERSION}</p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;
