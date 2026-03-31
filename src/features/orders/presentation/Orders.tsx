import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { NavLink, Outlet } from 'react-router';

function Orders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      const formatted = searchQuery.trim().toLowerCase().replace(/\s+/g, '');
      setDebouncedSearchQuery(formatted);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const tabs = [
    { label: 'All Orders', to: '.', count: 0 },
    { label: 'Pending', to: 'pending', count: 0 },
    { label: 'Shipped', to: 'shipped', count: 0 },
    { label: 'Delivered', to: 'delivered', count: 0 },
    { label: 'Cancelled', to: 'cancelled', count: 0 },
    { label: 'Replaced', to: 'replaced', count: 0 },
    { label: 'Returned', to: 'returned', count: 0 },
    { label: 'Packed', to: 'packed', count: 0 },
    { label: 'Accepted', to: 'accepted', count: 0 },
    { label: 'Rejected', to: 'rejected', count: 0 },
  ];


  const kpiCards = [
    { label: 'Total orders', value: String(0) },
    { label: 'Pending', value: String(0), accent: 'text-amber-600' },
    { label: 'Shipped', value: String(0), accent: 'text-violet-600' },
    { label: 'Delivered', value: String(0), accent: 'text-emerald-600' },
  ] as const;

  return (
    <div className="space-y-6 pb-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <h1 className="text-xl font-bold text-gray-900">Order Management</h1>

        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
        >
          <FiPlus className="w-5 h-5" />
          Create Order
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-4 gap-4"
      >
        {kpiCards.map((card, idx) => (
          <div
            key={card.label}
            className={`bg-white rounded-lg border border-primary/10 p-4 shadow-sm ${idx === 0 ? '' : ''}`}
          >
            <p className="text-sm text-gray-600">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${'accent' in card ? card.accent : 'text-gray-900'}`}>
              {card.value}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search By Order ID or customer"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-lg outline-none"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-x-0 gap-y-2 flex-wrap border-b border-gray-200">
        {tabs.map(({ label, to, count }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '.'}
            className={({ isActive }) => `px-3 py-2 font-medium text-sm cursor-pointer transition-colors ${isActive
              ? 'border-b-4 border-primary text-primary bg-primary/5 duration-300'
              : 'text-black hover:bg-primary/5'
              }`}
          >
            <div className="flex items-center gap-2">
              {label}
              <span className="inline-flex items-center gap-2">
                ({count})
              </span>
            </div>
          </NavLink>
        ))}
      </div>

      {/* Orders Table */}
      <Outlet context={{ searchQuery: debouncedSearchQuery }} />
    </div>
  );
}

export default Orders;
