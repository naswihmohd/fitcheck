import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiCalendar, FiFilter, FiChevronDown } from 'react-icons/fi'
import { NavLink, Outlet } from 'react-router'

type StudentData = {
    id: string
    name: string
    email: string
    phone: string
    branch: string
    course: string
    initialPay: number
    note: string
    guardianName: string
    address: string
    altNumber: string
    leadSource: string
    fileUrl?: string
    imageUrl?: string | null
}

// Dummy data
export const dummyStudents: StudentData[] = [
    {
        id: '1',
        name: 'Rengoku',
        email: 'samdple12@gmail.com',
        phone: '0987654321',
        branch: 'Kasargod',
        course: 'Digital Marketing',
        initialPay: 3000,
        note: 'Digital Marketing student, ples check',
        guardianName: 'Sam',
        address: 'dsfjgfsdgh kdjshgjksdhgjkhs sdkjhgkjsdhgjkhdg',
        altNumber: '+91 9876543210',
        leadSource: 'Referral',
        fileUrl: '#',
    },
    {
        id: '2',
        name: 'Rengoku',
        email: 'samdple12@gmail.com',
        phone: '0987654321',
        branch: 'Kasargod',
        course: 'Digital Marketing',
        initialPay: 3000,
        note: 'Digital Marketing student, ples check',
        guardianName: 'Sam',
        address: 'dsfjgfsdgh kdjshgjksdhgjkhs sdkjhgkjsdhgjkhdg',
        altNumber: '+91 9876543210',
        leadSource: 'Referral',
        fileUrl: '#',
    },
]

const NewAdmission = () => {
    const [searchQuery, setSearchQuery] = useState('')

    const tabs = [
        { label: 'Pending', slug: '.' },
        { label: 'Completed', slug: 'completed' },
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">New Admission</h2>

                <div className="flex items-center gap-4 justify-between">
                    {/* Search Bar */}
                    <div className="relative w-full max-w-xl mb-4">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search By Name or name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 text-sm bg-white outline-none"
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 flex items-center gap-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
                            <FiCalendar className="w-4 h-4" />
                            This Month
                        </button>
                        <button className="px-4 py-2 flex items-center gap-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
                            <FiFilter className="w-4 h-4" />
                            All Courses
                            <FiChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-y-auto pt-4">
                    {tabs.map(({ label, slug }) => (
                        <NavLink
                            key={slug}
                            to={slug}
                            end={slug === '.'}
                            className={({ isActive }) =>
                                `flex h-fit px-4 py-2 shadow text-sm font-medium rounded-full ${isActive
                                    ? 'duration-300 bg-primary text-white'
                                    : 'text-gray-600 hover:text-gray-900 border bg-white'
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

export default NewAdmission

