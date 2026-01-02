import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import branchIcon from '../../../../../assets/icons/branch-icon.svg';

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

interface BranchCardProps {
  branch: Branch;
  index: number;
  onEdit?: (branch: Branch) => void;
  onDelete?: (branch: Branch) => void;
  onToggle?: (branch: Branch) => void;
}

const BranchCard: React.FC<BranchCardProps> = ({
  branch,
  index,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const handleToggle = () => {
    onToggle?.(branch);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1
      }}
      style={{
        boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
      }}
      className="bg-white rounded-lg p-6 flex items-start gap-6"
    >
      {/* Left Icon - Building Icon */}
      <div className="flex-shrink-0 px-5 my-auto">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
          <img src={branchIcon} alt="branch-icon" />
        </div>
      </div>

      {/* Middle Section - Branch Details */}
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex text-sm">
          <span className="w-32 font-normal text-gray-500">Branch</span>
          <span className="mr-2">:</span>
          <span className="font-normal text-black">{branch.branch}</span>
        </div>

        <div className="flex text-sm">
          <span className="w-32 font-normal text-gray-500">Phone</span>
          <span className="mr-2">:</span>
          <span className="font-normal text-black">{branch.phone}</span>
        </div>

        <div className="flex text-sm md:col-span-2">
          <span className="w-32 font-normal text-gray-500">Address</span>
          <span className="mr-2">:</span>
          <span className="font-normal text-black">{branch.address}</span>
        </div>

        <div className="flex text-sm">
          <span className="w-32 font-normal text-gray-500">Contact Name</span>
          <span className="mr-2">:</span>
          <span className="font-normal text-black">{branch.contactName}</span>
        </div>

        <div className="flex text-sm">
          <span className="w-32 font-normal text-gray-500">Alt. Number</span>
          <span className="mr-2">:</span>
          <span className="font-normal text-black">{branch.altNumber}</span>
        </div>

        <div className="flex text-sm">
          <span className="w-32 font-normal text-gray-500">Std No</span>
          <span className="mr-2">:</span>
          <span className="font-normal text-black">{branch.stdNo}</span>
        </div>
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex-shrink-0 flex items-center my-auto gap-3">
        {/* Delete Icon */}
        <button
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Delete"
          onClick={() => onDelete?.(branch)}
        >
          <FiTrash2 className="w-5 h-5" />
        </button>

        {/* Edit Icon */}
        <button
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          title="Edit"
          onClick={() => onEdit?.(branch)}
        >
          <FiEdit2 className="w-5 h-5" />
        </button>

        {/* Enable Toggle */}
        <div className="flex flex-col items-center gap-1">
          <span className={`text-xs font-medium ${branch.isActive ? 'text-[#0A8316]' : 'text-gray-400'}`}>
            Enable
          </span>
          <button
            onClick={handleToggle}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
              branch.isActive ? 'bg-[#0A8316]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                branch.isActive ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BranchCard;
