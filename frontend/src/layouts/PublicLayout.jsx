import { Outlet } from "react-router";


function PublicLayout() {
  return (
    <div>
      {/* Removido o <h1> daqui para não duplicar com o Logo */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;