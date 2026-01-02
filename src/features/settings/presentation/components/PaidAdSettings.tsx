import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import type { AppDispatch, RootState } from '../../../../general/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBranchTeams } from '../../../teams/redux/teamSlice';
import PaidAdCardAssign from './PaidAdCardAssign';

const PaidAdSettings = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    const { branchTeams, error, loading } = useSelector((state: RootState) => state.branchTeams);
    const { branchId } = useSelector((state: RootState) => state.user);
    const dispatch: AppDispatch = useDispatch();

    const currentBranchTeams = branchId && branchTeams[branchId]?.teams ? branchTeams[branchId].teams : [];
    const currentBranchHasMoreTeams = branchId && branchTeams[branchId]?.hasMore ? branchTeams[branchId].hasMore : false;

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

        const branchData = branchTeams[branchId];
        // Only skip if we have teams and the search hasn't changed
        if (branchData?.teams && branchData?.teams.length > 0 && branchData?.currentFilter === debouncedSearchQuery) {
            return;
        }

        dispatch(fetchBranchTeams({ searchQuery: debouncedSearchQuery || null }));
    }, [dispatch, branchId, debouncedSearchQuery]);

    const handleHasMore = () => {
        if (!loading && currentBranchHasMoreTeams) {
            dispatch(fetchBranchTeams({ searchQuery: debouncedSearchQuery || null }));
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
            className="h-full"
        >
            {/* Header Section */}
            <div className="mb-6">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md mb-4">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search name here...."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-white outline-none rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <h1 className="text-lg font-semibold text-gray-900 mb-4">
                    Who can allow paid advertising?
                </h1>
            </div>

            {/* User List */}
            <div className="space-y-3">
                {currentBranchTeams.length > 0 ? (
                    currentBranchTeams.map((team, index) => (
                        <PaidAdCardAssign
                            key={team.id}
                            data={team}
                            index={index}
                        />
                    ))
                ) : !loading && (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-sm text-gray-500">
                            {searchQuery ? 'No executives match your search.' : 'No executives found.'}
                        </p>
                    </div>
                )}

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <span className="three-body">
                            <span className="three-body__dot"></span>
                            <span className="three-body__dot"></span>
                            <span className="three-body__dot"></span>
                        </span>
                    </div>
                )}
            </div>

            {!loading && currentBranchHasMoreTeams && (
                <button className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-300" onClick={handleHasMore}>
                    Load More
                </button>
            )}
        </motion.div>
    );
};

export default PaidAdSettings;
