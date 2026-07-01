import { Routes, Route } from "react-router";

import PublicLayout from "./layouts/PublicLayout";
import MainLayout from "./layouts/MainLayout";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import RegisterSuccess from "./pages/RegisterSuccess";
import EditProfile from "./pages/EditProfile";
import ErrorPage from "./pages/ErrorPage";


import { ConfirmProvider } from "./context/ConfirmContext"; // Modal de confirmação global para ações críticas
import { ToastProvider } from "./context/ToastContext"; // Para exibir notificações de sucesso, erro ou informação em qualquer parte da aplicação

export default function App() {
  return (
    <ConfirmProvider>
      <ToastProvider>
        <Routes>

<<<<<<< HEAD
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
            <Route path="/register/success" element={<RegisterSuccess />} />
            <Route path="/profile/edit" element={<EditProfile />} />
          </Route>

          {/* APANHA TODOS OS ERROS 404 (Deve ser SEMPRE a última rota do ficheiro) */}
            <Route path="*" element={<ErrorPage code="404" message="Page Not Found" />} />

        </Routes>
      </ToastProvider>
=======
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
          <Route path="/register/success" element={<RegisterSuccess />} />
          <Route path="/profile/edit" element={<EditProfile />} />
        </Route>

        {/* PANHA TODOS OS ERROS 404 (Deve ser SEMPRE a última rota do ficheiro) */}
          <Route path="*" element={<ErrorPage code="404" message="Page Not Found" />} />

        </Routes>
>>>>>>> main
    </ConfirmProvider>
  );
}
