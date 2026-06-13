import { Outlet } from "react-router";


function MainLayout() {
  return (
    <div>
      {/* Removido o <h1> daqui para não duplicar com o Logo */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;