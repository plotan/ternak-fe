import React, { useState, useEffect } from 'react';
import { Key, Users, Plus, Edit, Trash } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { User } from '../lib/supabase';
import { usersAPI, authAPI } from '../lib/api';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Password saat ini harus diisi'),
  newPassword: yup.string().min(6, 'Password baru minimal 6 karakter').required('Password baru harus diisi'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Konfirmasi password tidak cocok')
    .required('Konfirmasi password harus diisi'),
});

const userSchema = yup.object({
  username: yup.string().required('Username harus diisi'),
  password: yup.string().min(6, 'Password minimal 6 karakter').required('Password harus diisi'),
  role: yup.string().required('Role harus dipilih'),
});

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type UserFormData = {
  username: string;
  password: string;
  role: 'User' | 'Admin';
};

const Settings = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const passwordForm = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
  });

  const userForm = useForm<UserFormData>({
    resolver: yupResolver(userSchema),
  });

  useEffect(() => {
    if (userProfile?.role === 'Admin') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [userProfile]);

  const fetchUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (data: PasswordFormData) => {
    try {
      await authAPI.changePassword(data.currentPassword, data.newPassword);
      toast.success('Password berhasil diubah');
      passwordForm.reset();
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal mengubah password');
    }
  };

  const onSubmitUser = async (data: UserFormData) => {
    try {
      if (editingUserId) {
        await usersAPI.update(editingUserId, {
          username: data.username,
          role: data.role,
        });
        toast.success('Data pengguna berhasil diperbarui');
      } else {
        await usersAPI.create({
          username: data.username,
          password: data.password,
          role: data.role,
        });
        toast.success('Pengguna baru berhasil ditambahkan');
      }

      userForm.reset();
      setShowUserForm(false);
      setEditingUserId(null);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Gagal menyimpan data pengguna');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id_user);
    userForm.reset({
      username: user.username,
      role: user.role,
      password: '', // Don't show current password
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;

    try {
      await usersAPI.delete(userId);
      toast.success('Pengguna berhasil dihapus');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Gagal menghapus pengguna');
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Pengaturan</h1>
          <p className="text-gray-600">Kelola pengaturan akun dan sistem</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-10 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Pengaturan</h1>
        <p className="text-gray-600">Kelola pengaturan akun dan sistem</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Key className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">Ubah Password</h2>
          </div>

          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Saat Ini
              </label>
              <input
                {...passwordForm.register('currentPassword')}
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Baru
              </label>
              <input
                {...passwordForm.register('newPassword')}
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password Baru
              </label>
              <input
                {...passwordForm.register('confirmPassword')}
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Ubah Password
            </button>
          </form>
        </div>

        {/* User Management - Admin Only */}
        {userProfile?.role === 'Admin' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">Manajemen Pengguna</h2>
              </div>
              <button
                onClick={() => {
                  setShowUserForm(true);
                  setEditingUserId(null);
                  userForm.reset();
                }}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah User</span>
              </button>
            </div>

            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id_user} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{user.username}</p>
                    <p className="text-sm text-gray-600">
                      {user.role} • Dibuat {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id_user)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingUserId ? 'Edit Pengguna' : 'Tambah Pengguna'}
            </h3>
            <form onSubmit={userForm.handleSubmit(onSubmitUser)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  {...userForm.register('username')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {userForm.formState.errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {userForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              {!editingUserId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    {...userForm.register('password')}
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {userForm.formState.errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {userForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  {...userForm.register('role')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Pilih role</option>
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
                {userForm.formState.errors.role && (
                  <p className="text-red-500 text-sm mt-1">
                    {userForm.formState.errors.role.message}
                  </p>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserForm(false);
                    setEditingUserId(null);
                    userForm.reset();
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingUserId ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;