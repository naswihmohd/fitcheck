import { useEffect, useState } from 'react';
import { FiBookOpen, FiTrash2, FiSend } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import TimeAgo from 'timeago-react';
import type { NotificationType } from '../../data/notificationTypes';
import type { AppDispatch, RootState } from '../../../../../general/redux/store';
import { fetchNotifications } from '../../redux/notificationSlice';
import ThreeDotLoading from '../../../../../general/components/ThreeDotLoading';
import ImageModal from '../../../../../general/components/ImageModal';
import { convertToDate } from '../../utils/convertToDate';


const OldNotices = ({ type }: { type: NotificationType }) => {
    const dispatch: AppDispatch = useDispatch();
    const { notifications, loading, error } = useSelector((state: RootState) => state.notifications);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

    const currentNotifications = notifications[type]?.notifications || [];
    const hasMore = notifications[type]?.hasMore || false;

    // Fetch notifications on mount
    useEffect(() => {
        const notificationData = notifications[type];
        // Only skip if we already have notifications for this type
        if (notificationData?.notifications && notificationData.notifications.length > 0) {
            return;
        }

        dispatch(fetchNotifications({ notificationType: type }));
    }, [dispatch, type]);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            dispatch(fetchNotifications({ notificationType: type }));
        }
    };

    const handleSendAgain = (noticeId: string) => {
        console.log('Send again:', noticeId);
        // Handle send again logic here
    };

    const handleDelete = (noticeId: string) => {
        console.log('Delete:', noticeId);
        // Handle delete logic here
    };

    const handleImageClick = (imageUrl: string) => {
        setSelectedImageUrl(imageUrl);
        setIsImageModalOpen(true);
    };

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    return (
        <>
            <div className="w-full max-w-md">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Old Notice</h3>

                {/* Notices List */}
                <div className="space-y-4">
                    {currentNotifications.length > 0 ? (
                        currentNotifications.map((notice) => (
                            <div
                                key={notice.id}
                                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Notice Content */}
                                <div className="flex gap-3 mb-3">
                                    {/* Book Icon */}
                                    <div className="flex-shrink-0 mt-1">
                                        {notice.imageUrl ? (
                                            <img onClick={() => handleImageClick(notice.imageUrl || '')} src={notice.imageUrl || ''} alt={notice.caption} className="w-10 h-10 cursor-pointer rounded-md" />
                                        ) : (
                                            <FiBookOpen className="w-5 h-5 text-gray-600" />
                                        )}
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                            {notice.caption}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {notice.description}
                                        </p>
                                        <p className="text-xs text-end text-gray-500">
                                            <TimeAgo datetime={convertToDate(notice.createdAt)} />
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => handleSendAgain(notice.id)}
                                        className="px-3 py-1.5 text-sm font-medium text-white bg-[#50B1FF] rounded-md hover:bg-[#50B1FF]/90 transition-colors flex items-center gap-1.5"
                                    >
                                        <FiSend className="w-3.5 h-3.5" />
                                        Send Again
                                    </button>
                                    <button
                                        onClick={() => handleDelete(notice.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        aria-label="Delete notice"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : !loading && (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-sm text-gray-500">
                                No old notices found.
                            </p>
                        </div>
                    )}

                    {loading && <ThreeDotLoading />}
                </div>

                {!loading && hasMore && (
                    <button
                        className="w-full py-2 px-4 bg-[#50B1FF] text-white rounded-lg hover:bg-[#50B1FF]/80 transition-colors duration-300 mt-4"
                        onClick={handleLoadMore}
                    >
                        Load More
                    </button>
                )}
            </div>

            <ImageModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                imageUrl={selectedImageUrl || ''}
                altText={selectedImageUrl || ''}
            />
        </>
    );
};

export default OldNotices;

