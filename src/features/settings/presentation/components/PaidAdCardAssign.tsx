import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import ProfileAvatar from "../../../../general/components/ProfileAvatar";
import type { TeamProps } from "../../../teams/data/teamTypes";
import { db } from "../../../../firebaseConfig";
import type { AppDispatch, RootState } from "../../../../general/redux/store";
import { updateTeam } from "../../../../features/teams/redux/teamSlice";
import { useNavigate } from "react-router";

interface PaidAdCardProps {
    data: TeamProps;
    index: number;
}

const PaidAdCardAssign = ({ data, index }: PaidAdCardProps) => {

    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    const { branchData } = useSelector((state: RootState) => state.user);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        if (!branchData) {
            toast.error("Branch data not found");
            return;
        }

        try {
            setLoading(true);

            const newValue = !data.allowPaidAds;

            // Update Firestore executive document
            const executiveRef = doc(db, "branches", branchData.id, "executives", data.id);
            await updateDoc(executiveRef, { allowPaidAds: newValue });

            // Update local Redux cache
            dispatch(updateTeam({
                branchId: branchData.id,
                team: {
                    ...data,
                    allowPaidAds: newValue,
                },
            }));

            toast.success(`Paid ads ${newValue ? "enabled" : "disabled"} for ${data.name}`);

        } catch (error: any) {
            console.error("Error updating paid ads setting:", error);
            toast.error(error?.message || "Failed to update paid ads setting");
        } finally {
            setLoading(false);
        }
    };

    const handleViewExecutive = () => {
        navigate(`/branch/admission-counsellors/${data.id}`);
    }

    return (
        <motion.div
            key={data.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            style={{
                boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
            }}
            className="bg-white rounded-lg p-4 flex items-center gap-4"
        >
            {/* Profile Picture */}
            <div className="flex-shrink-0 px-4">
                <ProfileAvatar
                    name={data.name}
                    imageUrl={data.image}
                    size="lg"
                    className=""
                    bgColor="bg-secondary"
                />
            </div>

            {/* User Details */}
            <div className="flex-1 min-w-0">
                <div className="space-y-1">
                    <div className="flex text-sm text-gray-700">
                        <span className="w-36 font-normal text-gray-500">Name</span>
                        <span className="mr-2">:</span>
                        <span className="font-normal text-black">{data.name}</span>
                    </div>

                    <div className="flex text-sm text-gray-700">
                        <span className="w-36 font-normal text-gray-500">Phone Number</span>
                        <span className="mr-2">:</span>
                        <span className="font-normal text-black">{data.phoneNumber}</span>
                    </div>

                    <div className="flex text-sm text-gray-700">
                        <span className="w-36 font-normal text-gray-500">Email</span>
                        <span className="mr-2">:</span>
                        <span className="font-normal text-black">{data.email}</span>
                    </div>

                    <div className="flex text-sm text-gray-700">
                        <span className="w-36 font-normal text-gray-500">Employee ID</span>
                        <span className="mr-2">:</span>
                        <span className="font-normal text-black">{data.employeeId}</span>
                    </div>
                </div>
            </div>

            {/* View Button and Enable Toggle */}
            <div className="flex-shrink-0 flex items-center gap-4">
                {/* View Button */}
                <button onClick={handleViewExecutive} className="px-4 py-2 hover:bg-primary/10 duration-300 flex items-center gap-2 border border-gray-300 rounded-lg text-gray-600 transition-colors text-sm cursor-pointer font-medium">
                    View
                    <FiArrowRight className="w-4 h-4" />
                </button>

                {/* Enable Toggle */}
                <div className="flex flex-col items-center gap-1">
                    <span className={`text-xs font-medium ${data.allowPaidAds ? 'text-[#0A8316]' : 'text-gray-400'}`}>
                        {data.allowPaidAds ? 'Enable' : 'Disable'}
                    </span>
                    <button
                        onClick={handleToggle}
                        disabled={loading}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${data.allowPaidAds ? 'bg-[#0A8316]' : 'bg-gray-300'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${data.allowPaidAds ? 'translate-x-6' : 'translate-x-0'
                                }`}
                        />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default PaidAdCardAssign;