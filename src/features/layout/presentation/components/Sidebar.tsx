import { useLocation, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { RiMenuFold3Line, RiMenuUnfold3Line } from 'react-icons/ri';
import { Constants } from '../../../../general/constants/constants';
import { navigationItems, type NavItem } from './navItems';
import LogoutButton from '../../../login/presentation/components/LogoutButton';

interface SidebarProps {
    isOpen?: boolean;
    toggleSidebar: () => void;
    sidebarOpen: boolean;
}

const Sidebar = ({ isOpen = true, toggleSidebar, sidebarOpen }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    const isItemActive = (item: NavItem): boolean => {
        if (item.path === '/') {
            return location.pathname === item.path;
        }
        return location.pathname === item.path || location.pathname.startsWith(item.path);
    };

    return (
        <motion.div
            key={isOpen ? 'open' : 'closed'}
            initial={{ width: 0, opacity: 0 }}
            animate={{
                width: isOpen ? 280 : 0,
                opacity: isOpen ? 1 : 0,
            }}
            transition={{
                duration: 0.3,
                ease: 'easeInOut',
            }}
            className="h-full bg-white overflow-hidden"
            style={{ minWidth: isOpen ? 280 : 0, maxWidth: isOpen ? 280 : 0 }}
        >
            <div className="flex flex-col shadow-lg overflow-hidden h-full">
                <motion.div
                    key={`profile-${isOpen}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="px-3 py-4 flex items-center justify-between relative"
                >
                    <div className="pr-12">
                        <p className="text-sm font-bold text-gray-900">{Constants.APP_NAME}</p>
                        <p className="text-[11px] text-gray-500">Company accounts</p>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className={`${!sidebarOpen && 'hidden'} absolute right-4 top-4 text-gray-600 hover:text-gray-900 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors p-2`}
                    >
                        {sidebarOpen ? <RiMenuFold3Line size={20} /> : <RiMenuUnfold3Line size={20} />}
                    </button>
                </motion.div>

                <div className="flex-1 overflow-y-auto scrollbar-none pt-2 pb-4">
                    <motion.div
                        key={`nav-${isOpen}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -20 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="space-y-1 px-2"
                    >
                        {navigationItems.map((item, index) => {
                            const isActive = isItemActive(item);
                            return (
                                <motion.button
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + index * 0.05, duration: 0.3 }}
                                    className={`
                                        flex items-center w-full rounded-[16px] px-4 py-3 duration-300 transform cursor-pointer
                                        ${isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}
                                    `}
                                    onClick={() => navigate(item.path)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <item.icon
                                            className={`w-5 h-5 ${isActive ? 'text-white' : 'text-primary'}`}
                                            size={20}
                                        />
                                        <span className="font-normal text-sm">{item.title}</span>
                                    </div>
                                </motion.button>
                            );
                        })}
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
                        <LogoutButton />
                        <p className="text-xs font-medium text-center pt-2 text-gray-500">
                            Version: {Constants.WEB_VERSION}
                        </p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;
