import React, { useState, useEffect } from 'react';
import { Plus, Search, QrCode, Edit, Trash } from 'lucide-react';
import { kambingAPI, kandangAPI, vaksinAPI } from '../lib/api';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import QRGenerator from '../components/QR/QRGenerator';
import LoadingTable from '../components/common/LoadingTable';

interface Kambing {
  id_kambing: string;
  keturunan: string;
  added_date: string;
  vaksin_id: string | null;
  kandang_id: string | null;
  image_path: string | null;
  nama_kandang?: string;
  nama_vaksin?: string;
}

interface Kandang {
  id_kandang: string;
  nama_kandang: string;
  added_date: string;
}

interface Vaksin {
  id_vaksin: string;
  nama_vaksin: string;
  added_at: string;
}

const schema = yup.object({
  keturunan: yup.string().required('Keturunan harus diisi'),
  kandang_id: yup.string().nullable(),
  vaksin_id: yup.string().nullable(),
});

type FormData = {
  keturunan: string;
  kandang_id: string | null;
  vaksin_id: string | null;
};

const Kambing = () => {
  const [kambingList, setKambingList] = useState<Kambing[]>([]);
  const [kandangList, setKandangList] = useState<Kandang[]>([]);
  const [vaksinList, setVaksinList] = useState<Vaksin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showQR, setShowQR] = useState<string | null>(null);
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [kambingResult, kandangResult, vaksinResult] = await Promise.all([
        kambingAPI.getAll(),
        kandangAPI.getAll(),
        vaksinAPI.getAll(),
      ]);

      setKambingList(kambingResult || []);
      setKandangList(kandangResult || []);
      setVaksinList(vaksinResult || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editingId) {
        await kambingAPI.update(editingId, {
          keturunan: data.keturunan,
          kandang_id: data.kandang_id || null,
          vaksin_id: data.vaksin_id || null,
        });
        toast.success('Data kambing berhasil diperbarui');
      } else {
        await kambingAPI.create({
          keturunan: data.keturunan,
          kandang_id: data.kandang_id || null,
          vaksin_id: data.vaksin_id || null,
        });
        toast.success('Data kambing berhasil ditambahkan');
      }

      reset();
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Error saving kambing:', error);
      toast.error('Gagal menyimpan data kambing');
    }
  };

  const handleEdit = (kambing: Kambing) => {
    setEditingId(kambing.id_kambing);
    reset({
      keturunan: kambing.keturunan,
      kandang_id: kambing.kandang_id,
      vaksin_id: kambing.vaksin_id,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data kambing ini?')) return;

    try {
      await kambingAPI.delete(id);
      toast.success('Data kambing berhasil dihapus');
      fetchData();
    } catch (error) {
      console.error('Error deleting kambing:', error);
      toast.error('Gagal menghapus data kambing');
    }
  };

  const filteredKambing = kambingList.filter((kambing) =>
    kambing.keturunan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manajemen Kambing</h1>
            <p className="text-sm sm:text-base text-gray-600">Kelola data kambing ternak</p>
          </div>
          <div className="w-full sm:w-auto">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
        
        <div className="mb-4 sm:mb-6">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        
        <LoadingTable columns={6} rows={8} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manajemen Kambing</h1>
          <p className="text-sm sm:text-base text-gray-600">Kelola data kambing ternak</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            reset();
          }}
          className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Tambah Kambing</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kambing..."
            className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Kambing
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keturunan
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Kandang
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Vaksin
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Tanggal Ditambahkan
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredKambing.map((kambing) => (
                <tr key={kambing.id_kambing} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                    {kambing.display_id || kambing.id_kambing.substring(0, 8) + '...'}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {kambing.keturunan}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                    {kambing.nama_kandang || 'Belum ditentukan'}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                    {kambing.nama_vaksin || 'Belum divaksin'}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden lg:table-cell">
                    {format(new Date(kambing.added_date), 'dd MMMM yyyy', { locale: id })}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1 sm:space-x-2">
                    <button
                      onClick={() => setShowQR(kambing.display_id || kambing.id_kambing)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(kambing)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(kambing.id_kambing)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    </div>
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
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Kambing' : 'Tambah Kambing'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keturunan
                </label>
                <input
                  {...register('keturunan')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Masukkan keturunan kambing"
                />
                {errors.keturunan && (
                  <p className="text-red-500 text-sm mt-1">{errors.keturunan.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kandang
                </label>
                <select
                  {...register('kandang_id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Pilih kandang (opsional)</option>
                  {kandangList.map((kandang) => (
                    <option key={kandang.id_kandang} value={kandang.id_kandang}>
                      {kandang.nama_kandang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vaksin
                </label>
                <select
                  {...register('vaksin_id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Pilih vaksin (opsional)</option>
                  {vaksinList.map((vaksin) => (
                    <option key={vaksin.id_vaksin} value={vaksin.id_vaksin}>
                      {vaksin.nama_vaksin}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    reset();
                  }}
                  className="flex-1 px-4 py-2 text-sm sm:text-base text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingId ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold">QR Code Kambing</h3>
              <button
                onClick={() => setShowQR(null)}
                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl"
              >
                ×
              </button>
            </div>
            <div className="text-center">
              <QRGenerator
                value={showQR}
                label={`Kambing_${showQR}`}
                size={200}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kambing;