import { Outlet } from "react-router";
import PublicFooter from "../components/PublicFooter";

function PublicLayout() {
  return (
    <div>
      <main>
        <Outlet />
        <PublicFooter />
      </main>
    </div>
  );
}

export default PublicLayout;