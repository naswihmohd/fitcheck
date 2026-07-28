import { useEffect, useState } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

interface LineChartProps {
  data: any[];
  lines: Array<{
    key: string;
    color: string;
    name: string;
  }>;
  title: string;
  height?: number | `${number}%`;
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : true
  );

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [breakpoint]);

  return isMobile;
}

const LineChart = ({ data, lines, title, height = '100%' }: LineChartProps) => {
  const isMobile = useIsMobile();

  const getMaxValue = () => {
    if (!data || data.length === 0) return 4;

    const maxValue = Math.max(
      ...data.map((item) =>
        Math.max(...lines.map((line) => Number(item[line.key]) || 0))
      )
    );

    if (maxValue === 0) return 4;
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    const normalized = maxValue / magnitude;
    let rounded;

    if (normalized <= 1) rounded = 1;
    else if (normalized <= 2) rounded = 2;
    else if (normalized <= 5) rounded = 5;
    else rounded = 10;

    return rounded * magnitude;
  };

  const maxValue = getMaxValue();

  const generateTicks = (max: number) => {
    const ticks = [0];
    const step = max / 4;
    for (let i = step; i <= max; i += step) {
      ticks.push(Math.round(i));
    }
    return ticks;
  };

  const ticks = generateTicks(maxValue);

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={
          isMobile
            ? { top: 8, right: 4, left: -18, bottom: 0 }
            : { top: 8, right: 12, left: 0, bottom: 4 }
        }
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#9ca3af"
          fontSize={isMobile ? 10 : 12}
          tickLine={false}
          axisLine={false}
          tickMargin={isMobile ? 6 : 8}
          interval={0}
          padding={{ left: 4, right: 4 }}
        />
        <YAxis
          stroke="#9ca3af"
          fontSize={isMobile ? 10 : 12}
          tickLine={false}
          axisLine={false}
          width={isMobile ? 28 : 36}
          tickMargin={2}
          tickFormatter={(value) =>
            value === 0 ? '0' : value >= 1000 ? `${Math.round(value / 1000)}k` : `${value}`
          }
          domain={[0, maxValue]}
          ticks={ticks}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
            fontSize: isMobile ? 11 : 13,
            padding: isMobile ? '6px 8px' : '8px 12px',
          }}
          labelStyle={{ color: '#6b7280', marginBottom: 2 }}
        />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color}
            strokeWidth={isMobile ? 2 : 2.5}
            dot={{
              fill: line.color,
              r: isMobile ? 3 : 4,
              strokeWidth: 0,
            }}
            activeDot={{ r: isMobile ? 5 : 6, strokeWidth: 0 }}
            name={line.name}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );

  if (!title) {
    return chartContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-white p-4 shadow-lg md:p-6"
    >
      <h3 className="mb-3 text-sm font-semibold text-gray-800 md:mb-4 md:text-lg">
        {title}
      </h3>
      {chartContent}
    </motion.div>
  );
};

export default LineChart;
