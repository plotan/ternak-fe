import React, { useState, useEffect } from 'react';
import { Sheet as Sheep, Building, Syringe, Heart, TrendingUp, Activity, BarChart3, Calendar, Clock } from 'lucide-react';
import { historyAPI } from '../lib/api';

interface DashboardStats {
  totalKambing: number;
  totalKandang: number;
  totalVaksin: number;
  totalVaksinisasi: number;
  totalGateActivity: number;
  gateStats: Array<{ status: string; count: string }>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalKambing: 0,
    totalKandang: 0,
    totalVaksin: 0,
    totalVaksinisasi: 0,
    totalGateActivity: 0,
    gateStats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const statsData = await historyAPI.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use mock data on error
      setStats({
        totalKambing: 0,
        totalKandang: 0,
        totalVaksin: 0,
        totalVaksinisasi: 0,
        totalGateActivity: 0,
        gateStats: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Kambing',
      value: stats.totalKambing,
      icon: Sheep,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Kandang',
      value: stats.totalKandang,
      icon: Building,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Vaksin',
      value: stats.totalVaksin,
      icon: Syringe,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Total Vaksinisasi',
      value: stats.totalVaksinisasi,
      icon: Heart,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ];

  const masukCount = stats.gateStats.find(s => s.status === 'Masuk')?.count || '0';
  const keluarCount = stats.gateStats.find(s => s.status === 'Keluar')?.count || '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 lg:mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
            <p className="text-gray-600 text-lg">Overview sistem manajemen ternak</p>
          </div>
          <div className="mt-4 lg:mt-0 flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Terakhir diperbarui: {new Date().toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
                <p className="text-3xl lg:text-4xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-4 lg:p-5 rounded-xl`}>
                <card.icon className={`h-8 w-8 lg:h-10 lg:w-10 ${card.textColor}`} />
              </div>
            </div>
            <div className="flex items-center mt-4 lg:mt-6">
              <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm text-green-600 font-medium">Data terkini</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Movement Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Statistik Pergerakan</h2>
            <Activity className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Kambing Masuk</span>
              </div>
              <span className="font-bold text-green-600 text-xl">+{masukCount}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Kambing Keluar</span>
              </div>
              <span className="font-bold text-red-600 text-xl">+{keluarCount}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Total Aktivitas</span>
              </div>
              <span className="font-bold text-blue-600 text-xl">{stats.totalGateActivity}</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Status Sistem</h2>
            <BarChart3 className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">Database PostgreSQL</span>
              </div>
              <span className="text-green-600 font-semibold text-sm">AKTIF</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">API Server</span>
              </div>
              <span className="text-blue-600 font-semibold text-sm">BERJALAN</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">QR Code System</span>
              </div>
              <span className="text-purple-600 font-semibold text-sm">SIAP</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Aksi Cepat</h2>
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <Sheep className="h-5 w-5 text-green-600" />
                <span className="text-gray-700 font-medium">Tambah Kambing</span>
              </div>
              <span className="text-green-600">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700 font-medium">Kelola Kandang</span>
              </div>
              <span className="text-blue-600">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <Heart className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700 font-medium">Vaksinasi</span>
              </div>
              <span className="text-purple-600">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;