import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import User from "./user/User";
import Produk from "./Pages/Produk";
import RiwayatUser from "./user/RiwayatUser";
import AdminDashboard from "./admin/AdminDashboard";
import AdminProduk from "./admin/AdminProduk";
import AdminPesanan from "./admin/AdminPesanan";
import AdminRoute from "./Components/AdminRoute";
import UserRoute from "./Components/UserRoute"; // <-- ADD THIS
import DetailProdukUser from "./user/DetailProdukUser";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/produk" element={<Produk />} />

        {/* User protected routes */}
        <Route
          path="/user"
          element={
            <UserRoute>
              <User />
            </UserRoute>
          }
        />
        <Route
          path="/riwayat"
          element={
            <UserRoute>
              <RiwayatUser />
            </UserRoute>
          }
        />
        <Route path="/detail-produk-user/:id" element= {<UserRoute><DetailProdukUser /></UserRoute>} />

        {/* Login and Register (public) */}
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Admin protected routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-produk"
          element={
            <AdminRoute>
              <AdminProduk />
            </AdminRoute>
          }
        />
        <Route
          path="/admin-pesanan"
          element={
            <AdminRoute>
              <AdminPesanan />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
  