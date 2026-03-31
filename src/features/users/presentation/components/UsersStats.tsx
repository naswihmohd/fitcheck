import { motion } from 'framer-motion'
import { FiUsers, FiUserCheck, FiShield, FiUserX } from 'react-icons/fi'

const UsersStats = () => {

    const totalUsers = 0;
    const activeUsers = 0;
    const managerAndAdmins = 0;
    const inactiveUsers = 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        >
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Total Users</p>
                    <FiUsers className="size-5 text-primary" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Active Users</p>
                    <FiUserCheck className="size-5 text-emerald-600" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{activeUsers}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Admins & Managers</p>
                    <FiShield className="size-5 text-violet-600" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{managerAndAdmins}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Inactive Users</p>
                    <FiUserX className="size-5 text-rose-600" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{inactiveUsers}</p>
            </div>
        </motion.div>
    )
}

export default UsersStats
