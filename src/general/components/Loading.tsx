import React from 'react';

interface LoadingProps {
    type?: 'dashboard' | 'simple';
    className?: string;
}

const Loading: React.FC<LoadingProps> = ({ type = 'dashboard', className = '' }) => {
    if (type === 'simple') {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        );
    }

    return (
        <div className={`animate-pulse p-4 ${className}`}>
            {/* Greeting and Title Skeleton */}
            <div className="mb-6">
                <div className="h-6 bg-gray-200 rounded w-64 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>

            {/* Metrics Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { bgColor: 'bg-purple-100', iconBg: 'bg-purple-200' },
                    { bgColor: 'bg-orange-100', iconBg: 'bg-orange-200' },
                    { bgColor: 'bg-blue-100', iconBg: 'bg-blue-200' },
                    { bgColor: 'bg-green-100', iconBg: 'bg-green-200' }
                ].map((colors, index) => (
                    <div key={index} className={`rounded-xl shadow-sm p-6 ${colors.bgColor} relative overflow-hidden`}>
                        {/* Wave pattern overlay */}
                        <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                            <div className="w-full h-full bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                                    <div className="h-10 bg-gray-300 rounded w-16"></div>
                                </div>
                                <div className={`w-12 h-12 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
                                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters Section Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-gray-300 rounded"></div>
                        <div className="h-5 bg-gray-300 rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-gray-300 rounded w-12"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index}>
                            <div className="h-4 bg-gray-300 rounded w-28 mb-2"></div>
                            <div className="h-10 bg-gray-200 rounded-lg w-full border border-gray-200"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Status Tabs and Requests Button Skeleton */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="h-9 bg-gray-200 rounded-lg w-24"></div>
                ))}
                <div className="ml-auto h-9 bg-green-200 rounded-lg w-28"></div>
            </div>

            {/* Staff List Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="relative">
                        <div className="w-64 h-10 bg-gray-200 rounded-lg border border-gray-200"></div>
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-300 rounded"></div>
                    </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                    <div className="h-4 bg-red-200 rounded w-20"></div>
                </div>

                <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                                    <div className="w-4 h-4 bg-green-400 rounded"></div>
                                </div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-300 rounded w-36 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                                <div className="h-6 bg-green-200 rounded w-12"></div>
                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Loading;
