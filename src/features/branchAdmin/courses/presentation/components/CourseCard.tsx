
import { FiEdit } from 'react-icons/fi';
import { useNavigate } from 'react-router';
import type { CourseProps } from '../../data/courseType';

interface CourseCardProps {
    course: CourseProps;
    index: number;
    onEdit: (course: CourseProps) => void;
}

const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
};

const CourseCard = ({ course, onEdit }: CourseCardProps) => {
    const navigate = useNavigate();


    const handleCourseClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        navigate(`/branch/batch-management/${course.id}`);
    }
    return (
        <div
            onClick={handleCourseClick}
            style={{ boxShadow: '0px 0.92px 2.75px 0px #0051AF1A' }}
            className="bg-white cursor-pointer rounded-lg p-4 flex items-center gap-4"
        >
            {/* Course Details */}
            <div className="flex-1 min-w-0">
                <div className="space-y-1">
                    <div className="flex text-sm text-gray-700">
                        <span className="w-24 font-normal text-gray-500">Course</span>
                        <span className="mr-2">:</span>
                        <span className="font-normal text-black truncate">{course.courseName}</span>
                    </div>
                    <div className="flex text-sm text-gray-700">
                        <span className="w-24 font-normal text-gray-500">Duration</span>
                        <span className="mr-2">:</span>
                        <span className="font-normal text-black">{course.courseDuration}</span>
                    </div>
                    <div className="flex text-sm text-gray-700">
                        <span className="w-24 font-normal text-gray-500">Fee</span>
                        <span className="mr-2">:</span>
                        <span className="font-normal text-black">{formatCurrency(course.courseFee)}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="h-full flex items-start">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(course);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                    type="button"
                >
                    <FiEdit className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default CourseCard;

