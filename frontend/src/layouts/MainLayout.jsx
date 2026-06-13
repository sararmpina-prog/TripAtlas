import { Outlet } from "react-router";
import Header from "../components/Header";

function MainLayout() {
  return (
    <div>
      <Header />

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;