import { motion } from 'framer-motion';

interface MetricCardProps {
    title: string;
    value: string;
    index?: number;
    color?: string;
    isPending?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    index = 0,
    color,
    isPending = false,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            style={{
                boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
                backgroundColor: color,
            }}
            className={`group rounded-lg p-5`}
        >
            <div className="flex flex-col gap-3">
                <h3 className="text-base text-black tracking-wide">
                    {title}
                </h3>
                <div className="flex items-center gap-2 justify-between">
                    <p className={`text-3xl font-bold ${isPending ? 'text-[#FE4606]' : 'text-black'}`}>
                        {value}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default MetricCard;

