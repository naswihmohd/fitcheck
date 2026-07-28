import { useLocation, useNavigate } from 'react-router';
import { navigationItems, type NavItem } from './navItems';

const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isItemActive = (item: NavItem): boolean => {
        if (item.path === '/') {
            return location.pathname === item.path;
        }
        return location.pathname === item.path || location.pathname.startsWith(item.path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-3 safe-area-pb pointer-events-none">
            <div className="pointer-events-auto flex items-center justify-around h-16 px-2 rounded-full bg-white border border-gray-200 shadow-lg">
                {navigationItems.map((item) => {
                    const isActive = isItemActive(item);
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`
                                flex flex-col items-center justify-center flex-1 h-full gap-0.5
                                transition-colors duration-200 cursor-pointer rounded-full
                                ${isActive ? 'text-primary' : 'text-gray-500'}
                            `}
                        >
                            <item.icon
                                className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-500'}`}
                                size={22}
                            />
                            <span className={`text-[11px] font-medium ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                                {item.title}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
