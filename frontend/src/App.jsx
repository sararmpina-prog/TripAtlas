import { Routes, Route } from "react-router";

import PublicLayout from "./layouts/PublicLayout";
import MainLayout from "./layouts/MainLayout";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import LoginSuccess from "./pages/LoginSuccess";
import Welcome from "./pages/Welcome";


export default function App() {
  return (

  
        <Routes>

          {/* Páginas públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
             <Route
              path="/login/success"
              element={<LoginSuccess />}
            />
            <Route path="/register" element={<Register />} />
            <Route
              path="/register/success"
              element={<Welcome />}
            />
          </Route>

          {/* Área autenticada */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
          </Route>

        </Routes>


  );
}
