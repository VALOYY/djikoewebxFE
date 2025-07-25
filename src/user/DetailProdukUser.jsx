import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { getProductById, addPesanan, uploadImage } from '../api';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import NavbarUser from '../Components/NavbarUser';
import Footer from '../Components/Footer';

const DetailProdukUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produk, setProduk] = useState(null);
  const [jumlah, setJumlah] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    namaPembeli: '',
    nomorTelepon: '',
    alamatLengkap: '',
    pengiriman: 'JNT',
    metodePembayaran: 'QRIS',
    buktiPembayaran: null,
  });

  // URL gambar QRIS (ganti dengan URL gambar QRIS Anda)
  const QRIS_IMAGE_URL = 'https://res.cloudinary.com/dr9ll2z11/image/upload/v1753439751/qris_punyf4.jpg';

  useEffect(() => {
    let unsubscribe;
    const fetchData = async () => {
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData.role !== 'user') {
                setNotification({
                  message: 'Akses ditolak! Halaman ini hanya untuk pengguna.',
                  type: 'error',
                });
                setTimeout(() => navigate('/'), 2000);
                setUser(null);
              } else {
                setUser({ ...currentUser, ...userData });
                setFormData((prev) => ({ ...prev, namaPembeli: userData.name || '' }));
                console.log('Fetching product with ID:', id);
                const product = await getProductById(id);
                if (product) {
                  setProduk(product);
                } else {
                  setNotification({
                    message: 'Produk tidak ditemukan. ID: ' + id,
                    type: 'error',
                  });
                  setTimeout(() => navigate('/produk'), 2000);
                }
              }
            } else {
              setNotification({
                message: 'Data pengguna tidak ditemukan.',
                type: 'error',
              });
              setTimeout(() => navigate('/login'), 2000);
              setUser(null);
            }
          } catch (error) {
            console.error('Error fetching user data or product:', error);
            setNotification({
              message: 'Terjadi kesalahan saat memuat data.',
              type: 'error',
            });
            setTimeout(() => navigate('/produk'), 2000);
            setUser(null);
          }
        } else {
          setNotification({
            message: 'Anda harus login terlebih dahulu.',
            type: 'error',
          });
          setTimeout(() => navigate('/login'), 2000);
          setUser(null);
        }
        setLoading(false);
      });
    };

    fetchData();
    return () => unsubscribe && unsubscribe();
  }, [id, navigate]);

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleBeli = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'buktiPembayaran') {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const calculateTotal = () => {
    const hargaProduk = produk.harga * jumlah;
    const ongkir = formData.pengiriman === 'JNT' ? 10000 : 12000;
    return hargaProduk + ongkir;
  };

  const handleSubmitPesanan = async () => {
    if (!user || !produk) {
      setNotification({
        message: 'Data pengguna atau produk tidak tersedia.',
        type: 'error',
      });
      return;
    }

    if (!formData.namaPembeli || !formData.nomorTelepon || !formData.alamatLengkap || !formData.buktiPembayaran) {
      setNotification({
        message: 'Harap lengkapi semua kolom formulir, termasuk bukti pembayaran.',
        type: 'error',
      });
      return;
    }

    try {
      const total = calculateTotal();
      let buktiPembayaranUrl = null;
      if (formData.buktiPembayaran) {
        buktiPembayaranUrl = await uploadImage(formData.buktiPembayaran);
      }

      await addPesanan({
        namaUser: formData.namaPembeli,
        produk: produk.nama,
        tanggal: new Date().toISOString().slice(0, 10),
        jumlah: jumlah,
        total: total,
        status: 'Menunggu',
        userId: user.uid,
        nomorTelepon: formData.nomorTelepon,
        alamatLengkap: formData.alamatLengkap,
        pengiriman: formData.pengiriman,
        metodePembayaran: formData.metodePembayaran,
        buktiPembayaran: buktiPembayaranUrl,
      });
      setNotification({
        message: `Pesanan untuk ${produk.nama} berhasil dibuat.`,
        type: 'success',
      });
      setShowForm(false);
      setTimeout(() => navigate('/riwayat'), 2000);
    } catch (error) {
      console.error('Error creating pesanan:', error);
      setNotification({
        message: error.message || 'Gagal membuat pesanan.',
        type: 'error',
      });
    }
  };

  const handleBatal = () => {
    setShowForm(false);
    setFormData({
      namaPembeli: user?.name || '',
      nomorTelepon: '',
      alamatLengkap: '',
      pengiriman: 'JNT',
      metodePembayaran: 'QRIS',
      buktiPembayaran: null,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <p className="text-amber-800 text-lg animate-pulse">Memuat detail produk...</p>
      </div>
    );
  }

  if (!produk) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <p className="text-amber-800 text-lg">Produk tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      <NavbarUser />
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center gap-10">
        {notification.message && (
          <div
            className={`mb-4 p-4 rounded-lg text-white text-center ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {notification.message}
          </div>
        )}
        {!showForm ? (
          <>
            <img
              src={produk.gambar || 'https://via.placeholder.com/400x400.png?text=No+Image'}
              alt={produk.nama}
              className="w-full md:w-1/2 rounded-xl shadow-lg"
            />
            <div className="space-y-4 w-full md:w-1/2">
              <h1 className="text-3xl font-bold text-amber-900">{produk.nama}</h1>
              <p className="text-amber-800">{produk.deskripsi || 'Tidak ada deskripsi'}</p>
              <p className="text-2xl font-semibold text-amber-900">
                Rp {Number(produk.harga).toLocaleString('id-ID')}
              </p>
              <div className="flex items-center space-x-4">
                <label className="text-amber-900 font-medium">Jumlah:</label>
                <input
                  type="number"
                  min="1"
                  value={jumlah}
                  onChange={(e) => setJumlah(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 p-2 border rounded shadow focus:outline-none focus:ring focus:border-amber-500"
                />
              </div>
              <button
                onClick={handleBeli}
                className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-full font-semibold shadow transition transform hover:scale-105"
              >
                Beli Sekarang
              </button>
            </div>
          </>
        ) : (
          <div className="w-full bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">Formulir Pemesanan</h2>
            <div className="space-y-4">
              <div>
                <label className="text-amber-900 font-medium">Nama Pembeli</label>
                <input
                  type="text"
                  name="namaPembeli"
                  value={formData.namaPembeli}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded shadow focus:outline-none focus:ring focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="text-amber-900 font-medium">Nomor Telepon</label>
                <input
                  type="tel"
                  name="nomorTelepon"
                  value={formData.nomorTelepon}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded shadow focus:outline-none focus:ring focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="text-amber-900 font-medium">Alamat Lengkap</label>
                <textarea
                  name="alamatLengkap"
                  value={formData.alamatLengkap}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded shadow focus:outline-none focus:ring focus:border-amber-500"
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="text-amber-900 font-medium">Pengiriman</label>
                <select
                  name="pengiriman"
                  value={formData.pengiriman}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded shadow focus:outline-none focus:ring focus:border-amber-500"
                >
                  <option value="JNT">JNT (Rp 10,000)</option>
                  <option value="JNE">JNE (Rp 12,000)</option>
                </select>
              </div>
              <div>
                <label className="text-amber-900 font-medium">Metode Pembayaran</label>
                <select
                  name="metodePembayaran"
                  value={formData.metodePembayaran}
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded shadow focus:outline-none focus:ring focus:border-amber-500"
                >
                  <option value="QRIS">QRIS</option>
                </select>
                {formData.metodePembayaran === 'QRIS' && (
                  <div className="mt-2">
                    <p className="text-amber-800 text-sm mb-2">Silakan scan kode QRIS berikut untuk pembayaran:</p>
                    <img
                      src={QRIS_IMAGE_URL}
                      alt="Kode QRIS"
                      className="w-48 h-auto rounded-lg shadow-sm"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-amber-900 font-medium">Upload Bukti Pembayaran</label>
                <input
                  type="file"
                  name="buktiPembayaran"
                  accept="image/*"
                  onChange={handleFormChange}
                  className="w-full p-2 border rounded shadow focus:outline-none focus:ring focus:border-amber-500"
                  required
                />
                {formData.buktiPembayaran && (
                  <img
                    src={URL.createObjectURL(formData.buktiPembayaran)}
                    alt="Bukti Pembayaran"
                    className="mt-2 w-32 h-32 object-cover rounded"
                  />
                )}
              </div>
              <div>
                <h3 className="text-amber-900 font-medium">Rincian Harga</h3>
                <p className="text-amber-800">
                  Harga Produk: Rp {Number(produk.harga * jumlah).toLocaleString('id-ID')}
                </p>
                <p className="text-amber-800">
                  Ongkos Kirim ({formData.pengiriman}): Rp{' '}
                  {Number(formData.pengiriman === 'JNT' ? 10000 : 12000).toLocaleString('id-ID')}
                </p>
                <p className="text-amber-800 font-semibold">
                  Total: Rp {Number(calculateTotal()).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleSubmitPesanan}
                  className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-full font-semibold shadow transition transform hover:scale-105"
                >
                  Submit Pemesanan
                </button>
                <button
                  onClick={handleBatal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-semibold shadow transition transform hover:scale-105"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default DetailProdukUser;