import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import type { BranchProps } from "../../addBranch/data/branchTypes";
import type { AppDispatch, RootState } from "../../../../general/redux/store";
import { db } from "../../../../firebaseConfig";
import BranchActiveButton from "../../branches/presentation/components/BranchActiveButton";
import BranchEditButton from "../../branches/presentation/components/BranchEditButton";
import { formatPhoneNumber } from "../../../../general/utils/formatPhoneNumber";
import ImageModal from "../../../../general/components/ImageModal";
import ThreeDotLoading from "../../../../general/components/ThreeDotLoading";
import { setBranchId } from "../../../login/redux/authSlice";
import { FiArrowRight } from "react-icons/fi";
import BranchLoginUsers from "../../branchLoginUsers/presentation/BranchLoginUsers";

const BranchDetail = () => {

    const [branch, setBranchData] = useState<BranchProps | null>(null);
    const { branchId } = useParams<{ branchId: string }>();
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const dispatch: AppDispatch = useDispatch();

    const { branches } = useSelector((state: RootState) => state.branches);
    const navigate = useNavigate();

    const data = branch && branches.find((branch: BranchProps) => branch.id === branchId) as BranchProps;

    useEffect(() => {
        if (data) {
            setBranchData(data);
            return;
        }

        const fetchEmployeeData = async () => {
            try {
                setLoading(true);
                if (!branchId) return;
                const branchRef = doc(db, "branches", branchId);
                const branchDoc = await getDoc(branchRef);
                if (branchDoc.exists()) {
                    const branchData = branchDoc.data() as BranchProps;
                    setBranchData(branchData);
                }
            } catch (error) {
                console.error('Error fetching employee data:', error);
                toast.error('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeData();
    }, [data, branchId]);

    const handleViewBranch = () => {
        if (!branch) {
            toast.error('Branch not found');
            return;
        };
        dispatch(setBranchId(branch.id));
        window.open(`/branch`, '_blank');
    };

    if (loading) {
        return (
            <ThreeDotLoading />
        )
    }

    if (!branch) return (
        <div className="flex flex-col gap-5 justify-center items-center h-screen">
            <div className="text-base text-gray-600 font-semibold">No branch found</div>
            <button className="bg-primary text-white px-4 py-2 text-sm rounded-md hover:bg-primary/80 transition-colors" onClick={() => navigate('/branches')}>Go to Branches</button>
        </div>
    );

    return (
        <>
            <div className="min-h-screen">

                <p className="text-base text-black font-semibold mb-4 gap-2 flex items-center">
                    <span onClick={() => navigate('/branches')} className="cursor-pointer hover:text-black/80 transition-colors">Branches</span>
                    <span>/</span>
                    <span>{branch.branchName || ''}</span>
                </p>

                {/* Branch Details Section */}

                <div className="p-4 flex justify-between">
                    {/* Branch Details */}
                    <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex text-sm">
                            <span className="w-40 font-normal text-gray-500">Branch</span>
                            <span className="mr-2">:</span>
                            <span className="font-normal text-black">{branch.branchName}</span>
                        </div>

                        <div className="flex text-sm">
                            <span className="w-40 font-normal text-gray-500">Phone</span>
                            <span className="mr-2">:</span>
                            <span className="font-normal text-black">{formatPhoneNumber(branch.phoneNumber)}</span>
                        </div>

                        <div className="flex text-sm md:col-span-2">
                            <span className="w-40 font-normal text-gray-500">Address</span>
                            <span className="mr-2">:</span>
                            <span className="font-normal text-black">{branch.address}</span>
                        </div>

                        <div className="flex text-sm">
                            <span className="w-40 font-normal text-gray-500">Contact Name</span>
                            <span className="mr-2">:</span>
                            <span className="font-normal text-black">{branch.contactName}</span>
                        </div>

                        <div className="flex text-sm">
                            <span className="w-40 font-normal text-gray-500">Alt. Number</span>
                            <span className="mr-2">:</span>
                            <span className="font-normal text-black">{formatPhoneNumber(branch.alternativeNumber || '')}</span>
                        </div>

                        <div className="flex text-sm">
                            <span className="w-40 font-normal text-gray-500">Bank Name</span>
                            <span className="mr-2">:</span>
                            <span className="font-normal text-black">{branch.bankDetails.bankName}</span>
                        </div>

                        <div className="flex text-sm">
                            <span className="w-40 font-normal text-gray-500">Bank Holder Name</span>
                            <span className="mr-2">:</span>
                            <span className="font-normal text-black">{branch.bankDetails.accountHolderName}</span>
                        </div>

                        <div className="flex text-sm">
                            <span className="w-40 font-normal text-gray-500">Bank Account No</span>
                            <span className="mr-2">:</span>
                            <span className="font-normal text-black">{branch.bankDetails.accountNumber}</span>
                        </div>

                        <div className="flex text-sm">
                            <span className="w-40 font-normal text-gray-500">Bank IFSC Code</span>
                            <span className="mr-2">:</span>
                            <span className="font-normal text-black">{branch.bankDetails.ifscCode}</span>
                        </div>

                        {branch.bankDetails.qrCodeUrl && (
                            <div className="flex text-sm">
                                <span className="w-40 font-normal text-gray-500">Bank QR Code</span>
                                <span className="mr-2">:</span>
                                <span className="font-normal text-black"><img onClick={() => setIsImageModalOpen(true)} src={branch.bankDetails.qrCodeUrl} alt="Bank QR Code" className="w-12 h-12 cursor-pointer object-contain" /></span>
                            </div>
                        )}
                    </div>

                    {/* Right Section - Action Buttons */}
                    <div className="flex-shrink-0 h-fit flex gap-3">

                        {/* View Branch Button */}
                        <button
                            className="px-4 py-4 bg-primary/40 hover:bg-primary hover:text-white text-secondary rounded-lg flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
                            onClick={handleViewBranch}
                        >
                            View Branch
                            <FiArrowRight className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <div className="flex px-3">
                            <BranchEditButton branch={branch} />
                        </div>

                        {/* Branch Enable Toggle */}
                        <BranchActiveButton branch={branch} setBranch={setBranchData} />
                    </div>

                </div>

                <hr className="border-gray-300" />

                {/* Branch Login Users Section */}
                <BranchLoginUsers branch={branch} />

            </div>

            <ImageModal
                isOpen={isImageModalOpen}
                altText="Bank QR Code"
                onClose={() => setIsImageModalOpen(false)}
                imageUrl={branch.bankDetails.qrCodeUrl || ''}
            />
        </>
    )
}

export default BranchDetail
