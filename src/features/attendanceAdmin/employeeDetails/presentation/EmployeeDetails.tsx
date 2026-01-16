import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, NavLink, Outlet } from 'react-router';
import { FiEdit } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../general/redux/store';
import type { EmployeeProps } from '../../employeeManagement/data/employeeType';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import toast from 'react-hot-toast';
import ProfileAvatar from '../../../../general/components/ProfileAvatar';
import EmployeeActiveButton from '../../employeeManagement/presentation/components/EmployeeActiveButton';
import ThreeDotLoading from '../../../../general/components/ThreeDotLoading';


const EmployeeDetails = () => {
    const { employeeId } = useParams<{ employeeId?: string }>();
    const navigate = useNavigate();
    const [employeeData, setEmployeeData] = useState<EmployeeProps | null>(null);
    const { companyId, branchId } = useSelector((state: RootState) => state.user);
    const [loading, setLoading] = useState(false);
    const dispatch: AppDispatch = useDispatch();

    const { branchEmployees } = useSelector((state: RootState) => state.branchEmployees);
    const currentBranchEmployees = branchId && branchEmployees[branchId]?.teams ? branchEmployees[branchId].teams : [];
    const currentEmployee = currentBranchEmployees.find((employee: EmployeeProps) => employee.id === employeeId) || null;

    useEffect(() => {
        if (currentEmployee) {
            setEmployeeData(currentEmployee);
            return;
        }

        const fetchEmployeeData = async () => {
            if (!companyId || !employeeId) return;
            try {
                setLoading(true);
                // Fetch from Firestore
                const employeeRef = doc(db, "companies", companyId, "employees", employeeId);
                const employeeDoc = await getDoc(employeeRef);
                if (employeeDoc.exists()) {
                    const employee = {
                        id: employeeDoc.id,
                        ...employeeDoc.data(),
                    } as EmployeeProps;
                    setEmployeeData(employee);
                } else {
                    toast.error('Employee not found');
                    navigate('/attendance/employee-management');
                }
            } catch (error) {
                console.error('Error fetching employee data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeData();
    }, [currentEmployee, companyId, employeeId, dispatch, navigate]);

    const handleEdit = () => {
        navigate(`/attendance/employee-management/add-new-employee/${employeeId}`);
    };


    const tabs = [
        { label: "Live Attendance", slug: "." },
        { label: "Attendance", slug: "attendance" },
        { label: "Salary", slug: "salary" },
        { label: "Employee Info", slug: "employee-info" },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <ThreeDotLoading />
            </div>
        );
    }

    if (!employeeData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Employee not found</div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6 pb-6">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between"
                >
                    {/* Employee Details */}
                    <div className="">
                        <div className="flex items-center gap-4 mb-4">
                            <ProfileAvatar
                                name={employeeData.basicDetails.fullName}
                                imageUrl={null}
                                size="md"
                                bgColor="bg-primary"
                            />
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {employeeData.basicDetails.fullName}
                                </h2>
                                <p className="text-sm text-gray-500">Employee ID: {employeeData.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        {/* Active Toggle */}
                        <EmployeeActiveButton employee={employeeData} setEmployee={setEmployeeData} />

                        {/* Edit Icon */}
                        <button
                            onClick={handleEdit}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                        >
                            <FiEdit className="w-5 h-5" />
                        </button>
                    </div>
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

                <Outlet context={{ employeeData }} />
            </div>
        </>
    );
};

export default EmployeeDetails;
