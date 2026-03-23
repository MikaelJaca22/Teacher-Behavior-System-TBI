import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./DashboardLayout.css";

function DashboardLayout({ children }) {
  return (
    <div className="layout-root">
      <Sidebar />
      <div className="layout-body">
        <Navbar />
        <main className="layout-main">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;