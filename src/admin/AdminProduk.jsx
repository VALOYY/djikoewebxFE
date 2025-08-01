import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, addProduct, updateProduct, deleteProduct, uploadImage } from '../api';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/outline';
import NavbarAdmin from '../Components/NavbarAdmin';
import Footer from '../Components/Footer';

const AdminProduk = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [produkList, setProdukList] = useState([]);
  const [form, setForm] = useState({ id: null, nama: '', harga: '', deskripsi: '', gambar: '', file: null });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [formErrors, setFormErrors] = useState({ nama: false, harga: false });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (!userDoc.exists()) {
            setNotification({
              message: 'Data pengguna tidak ditemukan.',
              type: 'error',
            });
            setTimeout(() => navigate('/login'), 2000);
            setUser(null);
            setLoading(false);
            return;
          }

          const userData = userDoc.data();
          if (userData.role !== 'admin') {
            setNotification({
              message: 'Akses ditolak! Halaman ini hanya untuk admin.',
              type: 'error',
            });
            setTimeout(() => navigate('/'), 2000);
            setUser(null);
            setLoading(false);
            return;
          }

          setUser({ ...currentUser, ...userData });

          const products = await getProducts();
          setProdukList(products);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user or products:', error);
          setNotification({
            message: 'Terjadi kesalahan saat memuat data.',
            type: 'error',
          });
          setTimeout(() => navigate('/login'), 2000);
          setLoading(false);
        }
      } else {
        setNotification({
          message: 'Anda harus login sebagai admin terlebih dahulu.',
          type: 'error',
        });
        setTimeout(() => navigate('/login'), 2000);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, file });
  };

  const validateForm = () => {
    const errors = { nama: !form.nama, harga: !form.harga };
    setFormErrors(errors);
    return !errors.nama && !errors.harga;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setNotification({
        message: 'Nama dan harga wajib diisi.',
        type: 'error',
      });
      return;
    }

    try {
      let gambarUrl = form.gambar;
      if (form.file) {
        gambarUrl = await uploadImage(form.file);
      }

      let newProdukList;
      if (editMode) {
        await updateProduct(form.id, {
          nama: form.nama,
          harga: parseInt(form.harga) || 0,
          deskripsi: form.deskripsi,
          gambar: gambarUrl,
        });
        newProdukList = produkList.map((item) =>
          item.id === form.id ? { id: form.id, nama: form.nama, harga: parseInt(form.harga), deskripsi: form.deskripsi, gambar: gambarUrl } : item
        );
        setNotification({
          message: `Produk "${form.nama}" berhasil diperbarui.`,
          type: 'success',
        });
        setEditMode(false);
      } else {
        const newProduct = await addProduct({
          nama: form.nama,
          harga: parseInt(form.harga) || 0,
          deskripsi: form.deskripsi,
          gambar: gambarUrl,
        });
        newProdukList = [...produkList, newProduct];
        setNotification({
          message: `Produk "${form.nama}" berhasil ditambahkan.`,
          type: 'success',
        });
      }
      setProdukList(newProdukList);
      setForm({ id: null, nama: '', harga: '', deskripsi: '', gambar: '', file: null });
      setFormErrors({ nama: false, harga: false });
    } catch (error) {
      console.error('Error submitting product:', error);
      setNotification({
        message: error.message || 'Gagal menyimpan produk.',
        type: 'error',
      });
    }
  };

  const handleEdit = (item) => {
    setForm({ ...item, file: null });
    setEditMode(true);
    setFormErrors({ nama: false, harga: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, nama) => {
    const confirmed = window.confirm(`Yakin ingin menghapus produk "${nama}"?`);
    if (!confirmed) return;

    try {
      await deleteProduct(id);
      const updated = produkList.filter((item) => item.id !== id);
      setProdukList(updated);
      setNotification({
        message: `Produk "${nama}" berhasil dihapus.`,
        type: 'success',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      setNotification({
        message: error.message || 'Gagal menghapus produk.',
        type: 'error',
      });
    }
  };

  const handleCancelEdit = () => {
    setForm({ id: null, nama: '', harga: '', deskripsi: '', gambar: '', file: null });
    setEditMode(false);
    setFormErrors({ nama: false, harga: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-amber-50">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-700 text-lg font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-amber-50">
      <NavbarAdmin />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px 6lg:px-12 py-10">
        {notification.message && (
          <div className="fixed top-4 right-4 max-w-md w-full p-4 rounded-xl shadow-lg text-white font-medium text-center animate-pulse text-sm z-50">
            <div
              className={`p-4 rounded-lg ${
                notification.type === 'success' ? 'bg-blue-500' : 'bg-red-600'
              }`}
            >
              {notification.message}
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-800 mb-8 tracking-tight">
          Kelola Produk
        </h1>

        
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            {editMode ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Produk
              </label>
              <input
                type="text"
                placeholder="Masukkan nama produk"
                className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black ${formErrors.nama ? 'border-red-600' : 'border-black-300'}"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
              {formErrors.nama && (
                <p className="text-sm text-red-600 mt-2">Nama wajib diisi.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Produk
              </label>
              <input
                type="number"
                placeholder="Masukkan harga"
                className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black ${formErrors.harga ? 'border-red-600' : 'border-gray-300'}"
                value={form.harga}
                onChange={(e) => setForm({ ...form, harga: e.target.value })}
              />
              {formErrors.harga && (
                <p className="text-sm text-red-600 mt-2">Harga wajib diisi.</p>
              )}
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gambar Produk
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileChange}
                />
                <label
                  for="file-upload"
                  className="cursor-pointer bg-gray-100 p-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  Pilih Gambar
                </label>
                {form.gambar && (
                  <img
                    src={form.gambar}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg shadow-sm"
                  />
                )}
              </div>
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi (opsional)
              </label>
              <textarea
                placeholder="Masukkan deskripsi produk"
                className="w-full p-3 border border-gray-300 bg-gray-50 rounded-lg:ring-2 focus:ring-blue-2 500 focus:border-transparent transition-colors text-black"
                rows="4"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              ></textarea>
            </div>
          </div>
          <div className="mt-6 flex space-x-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium shadow-lg flex items-center space-x-2 transition-transform hover:scale-105"
            >
              <PlusIcon className="h-5 w-5" />
              <span>{editMode ? 'Simpan Perubahan' : 'Tambah Produk'}</span>
            </button>
            {editMode && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-transform hover:scale-105"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nama</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Harga</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Deskripsi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Gambar</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {produkList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-600">
                      Belum ada produk.
                    </td>
                  </tr>
                ) : (
                  produkList.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
                    >
                      <td className="px-6 py-4 text-gray-700">{item.nama}</td>
                      <td className="px-6 py-4 text-gray-700">
                        Rp {Number(item.harga).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{item.deskripsi || '—'}</td>
                      <td className="px-6 py-4">
                        <img
                          src={item.gambar || 'https://via.placeholder.com/64x64.png?text=No+Image'}
                          alt={item.nama}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        />
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg shadow-sm transition-transform hover:scale-105"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.nama)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm transition-transform hover:scale-105"
                          title="Hapus"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminProduk;