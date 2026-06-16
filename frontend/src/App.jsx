import { Routes, Route } from "react-router";

import PublicLayout from "./layouts/PublicLayout";
import MainLayout from "./layouts/MainLayout";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import LoginSuccess from "./pages/LoginSuccess";
import RegisterSuccess from "./pages/RegisterSuccess";



export default function App() {
  return (

  
        <Routes>

          {/* Páginas públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Área autenticada */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login/success" element={<LoginSuccess />} />
            <Route path="/register/success" element={<RegisterSuccess />} />
          </Route>

        </Routes>

  );
}
