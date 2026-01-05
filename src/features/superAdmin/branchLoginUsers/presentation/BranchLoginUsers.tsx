import { useEffect, useState } from 'react';
import type { BranchProps } from '../../addBranch/data/branchTypes';
import BranchUserCard from './componets/BranchUserCard';
import CreateLoginButton from './componets/CreateLoginButton';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../general/redux/store';
import { fetchBranchUsers } from '../redux/branchUsersSlice';
import ThreeDotLoading from '../../../../general/components/ThreeDotLoading';
import { FiSearch } from 'react-icons/fi';

const BranchLoginUsers = ({ branch }: { branch: BranchProps }) => {


    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    const { branchUsers, error, loading } = useSelector((state: RootState) => state.branchUsers);
    const branchId = branch.id;
    const dispatch: AppDispatch = useDispatch();

    const currentBranchUsers = branchId && branchUsers[branchId]?.users ? branchUsers[branchId].users : [];
    const currentBranchHasMoreUsers = branchId && branchUsers[branchId]?.hasMore ? branchUsers[branchId].hasMore : false;

    // Debounce search query by 1 second
    useEffect(() => {
        const timer = setTimeout(() => {
            const formattedSearchQuery = searchQuery.trim().toLowerCase().replace(/\s+/g, '');
            setDebouncedSearchQuery(formattedSearchQuery);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (!branchId) return;

        const branchData = branchUsers[branchId];
        // Only skip if we have teams and the search hasn't changed
        if (branchData?.users && branchData?.users.length > 0 && branchData?.currentFilter === debouncedSearchQuery) {
            return;
        }

        dispatch(fetchBranchUsers({ branchId, searchQuery: debouncedSearchQuery || null }));
    }, [dispatch, branchId, debouncedSearchQuery]);

    const handleHasMore = () => {
        if (!branchId) return;
        if (!loading && currentBranchHasMoreUsers) {
            dispatch(fetchBranchUsers({ branchId, searchQuery: debouncedSearchQuery || null }));
        }
    }

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);


    return (
        <div className="space-y-4 pb-6">

            <div className="flex justify-between pt-4">

                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search By User Name or Email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-lg outline-none"
                    />
                </div>

                <CreateLoginButton branch={branch} />
            </div>

            {/* User Cards */}
            <div className="space-y-3">
                {currentBranchUsers.length > 0 ? (
                    currentBranchUsers.map((user, index) => (
                        <BranchUserCard key={user.id} index={index} user={user} />
                    ))
                ) : !loading && (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-sm text-gray-500">
                            {searchQuery ? 'No users match your search.' : 'No users found.'}
                        </p>
                    </div>
                )}

                {loading && <ThreeDotLoading />}
            </div>

            {!loading && currentBranchHasMoreUsers && (
                <button
                    className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-300"
                    onClick={handleHasMore}
                >
                    Load More
                </button>
            )}

        </div>
    );
};

export default BranchLoginUsers;

