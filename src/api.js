import { db, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from './firebase';
import { doc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';

// Cloudinary config
const CLOUDINARY_CLOUD_NAME = 'dr9ll2z11';
const CLOUDINARY_UPLOAD_PRESET = 'djikoe';

export const register = async (email, password, name, role = 'user') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name: name,
      email: email,
      role: role,
      createdAt: new Date().toISOString(),
    });
    return userCredential;
  } catch (error) {
    throw new Error(error.code || 'Gagal registrasi');
  }
};

export const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(error.code || 'Gagal login');
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error('Gagal logout');
  }
};

export const addProduct = async (productData) => {
  try {
    const productRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: new Date().toISOString(),
    });
    return { id: productRef.id, ...productData };
  } catch (error) {
    throw new Error(error.code || 'Gagal menambah produk');
  }
};

export const getProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return products;
  } catch (error) {
    throw new Error(error.code || 'Gagal mengambil data produk');
  }
};

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Gagal upload gambar');
    }
    return data.secure_url;
  } catch (error) {
    throw new Error('Gagal upload gambar: ' + error.message);
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, {
      ...productData,
      updatedAt: new Date().toISOString(),
    });
    return { id, ...productData };
  } catch (error) {
    throw new Error(error.code || 'Gagal memperbarui produk');
  }
};

export const deleteProduct = async (id) => {
  try {
    const productRef = doc(db, 'products', id);
    await deleteDoc(productRef);
  } catch (error) {
    throw new Error(error.code || 'Gagal menghapus produk');
  }
};

export const getPesanan = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'pesanan'));
    const pesanan = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return pesanan;
  } catch (error) {
    throw new Error(error.code || 'Gagal mengambil data pesanan');
  }
};

export const getPesananByUser = async (userId) => {
  try {
    const ordersRef = collection(db, 'pesanan');
    const q = query(ordersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return orders;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw new Error('Gagal memuat riwayat pesanan.');
  }
};

export const updatePesanan = async (id, pesananData) => {
  try {
    const pesananRef = doc(db, 'pesanan', id);
    await updateDoc(pesananRef, {
      ...pesananData,
      updatedAt: new Date().toISOString(),
    });
    return { id, ...pesananData };
  } catch (error) {
    throw new Error(error.code || 'Gagal memperbarui pesanan');
  }
};

export const deletePesanan = async (id) => {
  try {
    const pesananRef = doc(db, 'pesanan', id);
    await deleteDoc(pesananRef);
  } catch (error) {
    throw new Error(error.code || 'Gagal menghapus pesanan');
  }
};

export const addPesanan = async (pesananData) => {
  try {
    const pesananRef = await addDoc(collection(db, 'pesanan'), {
      ...pesananData,
      status: 'Menunggu',
      createdAt: new Date().toISOString(),
    });
    return { id: pesananRef.id, ...pesananData };
  } catch (error) {
    throw new Error(error.code || 'Gagal menambah pesanan');
  }
};

export const getProductById = async (id) => {
  try {
    const productRef = doc(db, 'products', id);
    const docSnap = await getDoc(productRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Gagal mengambil data produk.');
  }
};

export const getStatistik = async () => {
  try {
    // Total Pesanan
    const pesananSnapshot = await getDocs(collection(db, 'pesanan'));
    const totalPesanan = pesananSnapshot.size;

    // Total Produk
    const produkSnapshot = await getDocs(collection(db, 'products'));
    const totalProduk = produkSnapshot.size;

    // Pendapatan Bulan Ini (Juli 2025)
    const currentMonth = '2025-07'; // Sesuaikan dengan tanggal saat ini
    let pendapatanBulanIni = 0;
    pesananSnapshot.forEach((doc) => {
      const pesanan = doc.data();
      if (pesanan.tanggal && pesanan.tanggal.startsWith(currentMonth)) {
        pendapatanBulanIni += Number(pesanan.total) || 0;
      }
    });

    // Total User (hanya role 'user')
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('role', '==', 'user'));
    const userSnapshot = await getDocs(userQuery);
    const totalUser = userSnapshot.size;

    return {
      totalPesanan,
      totalProduk,
      pendapatanBulanIni,
      totalUser,
    };
  } catch (error) {
    console.error('Error fetching statistik:', error);
    throw new Error('Gagal mengambil data statistik');
  }
};