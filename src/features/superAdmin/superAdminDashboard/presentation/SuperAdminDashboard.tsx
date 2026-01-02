import { motion } from 'framer-motion';
import { FiCalendar } from 'react-icons/fi';
import MetricCard from './components/MetricCard';
import LineChart from './components/LineChart';

function SuperAdminDashboard() {
 
  // Dummy data for metrics
  const metrics = [
    { title: 'Total Students', value: '2580', index: 0, color: '#EDEEFC' },
    { title: 'Total Branches', value: '32', index: 1, color: '#E6F1FD' },
    { title: 'Total Sales Executive', value: '12', index: 2, color: '#EDEEFC' },
    { title: 'Total Tutors', value: '9', index: 3, color: '#EDEEFC' },
    { title: 'Total Placement Officers', value: '9', index: 4, color: '#E6F1FD' },
    { title: 'Total Fee Collected', value: '₹64955.00', index: 5, color: '#EDEEFC' },
    { title: 'Pending Fee', value: '₹3949', index: 6, color: '#EEE6FD', isPending: true },
  ];

  // Dummy data for Users line chart
  const usersData = [
    { name: 'Sun', users: 120 },
    { name: 'Mon', users: 180 },
    { name: 'Tue', users: 150 },
    { name: 'Wed', users: 280 },
    { name: 'Thu', users: 250 },
    { name: 'Fri', users: 200 },
    { name: 'Sat', users: 170 },
  ];

  // Dummy data for Branches Fee Collection
  const branchesFeeData = [
    { name: 'Branch 1', percentage: 52.1 },
    { name: 'Branch 2', percentage: 22.8 },
    { name: 'Branch 3', percentage: 13.9 },
    { name: 'Branch 4', percentage: 11.2 },
    { name: 'Branch 5', percentage: 11.2 },
    { name: 'Branch 6', percentage: 11.2 },
    { name: 'Branch 7', percentage: 11.2 },
    { name: 'Branch 8', percentage: 11.2 },
  ];

  // Dummy data for Courses
  const courses = ['ACCA', 'CA', 'CFA'];

  return (
    <div className="space-y-6 pb-6">
      {/* Metrics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            index={metric.index}
            color={metric.color}
            isPending={metric.isPending}
          />
        ))}
      </motion.div>

      {/* Charts and Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
          }}
          className="bg-white lg:col-span-2 rounded-lg border border-primary/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users</h3>
          <LineChart
            data={usersData}
            lines={[{ key: 'users', color: '#0095DA', name: 'Users' }]}
            title=""
            height={250}
          />
        </motion.div>

        {/* Branches Fee Collection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
          }}
          className="bg-white rounded-lg border border-primary/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Branches Fee Collection</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiCalendar className="w-4 h-4" />
              <span>March</span>
            </div>
          </div>
          <div className="space-y-3">
            {branchesFeeData.map((branch, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{branch.name}</span>
                <span className="text-sm font-semibold text-gray-900">{branch.percentage}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Our Courses Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{
          boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
        }}
        className="bg-white rounded-lg border border-primary/10 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Courses</h3>
        <div className="flex flex-wrap gap-3">
          {courses.map((course, index) => (
            <div
              key={index}
              className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-gray-700"
            >
              {course}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default SuperAdminDashboard;
