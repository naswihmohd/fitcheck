import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { IoMdAddCircle } from 'react-icons/io';
import BranchCard from './components/BranchCard';

interface Branch {
  id: string;
  branch: string;
  phone: string;
  address: string;
  contactName: string;
  altNumber: string;
  stdNo: string;
  isActive: boolean;
}

// Dummy data matching the photo
const dummyBranches: Branch[] = [
  {
    id: '1',
    branch: 'Kasargod',
    phone: '0987654321',
    address: 'dsfjgfsdgh kdjshgjksdhgjkhs sdkjhgkjsdhgjkhdg',
    contactName: 'Sam',
    altNumber: '+91 9876543210',
    stdNo: '5465',
    isActive: true,
  },
  {
    id: '2',
    branch: 'Kannur',
    phone: '0987654322',
    address: '123 Main Street, City Center',
    contactName: 'John',
    altNumber: '+91 9876543211',
    stdNo: '5466',
    isActive: true,
  },
  {
    id: '3',
    branch: 'Kozhikode',
    phone: '0987654323',
    address: '456 Park Avenue, Downtown Area',
    contactName: 'Mary',
    altNumber: '+91 9876543212',
    stdNo: '5467',
    isActive: true,
  },
  {
    id: '4',
    branch: 'Malappuram',
    phone: '0987654324',
    address: '789 Ocean Road, Beachside',
    contactName: 'David',
    altNumber: '+91 9876543213',
    stdNo: '5468',
    isActive: true,
  },
];

function Branches() {
  const [searchQuery, setSearchQuery] = useState('');
  const [branches] = useState<Branch[]>(dummyBranches);

  // Filter branches based on search query
  const filteredBranches = branches.filter((branch) =>
    branch.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateBranch = () => {
    // TODO: Implement create branch functionality
    console.log('Create branch clicked');
  };

  const handleEdit = (branch: Branch) => {
    // TODO: Implement edit branch functionality
    console.log('Edit branch:', branch);
  };

  const handleDelete = (branch: Branch) => {
    // TODO: Implement delete branch functionality
    console.log('Delete branch:', branch);
  };

  const handleToggle = (branch: Branch) => {
    // TODO: Implement toggle functionality
    console.log('Toggle branch:', branch);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap justify-between items-center gap-4"
      >
        <h1 className="text-2xl font-bold text-gray-900">
          Branches
        </h1>
      </motion.div>

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
            placeholder="Search By Name or name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Create Branch Button */}
        <button
          onClick={handleCreateBranch}
          className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
        >
          <IoMdAddCircle className="w-5 h-5" />
          Create Branch
        </button>
      </motion.div>

      {/* Branch Cards */}
      <div className="space-y-4">
        {filteredBranches.length > 0 ? (
          filteredBranches.map((branch, index) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-500"
          >
            No branches found matching your search.
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Branches;
