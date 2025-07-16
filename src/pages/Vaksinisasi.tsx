import React, { useState, useEffect } from 'react';
import { Plus, Search, Camera, Eye, Edit, Trash } from 'lucide-react';
import { Vaksinisasi, Vaksin } from '../lib/supabase';
import { vaksinisasiAPI, vaksinAPI, kambingAPI } from '../lib/api';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import QRScanner from '../components/QR/QRScanner';
import LoadingTable from '../components/common/LoadingTable';

const schema = yup.object({
  id_vaksin: yup.string().required('Vaksin harus dipilih'),
  dosis_vaksin: yup.string().required('Dosis vaksin harus diisi'),
});

type FormData = {
  id_vaksin: string;
  dosis_vaksin: string;
};

const VaksinisasiPage = () => {
  const [vaksinisasiList, setVaksinisasiList] = useState<Vaksinisasi[]>([]);
  const [vaksinList, setVaksinList] = useState<Vaksin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKambingId, setSelectedKambingId] = useState<string | null>(null);
  const [selectedKambingName, setSelectedKambingName] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vaksinisasiResult, vaksinResult] = await Promise.all([
        vaksinisasiAPI.getAll(),
        vaksinAPI.getAll(),
      ]);

      setVaksinisasiList(vaksinisasiResult || []);
      setVaksinList(vaksinResult || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedKambingId && !editingId) {
      toast.error('Silakan scan QR kambing terlebih dahulu');
      return;
    }

    try {
      if (editingId) {
        await vaksinisasiAPI.update(editingId, {
          id_kambing: selectedKambingId,
          id_vaksin: data.id_vaksin,
          dosis_vaksin: data.dosis_vaksin,
        });
        toast.success('Data vaksinisasi berhasil diperbarui');
      } else {
        await vaksinisasiAPI.create({
          id_kambing: selectedKambingId,
          id_vaksin: data.id_vaksin,
          dosis_vaksin: data.dosis_vaksin,
        });
        toast.success('Vaksinisasi berhasil dicatat');
      }

      reset();
      setShowForm(false);
      setEditingId(null);
      setSelectedKambingId(null);
      setSelectedKambingName('');
      fetchData();
    } catch (error) {
      console.error('Error saving vaksinisasi:', error);
      toast.error('Gagal menyimpan data vaksinisasi');
    }
  };

  const handleEdit = async (vaksinisasi: Vaksinisasi) => {
    try {
      // Get kambing details
      const kambing = await kambingAPI.getById(vaksinisasi.id_kambing);
      
      setEditingId(vaksinisasi.id_vaksinisasi);
      setSelectedKambingId(vaksinisasi.id_kambing);
      setSelectedKambingName(kambing.keturunan);
      setValue('id_vaksin', vaksinisasi.id_vaksin);
      setValue('dosis_vaksin', vaksinisasi.dosis_vaksin);
      setShowForm(true);
    } catch (error) {
      console.error('Error loading vaksinisasi for edit:', error);
      toast.error('Gagal memuat data vaksinisasi');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data vaksinisasi ini?')) return;

    try {
      await vaksinisasiAPI.delete(id);
      toast.success('Data vaksinisasi berhasil dihapus');
      fetchData();
    } catch (error) {
      console.error('Error deleting vaksinisasi:', error);
      toast.error('Gagal menghapus data vaksinisasi');
    }
  };

  const handleQRScan = async (qrResult: string) => {
    try {
      const kambing = await kambingAPI.getById(qrResult);

      setSelectedKambingId(qrResult);
      setSelectedKambingName(kambing.keturunan);
      setShowScanner(false);
      setShowForm(true);
      toast.success(`Kambing ${kambing.keturunan} dipilih untuk vaksinisasi`);
    } catch (error) {
      console.error('Error verifying kambing:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal memverifikasi kambing');
    }
  };

  const filteredVaksinisasi = vaksinisasiList.filter((item) =>
    item.keturunan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nama_vaksin?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Vaksinisasi</h1>
            <p className="text-gray-600">Kelola proses vaksinisasi kambing</p>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        
        <div className="mb-6">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        
        <LoadingTable columns={6} rows={6} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Vaksinisasi</h1>
          <p className="text-gray-600">Kelola proses vaksinisasi kambing</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setSelectedKambingId(null);
            setSelectedKambingName('');
            reset();
            setShowScanner(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Camera className="h-5 w-5" />
          <span>Scan QR Kambing</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan keturunan kambing atau nama vaksin..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Vaksinisasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kambing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vaksin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dosis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Vaksin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVaksinisasi.map((item) => (
                <tr key={item.id_vaksinisasi} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.id_vaksinisasi.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.keturunan || 'Data tidak tersedia'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.nama_vaksin || 'Data tidak tersedia'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.dosis_vaksin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(item.vaksin_date), 'dd MMMM yyyy HH:mm', { locale: id })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id_vaksinisasi)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Vaksinisasi' : 'Vaksinisasi Kambing'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kambing yang Dipilih
                </label>
                <input
                  type="text"
                  value={selectedKambingName || selectedKambingId || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  placeholder={editingId ? "Kambing sudah dipilih" : "Scan QR kambing terlebih dahulu"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vaksin
                </label>
                <select
                  {...register('id_vaksin')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Pilih vaksin</option>
                  {vaksinList.map((vaksin) => (
                    <option key={vaksin.id_vaksin} value={vaksin.id_vaksin}>
                      {vaksin.nama_vaksin}
                    </option>
                  ))}
                </select>
                {errors.id_vaksin && (
                  <p className="text-red-500 text-sm mt-1">{errors.id_vaksin.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosis Vaksin
                </label>
                <input
                  {...register('dosis_vaksin')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Contoh: 100ml"
                />
                {errors.dosis_vaksin && (
                  <p className="text-red-500 text-sm mt-1">{errors.dosis_vaksin.message}</p>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setSelectedKambingId(null);
                    setSelectedKambingName('');
                    reset();
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingId ? 'Perbarui Vaksinisasi' : 'Simpan Vaksinisasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default VaksinisasiPage;