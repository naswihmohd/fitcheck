import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface LineChartProps {
  data: any[];
  lines: Array<{
    key: string;
    color: string;
    name: string;
  }>;
  title: string;
  height?: number;
}

const LineChart = ({ data, lines, title, height = 300 }: LineChartProps) => {
  // Calculate max value from data for dynamic Y-axis domain
  const getMaxValue = () => {
    if (!data || data.length === 0) return 100;
    
    const maxValue = Math.max(...data.map(item => {
      // Get the max value from all line keys
      return Math.max(...lines.map(line => Number(item[line.key]) || 0));
    }));
    
    // Round up to nearest nice number for better visualization
    if (maxValue === 0) return 100;
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
  
  // Generate nice tick values
  const generateTicks = (max: number) => {
    const ticks = [0];
    const step = max / 4; // 4 intervals
    for (let i = step; i <= max; i += step) {
      ticks.push(Math.round(i));
    }
    return ticks;
  };

  const ticks = generateTicks(maxValue);

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          stroke="#6b7280"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value === 0 ? '0' : value >= 1000 ? `+${value}` : `${value}`}
          domain={[0, maxValue]}
          ticks={ticks}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color}
            strokeWidth={2}
            dot={{ fill: line.color, r: 4 }}
            activeDot={{ r: 6 }}
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
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {chartContent}
    </motion.div>
  );
};

export default LineChart;

