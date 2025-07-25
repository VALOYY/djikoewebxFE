import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api'; // Import the login function from api.js
import { auth,db } from '../firebase'; // Import db to fetch user role from Firestore
import { doc, getDoc } from 'firebase/firestore';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setNotification({
        message: 'Email dan Password tidak boleh kosong.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    setNotification({ message: '', type: '' });

    try {
      // Perform Firebase login
      await login(formData.email.trim().toLowerCase(), formData.password.trim());

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (!userDoc.exists()) {
        throw new Error('Data pengguna tidak ditemukan.');
      }
      const userData = userDoc.data();
      const role = userData.role || 'user';

      // Show success notification
      setNotification({
        message: 'Login berhasil! Anda akan diarahkan...',
        type: 'success',
      });

      // Auto-redirect based on role after 2 seconds
      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (role === 'user') {
          navigate('/user', { replace: true });
        } else {
          setNotification({
            message: `Role tidak dikenal (${role}), hubungi admin.`,
            type: 'error',
          });
        }
      }, 2000);
    } catch (error) {
      console.error("Login error:", error);
      setNotification({
        message: error.message || 'Login gagal, periksa email dan password.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 px-4">
      <div className="w-full max-w-md">
        {/* Notification */}
        {notification.message && (
          <div
            className={`mb-4 p-4 rounded-lg text-white text-center ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {notification.message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6 animate-fade-in"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-amber-800 text-center">
            Login ke Akun Anda
          </h2>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-amber-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg p-3 text-base outline-none transition"
            autoComplete="email"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-amber-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg p-3 text-base outline-none transition"
            autoComplete="current-password"
          />
          <button
            type="submit"
            className={`w-full bg-amber-600 hover:bg-amber-700 hover:scale-105 text-white font-semibold rounded-lg p-3 transition duration-300 shadow-lg hover:shadow-xl ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto border border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white font-semibold rounded-lg p-3 transition duration-300"
            >
              Ke Beranda
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto border border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold rounded-lg p-3 transition duration-300"
            >
              Daftar Akun
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;