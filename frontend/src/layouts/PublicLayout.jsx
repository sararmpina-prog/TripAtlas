import { Outlet } from "react-router";


function PublicLayout() {
  return (
    <div>
      <h1>TRIPATLAS</h1>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;