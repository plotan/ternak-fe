import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash } from 'lucide-react';
import { Vaksin } from '../lib/supabase';
import { vaksinAPI } from '../lib/api';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import LoadingTable from '../components/common/LoadingTable';

const schema = yup.object({
  nama_vaksin: yup.string().required('Nama vaksin harus diisi'),
});

type FormData = {
  nama_vaksin: string;
};

const VaksinPage = () => {
  const [vaksinList, setVaksinList] = useState<Vaksin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
    fetchVaksin();
  }, []);

  const fetchVaksin = async () => {
    try {
      const data = await vaksinAPI.getAll();
      setVaksinList(data || []);
    } catch (error) {
      console.error('Error fetching vaksin:', error);
      toast.error('Gagal memuat data vaksin');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editingId) {
        await vaksinAPI.update(editingId, { nama_vaksin: data.nama_vaksin });
        toast.success('Data vaksin berhasil diperbarui');
      } else {
        await vaksinAPI.create({ nama_vaksin: data.nama_vaksin });
        toast.success('Data vaksin berhasil ditambahkan');
      }

      reset();
      setShowForm(false);
      setEditingId(null);
      fetchVaksin();
    } catch (error) {
      console.error('Error saving vaksin:', error);
      toast.error('Gagal menyimpan data vaksin');
    }
  };

  const handleEdit = (vaksin: Vaksin) => {
    setEditingId(vaksin.id_vaksin);
    reset({ nama_vaksin: vaksin.nama_vaksin });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data vaksin ini?')) return;

    try {
      await vaksinAPI.delete(id);
      toast.success('Data vaksin berhasil dihapus');
      fetchVaksin();
    } catch (error) {
      console.error('Error deleting vaksin:', error);
      toast.error('Gagal menghapus data vaksin');
    }
  };

  const filteredVaksin = vaksinList.filter((vaksin) =>
    vaksin.nama_vaksin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manajemen Vaksin</h1>
            <p className="text-gray-600">Kelola data vaksin ternak</p>
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
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Vaksin</h1>
          <p className="text-gray-600">Kelola data vaksin ternak</p>
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
          <span>Tambah Vaksin</span>
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
            placeholder="Cari vaksin..."
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
                  ID Vaksin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Vaksin
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
              {filteredVaksin.map((vaksin) => (
                <tr key={vaksin.id_vaksin} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {vaksin.id_vaksin.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vaksin.nama_vaksin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(vaksin.added_at), 'dd MMMM yyyy', { locale: id })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(vaksin)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(vaksin.id_vaksin)}
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
              {editingId ? 'Edit Vaksin' : 'Tambah Vaksin'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Vaksin
                </label>
                <input
                  {...register('nama_vaksin')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Masukkan nama vaksin"
                />
                {errors.nama_vaksin && (
                  <p className="text-red-500 text-sm mt-1">{errors.nama_vaksin.message}</p>
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
    </div>
  );
};

export default VaksinPage;