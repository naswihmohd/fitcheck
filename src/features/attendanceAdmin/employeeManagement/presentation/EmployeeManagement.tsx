import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { useState, useMemo, useEffect } from 'react';
import MetricsCards from './components/MetricsCards';
import { NavLink, Outlet, useNavigate } from 'react-router';
import ShiftFilterDropdown from './components/ShiftFilterDropdown';

const EmployeeManagement = () => {

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [employmentTypeFilter, setEmploymentTypeFilter] = useState<'all' | 'fullTime' | 'partTime' | 'intern'>('all');
    const navigate = useNavigate();


    // Debounce search query by 1 second
    useEffect(() => {
        const timer = setTimeout(() => {
            const formattedSearchQuery = searchQuery.trim().toLowerCase().replace(/\s+/g, '');
            setDebouncedSearchQuery(formattedSearchQuery);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const tabs = [
        { label: "All Employees", slug: "." },
        { label: "Active Employees", slug: "active" },
        { label: "Inactive Employees", slug: "inactive" },
    ];

    // TODO: Implement Add Employee Modal
    const handleAddEmployee = () => {
        navigate('/attendance/employee-management/add-new-employee');
    };

    // Calculate metrics
    const metrics = useMemo(() => {
        const total = 10;
        const active = 1;
        const inactive = 1;
        const fullTime = 1;
        const partTime = 1;
        const interns = 1;

        return {
            total,
            active,
            inactive,
            fullTime,
            partTime,
            interns,
        };
    }, []);


    return (
        <div className="space-y-6 pb-6">
            <h1 className="text-xl font-bold text-gray-900">
                Employee Management
            </h1>

            {/* Add New Employee Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleAddEmployee}
                    className="px-4 py-3 bg-tertiary text-white rounded-lg hover:bg-tertiary/90 transition-colors duration-300 text-sm font-medium"
                >
                    Add New Employee
                </button>
            </div>

            {/* Metrics Cards */}
            <MetricsCards
                total={metrics.total}
                active={metrics.active}
                inactive={metrics.inactive}
            />

            <hr className="my-4 border-gray-200" />

            {/* Search and Create Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
            >
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search Name or Email or Phone Number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-white outline-none border border-gray-300 rounded-lg"
                    />
                </div>

                <ShiftFilterDropdown
                    setSelectedShiftId={setSelectedShiftId}
                    selectedShiftId={selectedShiftId}
                />
            </motion.div>

            {/* TABS */}
            <div className="flex gap-2 border-b border-gray-200 pt-4">
                {tabs.map(({ label, slug }) => (
                    <NavLink
                        key={slug}
                        to={slug}
                        end={slug === "."}
                        className={({ isActive }) =>
                            `px-4 py-2 text-sm font-medium transition-colors ${isActive
                                ? "text-primary border-b-2 border-primary bg-primary/5"
                                : "text-gray-600 hover:text-gray-900"
                            }`
                        }
                    >
                        {label}
                    </NavLink>
                ))}
            </div>

            <Outlet context={{ searchQuery: debouncedSearchQuery, selectedShiftId, statusFilter, employmentTypeFilter }} />

        </div>
    );
};

export default EmployeeManagement;
