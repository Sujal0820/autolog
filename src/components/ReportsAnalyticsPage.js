import React, { useState, useEffect } from 'react';
import { Input } from "../components/ui/input"
import { Select } from "../components/ui/select"
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import { Moon, Sun, Menu, Bell, User } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useUser } from '../UserContext';


const ReportsAnalyticsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useUser();
  const [vehicleChartData, setVehicleChartData] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [vehicleTypeData, setVehicleTypeData] = useState([]);

  const [metrics, setMetrics] = useState({
    totalVehicles: 0,
    avgParkingDuration: '0 hrs',
    peakOccupancyTime: 'N/A',
    totalRevenue: 0,
  });

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('https://autolog-api.onrender.com/vehicles');
        const data = await response.json();

        const totalVehicles = data.length;

        let totalDuration = 0;
        let totalRevenue = 0;
        let entryTimes = [];

        data.forEach(vehicle => {
          if (vehicle.entry_time && vehicle.exit_time) {
            const entry = new Date(vehicle.entry_time);
            const exit = new Date(vehicle.exit_time);
            const diffInHours = (exit - entry) / (1000 * 60 * 60);
            totalDuration += diffInHours;
            entryTimes.push(entry);
          }

          totalRevenue += vehicle.parking_fee || 0;
        });

        const avgParkingDuration = totalVehicles ? (totalDuration / totalVehicles).toFixed(2) + ' hrs' : '0 hrs';

        let peakOccupancyTime = 'N/A';
        if (entryTimes.length > 0) {
          const avgMinutes = Math.floor(
            entryTimes.reduce((sum, time) => sum + time.getHours() * 60 + time.getMinutes(), 0) / entryTimes.length
          );
          const hours = Math.floor(avgMinutes / 60).toString().padStart(2, '0');
          const minutes = (avgMinutes % 60).toString().padStart(2, '0');
          peakOccupancyTime = `${hours}:${minutes}`;
        }

        setMetrics({
          totalVehicles,
          avgParkingDuration,
          peakOccupancyTime,
          totalRevenue,
        });

      } catch (err) {
        console.error('Failed to fetch vehicle data:', err);
      }
    };

    fetchMetrics();

    const fetchChartData = async () => {
      try {
        const response = await fetch('https://autolog-api.onrender.com/vehicles');
        const data = await response.json();

        // Vehicle count per day
        const vehicleCountMap = {};
        const revenueMap = {};
        const vehicleTypeMap = {};

        data.forEach(vehicle => {
          const date = new Date(vehicle.entry_time).toISOString().split('T')[0];

          // Vehicles per day
          vehicleCountMap[date] = (vehicleCountMap[date] || 0) + 1;

          // Revenue per day
          revenueMap[date] = (revenueMap[date] || 0) + (vehicle.parking_fee || 0);

          // Vehicle type
          const type = vehicle.vehicle_type || 'unknown';
          vehicleTypeMap[type] = (vehicleTypeMap[type] || 0) + 1;
        });

        // Convert to chart-friendly arrays
        const vehiclesChartArr = Object.entries(vehicleCountMap).map(([date, count]) => ({
          date,
          count,
        }));

        const revenueChartArr = Object.entries(revenueMap).map(([date, revenue]) => ({
          date,
          revenue,
        }));

        const typeChartArr = Object.entries(vehicleTypeMap).map(([type, value]) => ({
          name: type,
          value,
        }));

        setVehicleChartData(vehiclesChartArr);
        setRevenueChartData(revenueChartArr);
        setVehicleTypeData(typeChartArr);

      } catch (err) {
        console.error('Failed to fetch chart data:', err);
      }
    };

    fetchChartData();
  }, []);



  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100'}`}>
      {/* Sidebar - kept the same as in the Dashboard */}
      <aside className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out`}>
        <nav>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/vehicle-logs')}>Vehicle Logs</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/manualentry')}>Manual Vehicle Entry</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700  bg-gray-700" onClick={() => navigate('/reports')}>Reports & Analytics</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/settings')}>Settings</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/helpsupport')}>Help/Support</button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button className="md:hidden p-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-6 w-6" />
              </button>
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} ml-2`}>Reports & Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">

              </div>
              <button className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                <Bell className="h-5 w-5" />
              </button>
              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-gray-200"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <User className="h-5 w-5" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="flex items-center space-x-2 p-4 border-b border-gray-100">
                      <User className="h-6 w-6 text-gray-600" />
                      <span className="font-medium text-gray-700">{user.username}</span>
                    </div>
                    <button onClick={() => navigate('/')}

                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <button onClick={toggleDarkMode} className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8">

          <div className="max-w-6xl mx-auto">


            {/* Filter and Export Section */}
            <div className="mb-6 flex flex-wrap gap-4">
              <Input type="date" className="w-40 text-black" placeholder="Start Date" />
              <Input type="date" className="w-40 text-black" placeholder="End Date" />
              <Select>
                <option value="">All Vehicle Types</option>
                <option value="car">Car</option>
                <option value="truck">Truck</option>
                <option value="motorcycle">Motorcycle</option>
              </Select>
              <Select>
                <option value="">All Durations</option>
                <option value="short">Short-term (&lt; 2 hours)</option>
                {/* <option value="medium">Medium-term (2-8 hours)</option>
                <option value="long">Long-term (&gt; 8 hours)</option> */}
              </Select>
              {/* <Button variant="outline">Generate Report</Button>
              <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
              <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export PDF</Button> */}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <h2 className="text-xl font-semibold mb-4">Parking Occupancy Trends</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueChartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vehicleChartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>

              </div>
            </div>

            {/* Key Metrics Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {['Total Vehicles', 'Avg. Parking Duration', 'Peak Occupancy Time', 'Total Revenue'].map((metric) => (
                <div key={metric} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                  <h3 className="text-lg font-semibold mb-2">{metric}</h3>
                  <p className="text-2xl font-bold">
                    {metric === 'Total Vehicles' && metrics.totalVehicles}
                    {metric === 'Avg. Parking Duration' && metrics.avgParkingDuration}
                    {metric === 'Peak Occupancy Time' && metrics.peakOccupancyTime}
                    {metric === 'Total Revenue' && `₹${metrics.totalRevenue}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsAnalyticsPage;