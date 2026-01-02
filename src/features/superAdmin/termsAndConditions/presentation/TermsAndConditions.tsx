import React from 'react';
import { motion } from 'framer-motion';
import { NavLink, Outlet } from 'react-router';

const TermsAndConditions: React.FC = () => {

    const tabs = [
        { label: 'Terms & Conditions', slug: '.' },
        { label: 'Privacy Policy', slug: 'privacy' },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Page Title */}
            <div className="mb-2">
                <h1 className="text-xl font-semibold text-gray-900 mb-6">
                    Policy Management
                </h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-y-auto mb-4">
                {tabs.map(({ label, slug }) => (
                    <NavLink
                        key={slug}
                        to={slug}
                        end={slug === '.'}
                        className={({ isActive }) =>
                            `flex h-fit px-4 py-2 shadow text-sm font-medium border border-primary rounded-full ${isActive
                                ? 'duration-300 bg-primary text-white '
                                : 'text-primary hover:text-gray-900 bg-white'
                            }`
                        }
                    >
                        {label}
                    </NavLink>
                ))}
            </div>

            <Outlet />
        </motion.div>
    );
};

export default TermsAndConditions;

