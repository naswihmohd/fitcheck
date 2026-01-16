import { motion } from 'framer-motion';

interface MetricCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    iconBgColor: string;
    iconColor: string;
    valueColor?: string;
    delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    icon: Icon,
    iconBgColor,
    valueColor = 'text-gray-900',
    delay = 0.1,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 font-medium">{title}</p>
                    <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
                </div>
                <div className={`${iconBgColor} p-3 rounded-lg`}>
                    {Icon}
                </div>
            </div>
        </motion.div>
    );
};

export default MetricCard;
