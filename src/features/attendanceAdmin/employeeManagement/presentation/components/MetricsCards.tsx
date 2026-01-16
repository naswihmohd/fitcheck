import { FiUsers, FiUserCheck, FiUserX } from 'react-icons/fi';
import MetricCard from './MetricCard';

interface MetricsCardsProps {
    total: number;
    active: number;
    inactive: number;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ total, active, inactive }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
                title="Total Employees"
                value={total}
                icon={<FiUsers />}
                iconBgColor="bg-blue-100"
                iconColor="text-blue-600"
                delay={0.1}
            />
            <MetricCard
                title="Active Employees"
                value={active}
                icon={<FiUserCheck />}
                iconBgColor="bg-green-100"
                iconColor="text-green-600"
                valueColor="text-green-600"
                delay={0.15}
            />
            <MetricCard
                title="Inactive Employees"
                value={inactive}
                icon={<FiUserX />}
                iconBgColor="bg-red-100"
                iconColor="text-red-600"
                valueColor="text-red-600"
                delay={0.2}
            />
        </div>
    );
};

export default MetricsCards;
