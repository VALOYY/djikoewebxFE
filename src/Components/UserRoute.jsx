import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebase'; // Import auth and db from api.js
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const UserRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Fetch user role from Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUser({ ...currentUser, ...userDoc.data() });
          } else {
            setNotification({
              message: 'Data pengguna tidak ditemukan.',
              type: 'error',
            });
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setNotification({
            message: 'Terjadi kesalahan saat memuat data pengguna.',
            type: 'error',
          });
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <p className="text-amber-700 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  if (notification.message) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="bg-red-600 text-white p-4 rounded-lg text-center">
          {notification.message}
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'user') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default UserRoute;