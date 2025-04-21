import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, User, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight, Moon, Sun, Video } from 'lucide-react';
import { useUser } from '../UserContext';

const VehicleLogPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleLogs, setVehicleLogs] = useState([]);
  const [todayTotalFee, setTodayTotalFee] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useUser();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://autolog-api.onrender.com/vehicles');
        const data = await res.json();
        setVehicleLogs(data);

        const vehicles = await res.json();
        // Get today's date at 00:00 AM
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Filter vehicles that exited today
        const exitedToday = vehicles.filter(v => {
          const exitTime = new Date(v.exit_time);
          return exitTime >= todayStart && exitTime <= todayEnd;
        });

        // Sum the fees
        const totalFee = exitedToday.reduce((sum, v) => sum + (v.parking_fee || 0), 0);
        setTodayTotalFee(totalFee);
        console.log('Total fee for today:', exitedToday);
      } catch (err) {
        console.error('Failed to fetch vehicle data:', err);
      }
    };

    fetchData();
  }, []);

  const filteredLogs = vehicleLogs.filter(log =>
    log.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.entry_time && log.entry_time.includes(searchTerm)) ||
    (log.exit_time && log.exit_time.includes(searchTerm))
  );

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleCamera = () => {
    setCameraEnabled(!cameraEnabled);
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      {/* Sidebar - kept the same as in the Dashboard */}
      <aside className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out`}>
        <nav>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700  bg-gray-700" onClick={() => navigate('/vehicle-logs')}>Vehicle Logs</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/manualentry')}>Manual Vehicle Entry</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/reports')}>Reports & Analytics</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/settings')}>Settings</button>
          <button className="w-full text-left py-2 px-4 text-white hover:bg-gray-700" onClick={() => navigate('/helpsupport')}>Help/Support</button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar - similar to Dashboard */}
        <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md relative`}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button className="md:hidden p-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-6 w-6" />
              </button>
              <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} ml-2`}>Vehicle Logs</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search logs..."
                  className={`pl-8 pr-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} border border-gray-300`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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

        {/* Main Content - Vehicle Log */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Vehicle Entry/Exit Log</h2>
              <div className="flex items-center">
                <span className={`mr-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Live Camera</span>
                <div
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${cameraEnabled ? 'bg-green-500' : (darkMode ? 'bg-gray-700' : 'bg-gray-300')}`}
                  onClick={toggleCamera}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${cameraEnabled ? 'translate-x-6' : ''}`}></div>
                </div>
                <Video className={`ml-2 h-5 w-5 ${cameraEnabled ? (darkMode ? 'text-green-400' : 'text-green-500') : (darkMode ? 'text-gray-400' : 'text-gray-500')}`} />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Live Camera Section */}
              {cameraEnabled && (
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-md p-6 mb-6 md:mb-0 md:w-1/2`}>
                  <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Live Camera Feed</h3>
                  <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <Video className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">Camera feed will appear here</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Live Recognition</h4>
                    <div className={`p-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <p className="text-sm">No vehicles detected</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Vehicle Log Table */}
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-md p-6 mb-6 ${cameraEnabled ? 'md:w-1/2' : 'w-full'}`}>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className={`${darkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parking Fee</th>
                      </tr>
                    </thead>
                    <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {filteredLogs.map((log, index) => (
                        <tr key={log.id} className={index % 2 === 0 ? (darkMode ? 'bg-gray-900' : 'bg-gray-50') : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {log.exit_time ?
                                <ArrowDownLeft className="h-5 w-5 text-red-500 mr-2" /> :
                                <ArrowUpRight className="h-5 w-5 text-green-500 mr-2" />
                              }
                              {log.license_plate}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{new Date(log.entry_time).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{log.exit_time ? new Date(log.exit_time).toLocaleString() : 'In Parking'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{log.vehicle_type}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{log.parking_fee || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Showing 1 to {filteredLogs.length} of {filteredLogs.length} entries
                  </div>
                  <div className="flex space-x-2">
                    <button className={`p-2 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button className={`p-2 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'} shadow-md`}>
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div>
              {/* Total Parked Vehicles: <span className="font-bold">{mockVehicleLogs.filter(log => !log.exitTime).length}</span> */}
            </div>
            <div>
              Total Revenue: <span className="font-bold">₹ {todayTotalFee}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default VehicleLogPage;