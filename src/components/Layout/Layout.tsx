import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "../../styles/layout.scss";

const Layout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    {
      to: "/currencies",
      label: "Exchange Rates",
      shortLabel: "Rates",
      icon: "💱",
    },
    {
      to: "/create-card",
      label: "Kanban Cards",
      shortLabel: "Cards",
      icon: "📋",
    },
  ];

  return (
    <div className="layout">
      <aside
        className={`sidebar ${isSidebarOpen ? "sidebar--expanded" : "sidebar--collapsed"}`}
      >
        <div className="sidebar__top">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`sidebar__logo-btn ${isSidebarOpen ? "sidebar__logo-btn--expanded" : "sidebar__logo-btn--collapsed"}`}
          >
            <span className="sidebar__logo-icon">💰</span>
            {isSidebarOpen && (
              <span className="sidebar__logo-text">Dashboard</span>
            )}
          </button>

          {isSidebarOpen && <div className="sidebar__divider" />}

          {!isSidebarOpen && <div className="sidebar__spacer" />}

          {isSidebarOpen && <p className="sidebar__menu-label">Menu</p>}

          <nav className="sidebar__nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  sidebar__nav-link
                  ${isSidebarOpen ? "sidebar__nav-link--expanded" : "sidebar__nav-link--collapsed"}
                  ${isActive ? "sidebar__nav-link--active" : ""}
                `}
              >
                {({ isActive }) => (
                  <>
                    <span className="sidebar__nav-icon">{item.icon}</span>
                    {isSidebarOpen ? (
                      <span
                        className={`sidebar__nav-label-full ${isActive ? "sidebar__nav-label-full--active" : "sidebar__nav-label-full--inactive"}`}
                      >
                        {item.label}
                      </span>
                    ) : (
                      <span
                        className={`sidebar__nav-label-short ${isActive ? "sidebar__nav-label-short--active" : "sidebar__nav-label-short--inactive"}`}
                      >
                        {item.shortLabel}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar__bottom">
          {isSidebarOpen && <div className="sidebar__divider" />}

          <button
            onClick={handleLogout}
            className={`sidebar__logout-btn ${isSidebarOpen ? "sidebar__logout-btn--expanded" : "sidebar__logout-btn--collapsed"}`}
          >
            <span className="sidebar__logout-icon">🚪</span>
            {isSidebarOpen ? (
              <span className="sidebar__logout-label-full">Logout</span>
            ) : (
              <span className="sidebar__logout-label-short">Logout</span>
            )}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
