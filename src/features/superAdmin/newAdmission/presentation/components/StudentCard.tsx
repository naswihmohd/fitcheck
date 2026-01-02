import { motion } from 'framer-motion'
import ProfileAvatar from '../../../../../general/components/ProfileAvatar'
import { formatPhoneNumber } from '../../../../../general/utils/formatPhoneNumber'

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

const StudentCard = ({ data, index }: { data: StudentData; index: number }) => {
  const handleAssignToBranch = () => {
    // TODO: Implement assign to branch functionality
    console.log('Assign to branch:', data.id)
  }

  const handleViewFile = () => {
    if (data.fileUrl) {
      // TODO: Implement file view functionality
      window.open(data.fileUrl, '_blank')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      style={{ boxShadow: '0px 0.92px 2.75px 0px #0051AF1A' }}
      className="bg-white rounded-lg p-4 flex items-start gap-4"
    >
      {/* Profile Avatar */}
      <div className="flex-shrink-0 px-4">
        <ProfileAvatar
          name={data.name}
          imageUrl={data.imageUrl}
          size="lg"
          bgColor="bg-secondary"
        />
      </div>

      {/* Student Details */}
      <div className="flex-1 min-w-0">
        <div className="space-y-1">
          <div className="flex text-sm text-gray-700">
            <span className="w-36 font-normal text-gray-500">Name</span>
            <span className="mr-2">:</span>
            <span className="font-normal text-black truncate">{data.name}</span>
          </div>
          <div className="flex text-sm text-gray-700">
            <span className="w-36 font-normal text-gray-500">Mail</span>
            <span className="mr-2">:</span>
            <span className="font-normal text-black truncate">{data.email}</span>
          </div>
          <div className="flex text-sm text-gray-700">
            <span className="w-36 font-normal text-gray-500">Phone</span>
            <span className="mr-2">:</span>
            <span className="font-normal text-black">{formatPhoneNumber(data.phone)}</span>
          </div>
          <div className="flex text-sm text-gray-700">
            <span className="w-36 font-normal text-gray-500">Branch</span>
            <span className="mr-2">:</span>
            <span className="font-normal text-black">{data.branch}</span>
          </div>
          <div className="flex text-sm text-gray-700">
            <span className="w-36 font-normal text-gray-500">Course</span>
            <span className="mr-2">:</span>
            <span className="font-normal text-black">{data.course}</span>
          </div>
          <div className="flex text-sm text-gray-700">
            <span className="w-36 font-normal text-gray-500">Initial Pay.</span>
            <span className="mr-2">:</span>
            <span className="font-normal text-black">
              ₹{data.initialPay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex text-sm text-gray-700">
            <span className="w-36 font-normal text-gray-500">Note</span>
            <span className="mr-2">:</span>
            <span className="font-normal text-black">{data.note}</span>
          </div>
          <div className="flex text-sm text-gray-700">
            <span className="w-36 font-normal text-gray-500">Guardian Name</span>
            <span className="mr-2">:</span>
            <span className="font-normal text-black">{data.guardianName}</span>
          </div>
          <div className="flex text-sm text-gray-700">
            <span className="w-36 font-normal text-gray-500">Address</span>
            <span className="mr-2">:</span>
            <span className="font-normal text-black break-words">{data.address}</span>
          </div>
          <div className="flex text-sm text-gray-700">
            <span className="w-36 font-normal text-gray-500">Alt. Number</span>
            <span className="mr-2">:</span>
            <span className="font-normal text-black">{formatPhoneNumber(data.altNumber)}</span>
          </div>
          <div className="flex text-sm text-gray-700">
            <span className="w-36 font-normal text-gray-500">Lead Source</span>
            <span className="mr-2">:</span>
            <span className="font-normal text-black">{data.leadSource}</span>
          </div>
          <div className="flex text-sm text-gray-700">
            <span className="w-36 font-normal text-gray-500">File</span>
            <span className="mr-2">:</span>
            {data.fileUrl ? (
              <button
                onClick={handleViewFile}
                className="font-normal text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                View
              </button>
            ) : (
              <span className="font-normal text-gray-400">-</span>
            )}
          </div>
        </div>
      </div>

      {/* Assign to Branch Button */}
      <div className="flex-shrink-0 my-auto">
        <button
          onClick={handleAssignToBranch}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-300 text-sm font-medium whitespace-nowrap"
        >
          Assign to Branch
        </button>
      </div>
    </motion.div>
  )
}

export default StudentCard

