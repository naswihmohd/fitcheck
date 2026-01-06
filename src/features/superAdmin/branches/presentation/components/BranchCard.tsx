import { motion } from 'framer-motion';
import branchIcon from '../../../../../assets/icons/branch-icon.svg';
import type { BranchProps } from '../../../addBranch/data/branchTypes';
import BranchActiveButton from './BranchActiveButton';
import BranchEditButton from './BranchEditButton';
import { formatPhoneNumber } from '../../../../../general/utils/formatPhoneNumber';
import { useNavigate } from 'react-router';



interface BranchCardProps {
  branch: BranchProps;
  index: number;
}

const BranchCard: React.FC<BranchCardProps> = ({
  branch,
  index,
}) => {

  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/branches/${branch.id}`)}
      transition={{
        duration: 0.5,
        delay: index * 0.1
      }}
      style={{
        boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
      }}
      className="bg-white cursor-pointer rounded-lg p-6 flex items-start gap-6"
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
          <span className="font-normal text-black">{branch.branchName}</span>
        </div>

        <div className="flex text-sm">
          <span className="w-32 font-normal text-gray-500">Phone</span>
          <span className="mr-2">:</span>
          <span className="font-normal text-black">{formatPhoneNumber(branch.phoneNumber)}</span>
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
          <span className="font-normal text-black">{formatPhoneNumber(branch.alternativeNumber || '')}</span>
        </div>

        <div className="flex text-sm">
          <span className="w-32 font-normal text-gray-500">Bank Name</span>
          <span className="mr-2">:</span>
          <span className="font-normal text-black">{branch.bankDetails.bankName}</span>
        </div>

        <div className="flex text-sm">
          <span className="w-32 font-normal text-gray-500">Bank Account No</span>
          <span className="mr-2">:</span>
          <span className="font-normal text-black">{branch.bankDetails.accountNumber}</span>
        </div>
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex-shrink-0 flex items-center my-auto gap-3">
        {/* Delete Icon */}
        {/* <button
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Delete"
        >
          <FiTrash2 className="w-5 h-5" />
        </button> */}

        {/* Edit Icon */}

        <BranchEditButton branch={branch} />
        

        {/* Branch Enable Toggle */}
        <BranchActiveButton branch={branch} />
      </div>
    </motion.div>
  );
};

export default BranchCard;
