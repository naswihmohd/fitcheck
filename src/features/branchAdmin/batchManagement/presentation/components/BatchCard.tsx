import { useState } from 'react';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import type { Timestamp } from 'firebase/firestore';
import type { BatchProps } from '../../data/batchTypes';

interface BatchCardProps {
    batch: BatchProps;
    index: number;
    onEdit: (batch: BatchProps) => void;
    onDelete?: (batch: BatchProps) => void;
    onToggleEnable?: (batch: BatchProps, enabled: boolean) => void;
    onAllocateStudent?: (batch: BatchProps) => void;
}

const formatDateRange = (startDate: Timestamp | Date, endDate: Timestamp | Date): string => {
    const start = startDate instanceof Date ? startDate : startDate.toDate();
    const end = endDate instanceof Date ? endDate : endDate.toDate();
    const startFormatted = start.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    const endFormatted = end.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    return `Batch ${startFormatted} - ${endFormatted}`;
};

const formatTime = (date: Timestamp | Date): string => {
    const dateObj = date instanceof Date ? date : date.toDate();
    return dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
};

const BatchCard = ({ batch, onEdit, onDelete, onToggleEnable, onAllocateStudent }: BatchCardProps) => {
    const [enabled, setEnabled] = useState(true); // Default to enabled, you can add this to batch type later

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newValue = !enabled;
        setEnabled(newValue);
        onToggleEnable?.(batch, newValue);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.(batch);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(batch);
    };

    const handleAllocateStudent = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAllocateStudent?.(batch);
    };

    return (
        <div
            style={{ boxShadow: '0px 0.92px 2.75px 0px #0051AF1A' }}
            className="bg-white rounded-lg p-5 flex flex-col gap-4"
        >
            {/* Header with Batch Name and Actions */}
            <div className="flex items-start justify-between">
                {/* Batch Title */}
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{batch.batchName}</h3>
                </div>

                {/* Top Right Actions: Enable Toggle, Delete, Edit */}
                <div className="flex items-center gap-3">
                    {/* Enable Toggle */}
                    <div className="flex flex-col items-center gap-1">
                        <span className={`text-xs font-medium ${enabled ? 'text-[#0A8316]' : 'text-gray-400'}`}>
                            {enabled ? 'Enable' : 'Disable'}
                        </span>
                        <button
                            onClick={handleToggle}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${enabled ? 'bg-[#0A8316]' : 'bg-gray-300'
                                }`}
                            type="button"
                        >
                            <span
                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Delete Icon */}
                    <button
                        onClick={handleDelete}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                        type="button"
                    >
                        <FiTrash2 className="w-5 h-5" />
                    </button>

                    {/* Edit Icon */}
                    <button
                        onClick={handleEdit}
                        className="p-2 text-[#50B1FF] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit"
                        type="button"
                    >
                        <FiEdit className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Batch Details */}
            <div className="space-y-2">
                {/* Date Range */}
                <p className="text-sm text-gray-600">
                    {formatDateRange(batch.batchStartDate, batch.batchEndDate)}
                </p>

                {/* Time */}
                <p className="text-sm text-gray-600">
                    {formatTime(batch.batchPeriodStartTime)} - {formatTime(batch.batchPeriodEndTime)}
                </p>
            </div>

            {/* Allocate Student Button */}
            <div className="flex items-center justify-end">
                <button
                    onClick={handleAllocateStudent}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#50B1FF] hover:bg-secondary/90 text-white rounded-full transition-colors cursor-pointer text-sm font-medium mt-auto"
                    type="button"
                >
                    <FiPlus className="w-4 h-4" />
                    <span>Allocate Student</span>
                </button>
            </div>
        </div>
    );
};

export default BatchCard;

