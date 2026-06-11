import { Routes, Route } from "react-router";

import PublicLayout from "./layouts/PublicLayout";
import MainLayout from "./layouts/MainLayout";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OnBoarding from "./pages/OnBoarding";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (

  
        <Routes>

          {/* Páginas públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/register/success"
              element={<OnBoarding />}
            />
          </Route>

          {/* Área autenticada */}
          <Route path="/dashboard" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
          </Route>

        </Routes>


  );
}
