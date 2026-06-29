import { Outlet } from "react-router";
import PrivateFooter from "../components/PrivateFooter";

function MainLayout() {
  return (
    <div>
      <main>
        <Outlet />
        <PrivateFooter />
      </main>
    </div>
  );
}

export default MainLayout;