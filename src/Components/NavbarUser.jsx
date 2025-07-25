import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuIcon, XIcon, ChevronDownIcon } from '@heroicons/react/outline';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const NavbarUser = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser({ ...currentUser, ...userDoc.data() });
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="bg-gradient-to-r from-amber-800/90 to-amber-900/90 shadow-lg sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div onClick={() => navigate('/user')} className="flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform">
          <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center shadow-sm hover:animate-pulse">
            <span className="text-white font-bold text-2xl">☕</span>
          </div>
          <span className="text-xl font-bold text-amber-100 tracking-tight">Djikoe Coffee</span>
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-amber-100 focus:outline-none hover:scale-110 transition-transform">
            {isOpen ? <XIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {['/user', '/produk', '/riwayat'].map((path, idx) => (
            <button key={idx} onClick={() => navigate(path)} className="text-amber-100 font-semibold relative hover:text-amber-300 after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-amber-300 after:left-0 after:bottom-[-4px] after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100">
              {path === '/user' ? 'Beranda' : path === '/produk' ? 'Produk' : 'Riwayat'}
            </button>
          ))}

          {user && (
            <div className="relative">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 hover:text-amber-300 transition-colors duration-300">
                <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-medium">
                  {getInitials(user.displayName || user.name || user.email)}
                </div>
                <span className="text-amber-100 font-medium hidden lg:inline">
                  {user.displayName || user.name || user.email.split('@')[0]}
                </span>
                <ChevronDownIcon className={`w-4 h-4 text-amber-100 transform transition-transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-amber-200 rounded-lg shadow-xl py-2 animate-slide-in">
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-amber-900 font-semibold hover:bg-amber-300 transition-colors duration-200">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden px-4 sm:px-6 pb-4 flex flex-col gap-4 bg-gradient-to-r from-amber-800 to-amber-900 animate-slide-in">
          {['/user', '/produk', '/riwayat'].map((path, idx) => (
            <button key={idx} onClick={() => { setIsOpen(false); navigate(path); }} className="text-amber-100 font-semibold relative hover:text-amber-300 transition-colors duration-300">
              {path === '/user' ? 'Beranda' : path === '/produk' ? 'Produk' : 'Riwayat'}
            </button>
          ))}
          {user && (
            <button onClick={() => { setIsOpen(false); handleLogout(); }} className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-105">
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavbarUser;
