import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash, Camera } from 'lucide-react';
import { Kandang } from '../lib/supabase';
import { kandangAPI } from '../lib/api';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import QRScanner from '../components/QR/QRScanner';
import LoadingTable from '../components/common/LoadingTable';

const schema = yup.object({
  nama_kandang: yup.string().required('Nama kandang harus diisi'),
});

type FormData = {
  nama_kandang: string;
};

const KandangPage = () => {
  const [kandangList, setKandangList] = useState<Kandang[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    fetchKandang();
  }, []);

  const fetchKandang = async () => {
    try {
      const data = await kandangAPI.getAll();
      setKandangList(data || []);
    } catch (error) {
      console.error('Error fetching kandang:', error);
      toast.error('Gagal memuat data kandang');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editingId) {
        await kandangAPI.update(editingId, { nama_kandang: data.nama_kandang });
        toast.success('Data kandang berhasil diperbarui');
      } else {
        await kandangAPI.create({ nama_kandang: data.nama_kandang });
        toast.success('Data kandang berhasil ditambahkan');
      }

      reset();
      setShowForm(false);
      setEditingId(null);
      fetchKandang();
    } catch (error) {
      console.error('Error saving kandang:', error);
      toast.error('Gagal menyimpan data kandang');
    }
  };

  const handleEdit = (kandang: Kandang) => {
    setEditingId(kandang.id_kandang);
    reset({ nama_kandang: kandang.nama_kandang });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data kandang ini?')) return;

    try {
      await kandangAPI.delete(id);
      toast.success('Data kandang berhasil dihapus');
      fetchKandang();
    } catch (error) {
      console.error('Error deleting kandang:', error);
      toast.error('Gagal menghapus data kandang');
    }
  };

  const handleQRScan = async (qrResult: string, kandangId: string) => {
    try {
      const result = await kandangAPI.recordGate(kandangId, qrResult);
      toast.success(`Kambing ${result.status} kandang berhasil dicatat`);
      setShowScanner(null);
    } catch (error) {
      console.error('Error recording gate entry:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal mencatat pergerakan kambing');
    }
  };

  const filteredKandang = kandangList.filter((kandang) =>
    kandang.nama_kandang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manajemen Kandang</h1>
            <p className="text-gray-600">Kelola data kandang ternak</p>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        
        <div className="mb-6">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        
        <LoadingTable columns={4} rows={6} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Kandang</h1>
          <p className="text-gray-600">Kelola data kandang ternak</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            reset();
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Kandang</span>
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
            placeholder="Cari kandang..."
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
                  ID Kandang
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Kandang
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Ditambahkan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredKandang.map((kandang) => (
                <tr key={kandang.id_kandang} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {kandang.id_kandang.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {kandang.nama_kandang}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(kandang.added_date), 'dd MMMM yyyy', { locale: id })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setShowScanner(kandang.id_kandang)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Scan QR Kambing"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(kandang)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(kandang.id_kandang)}
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
              {editingId ? 'Edit Kandang' : 'Tambah Kandang'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kandang
                </label>
                <input
                  {...register('nama_kandang')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Masukkan nama kandang"
                />
                {errors.nama_kandang && (
                  <p className="text-red-500 text-sm mt-1">{errors.nama_kandang.message}</p>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
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
                  {editingId ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={(result) => handleQRScan(result, showScanner)}
          onClose={() => setShowScanner(null)}
        />
      )}
    </div>
  );
};

export default KandangPage;