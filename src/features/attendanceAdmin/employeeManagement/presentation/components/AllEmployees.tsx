
import { motion } from 'framer-motion'
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../../general/redux/store';
import { fetchBranchEmployees } from '../../redux/employeesSlice';
import { useOutletContext } from 'react-router';
import EmployeeCard from './EmployeeCard';
import ThreeDotLoading from '../../../../../general/components/ThreeDotLoading';

const AllEmployees = () => {

    const { searchQuery, statusFilter, employmentTypeFilter } = useOutletContext<{ searchQuery: string | null, statusFilter: 'all' | 'active' | 'inactive' | null, employmentTypeFilter: 'all' | 'fullTime' | 'partTime' | 'intern' | null }>();
    const dispatch:AppDispatch = useDispatch();
    const { branchId } = useSelector((state: RootState) => state.user);
    const { branchEmployees, error, loading } = useSelector((state: RootState) => state.branchEmployees);

    const currentBranchEmployees = branchId && branchEmployees[branchId]?.teams ? branchEmployees[branchId].teams : [];
    const currentBranchHasMoreEmployees = branchId && branchEmployees[branchId]?.hasMore ? branchEmployees[branchId].hasMore : false;

    useEffect(() => {
        if (!branchId) return;
        dispatch(fetchBranchEmployees({ searchQuery: searchQuery || null, statusFilter: statusFilter || null, employmentTypeFilter: employmentTypeFilter || null, passedBranchId: branchId }));
    }, [dispatch, branchId, searchQuery, statusFilter, employmentTypeFilter]);

    const handleHasMore = () => {
        if (!branchId) return;
        if (!loading && currentBranchHasMoreEmployees) {
            dispatch(fetchBranchEmployees({ searchQuery: searchQuery || null, statusFilter: statusFilter || null, employmentTypeFilter: employmentTypeFilter || null, passedBranchId: branchId }));
        }
    }

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);
  return (
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    >
                  {/* Employee Cards */}
                  <div className="space-y-3">
                {currentBranchEmployees.length > 0 ? (
                    currentBranchEmployees.map((employee, index) => (
                        <EmployeeCard
                            key={employee.id}
                            employee={employee}
                            index={index}
                        />
                    ))
                ) : !loading && (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-sm text-gray-500">
                            {searchQuery || statusFilter !== 'all' || employmentTypeFilter !== 'all'
                                ? 'No employees match your search or filters.'
                                : 'No employees found.'}
                        </p>
                    </div>
                )}

                {loading && <ThreeDotLoading />}
            </div>


            {!loading && currentBranchHasMoreEmployees && (
                <div className="flex col-span-full items-center justify-center mt-7">
                    <button
                        onClick={handleHasMore}
                        className="w-fit mx-auto py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-300"
                    >
                        Load More
                    </button>
                </div>
            )}
    </motion.div>
  )
}

export default AllEmployees
