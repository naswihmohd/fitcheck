import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { NavLink, Outlet, useNavigate } from 'react-router';

function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const navigate = useNavigate();

  // Debounce search query by 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      const formattedSearchQuery = searchQuery.trim().toLowerCase().replace(/\s+/g, '');
      setDebouncedSearchQuery(formattedSearchQuery);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);


  const activeCount = 10;
  const inactiveCount = 10;
  const trendingCount = 10;

  const tabs = [
    { label: 'All Products', to: '.' },
    { label: 'Active Products', to: 'active' },
    { label: 'Inactive Products', to: 'inactive' },
    { label: 'Trending Products', to: 'trending' },
  ];

  const handleAddProduct = () => {
    navigate('/product-management/add-product');
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <h1 className="text-xl font-bold text-gray-900">Product Management</h1>

        <button onClick={handleAddProduct} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium">
          <FiPlus className="w-5 h-5" />
          Add Product
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-lg border border-primary/10 p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">24</p>
        </div>
        <div className="bg-white rounded-lg border border-primary/10 p-4 shadow-sm">
          <p className="text-sm text-gray-600">Active Products</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-primary/10 p-4 shadow-sm">
          <p className="text-sm text-gray-600">Inactive Products</p>
          <p className="text-2xl font-bold text-gray-500 mt-1">{inactiveCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-orange-100 p-4 shadow-sm">
          <p className="text-sm text-gray-600">Trending Products</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{trendingCount}</p>
        </div>
      </motion.div>

      {/* Search and Filter Section */}

      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search By Name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-lg outline-none"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-x-0 gap-y-2 flex-wrap border-b border-gray-200">
        {tabs.map(({ label, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '.'}
            className={({ isActive }) => `px-3 py-2 font-medium text-sm cursor-pointer transition-colors ${isActive
              ? 'border-b-4 border-primary text-primary bg-primary/5 duration-300'
              : 'text-black hover:bg-primary/5'
              }`}
          >
            {label}
          </NavLink>
        ))}
      </div>

      <Outlet context={{ searchQuery: debouncedSearchQuery }} />
    </div>
  );
}

export default Products;
