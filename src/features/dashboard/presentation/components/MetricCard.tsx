import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';

interface MetricCardProps {
  title: string;
  value: string | number;
  index?: number;
  color?: string;
  icon?: IconType;
  iconClassName?: string;
  isPending?: boolean;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  index = 0,
  color = '#EDEEFC',
  icon: Icon,
  iconClassName = 'text-primary',
  isPending = false,
  loading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.35,
        delay: index * 0.04,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={{
        boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
        backgroundColor: color,
      }}
      className="rounded-xl p-3 md:p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[11px] font-medium text-gray-600 md:text-sm">
            {title}
          </h3>
          <p
            className={`mt-1 text-xl font-bold leading-none md:mt-2 md:text-3xl ${
              isPending ? 'text-[#FE4606]' : 'text-gray-900'
            }`}
          >
            {loading ? '…' : value}
          </p>
        </div>

        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70 md:h-10 md:w-10">
            <Icon className={`h-3.5 w-3.5 md:h-5 md:w-5 ${iconClassName}`} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;
