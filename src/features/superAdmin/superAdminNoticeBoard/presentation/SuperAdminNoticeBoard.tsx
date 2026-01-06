import { motion } from 'framer-motion';
import { NavLink, Outlet } from 'react-router';

const SuperAdminNoticeBoard = () => {

    const tabs = [
        { label: 'Students', slug: '.' },
        { label: 'Tutor', slug: 'tutor' },
        { label: 'Sales Executive', slug: 'sales-executive' },
        { label: 'Placement Executive', slug: 'placement-executive' },
        { label: 'Branches', slug: 'branches' },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
        >
            {/* Header */}
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notice Board</h2>

                {/* Tabs */}
                <div className="flex gap-2 overflow-y-auto pt-4">
                    {tabs.map(({ label, slug }) => (
                        <NavLink
                            key={slug}
                            to={slug}
                            end={slug === '.'}
                            className={({ isActive }) =>
                                `flex h-fit px-4 py-2 text-sm font-medium rounded-full ${isActive
                                    ? 'duration-300 border border-primary bg-white text-primary'
                                    : 'text-black border border-white hover:bg-primary/10 bg-white'
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </div>
            </div>
            <Outlet />

        </motion.div >
    )
}

export default SuperAdminNoticeBoard
