import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { MdChevronRight } from 'react-icons/md';
import { RiMenuFold3Line, RiMenuUnfold3Line } from 'react-icons/ri';


import dashboardIcon from '../../../../../assets/images/branch-admin-sidebar-icons/dashboard-icon.svg'
import branchesIcon from '../../../../../assets/images/super-admin-sidebar-icons/branches-icon.svg'
import feeCollectionIcon from '../../../../../assets/images/super-admin-sidebar-icons/fee-collection-icon.svg'
import newAdmissionIcon from '../../../../../assets/images/super-admin-sidebar-icons/new-adminssion-icon.svg'
import notificationIcon from '../../../../../assets/images/super-admin-sidebar-icons/notification-icon.svg'
import reportIcon from '../../../../../assets/images/super-admin-sidebar-icons/report-icon.svg'
import settingsIcon from '../../../../../assets/images/super-admin-sidebar-icons/settings-icon.svg'
import termsIcon from '../../../../../assets/images/super-admin-sidebar-icons/terms-icon.png'

import { Constants } from '../../../../../general/constants/constants';

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

const SuperAdminSidebar = ({ isOpen = true, toggleSidebar, sidebarOpen }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    const navigationData: NavItem[] = [
        {
            id: 'dashboard',
            title: 'Dashboard',
            icon: dashboardIcon,
            path: '/',
        },
        {
            id: 'new-admission',
            title: 'New Admission',
            icon: newAdmissionIcon,
            path: '/new-admission',
        },
        {
            id: 'branches',
            title: 'Branches',
            icon: branchesIcon,
            path: '/branches',
        },
        {
            id: 'notice-board',
            title: 'Notice Board',
            icon: notificationIcon,
            path: '/notice-board',
        },
        {
            id: 'terms-condition',
            title: 'Terms & Condition',
            icon: termsIcon,
            path: '/terms-condition',
        },
        {
            id: 'reports-analytics',
            title: 'Reports & Analytics',
            icon: reportIcon,
            path: '/reports-analytics',
        },
        {
            id: 'fee-collection',
            title: 'Fee Collection',
            icon: feeCollectionIcon,
            path: '/fee-collection',
        },
        {
            id: 'holidays',
            title: 'Holidays',
            icon: settingsIcon,
            path: '/holidays',
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
            if (item.path === "/") {
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

export default SuperAdminSidebar;
