// src/components/Layout/Layout.tsx
import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

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
    <div className="min-h-screen flex bg-[#EFEFF4]">
      {/* Sidebar */}
      <aside
        className={`bg-white flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "w-[220px]" : "w-[72px]"
        }`}
        style={{
          boxShadow: "2px 0px 8px 0px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Верхняя часть */}
        <div className="flex flex-col px-[10px] pt-[20px] pb-[10px]">
          {/* Логотип (мешок с деньгами) */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`flex items-center rounded-[14px] transition-colors ${
              isSidebarOpen
                ? "w-full px-[12px] gap-[12px] h-[44px]"
                : "w-[52px] h-[44px] mx-auto justify-center"
            } hover:bg-gray-50`}
          >
            <span className="text-2xl flex-shrink-0">💰</span>
            {isSidebarOpen && (
              <span
                className="text-[20px] font-bold whitespace-nowrap"
                style={{
                  color: "#18184C",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  lineHeight: "100%",
                }}
              >
                Dashboard
              </span>
            )}
          </button>

          {/* Разделитель после Dashboard (только когда открыт) */}
          {isSidebarOpen && (
            <div
              className="w-full h-[1px] my-[24px]"
              style={{ backgroundColor: "#E3E4EA" }}
            />
          )}

          {/* Увеличенный отступ когда сайдбар закрыт */}
          {!isSidebarOpen && <div className="h-[24px]" />}

          {/* Навигация */}
          {isSidebarOpen && (
            <p
              className="text-[10px] font-medium uppercase tracking-wider mb-[8px] px-[12px]"
              style={{ color: "#8E93A1", fontFamily: "Inter, sans-serif" }}
            >
              Menu
            </p>
          )}

          <nav className="flex flex-col gap-[4px]">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center rounded-[14px] transition-all
                  ${
                    isSidebarOpen
                      ? "px-[12px] w-full gap-[12px]"
                      : "w-[52px] mx-auto flex-col gap-[4px] justify-center"
                  }
                  h-[58px] py-[10px]
                  ${isActive ? "bg-[#E7EEFF]" : "hover:bg-gray-50"}
                `}
              >
                {({ isActive }) => (
                  <>
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    {isSidebarOpen ? (
                      <span
                        className="text-[10px] font-semibold whitespace-nowrap"
                        style={{
                          color: isActive ? "#2563EB" : "#8E93A1",
                          fontFamily: "Inter, sans-serif",
                          fontWeight: isActive ? 600 : 500,
                        }}
                      >
                        {item.label}
                      </span>
                    ) : (
                      <span
                        className="text-[10px] whitespace-nowrap"
                        style={{
                          color: isActive ? "#2563EB" : "#8E93A1",
                          fontFamily: "Inter, sans-serif",
                          fontWeight: isActive ? 600 : 500,
                        }}
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

        {/* Нижняя часть - Logout */}
        <div className="mt-auto px-[10px] pb-[20px]">
          {/* Разделитель перед Logout (только когда открыт) */}
          {isSidebarOpen && (
            <div
              className="w-full h-[1px] mb-[16px]"
              style={{ backgroundColor: "#E3E4EA" }}
            />
          )}

          <button
            onClick={handleLogout}
            className={`flex items-center rounded-[14px] transition-all ${
              isSidebarOpen
                ? "px-[12px] w-full gap-[12px]"
                : "w-[52px] mx-auto flex-col gap-[4px] justify-center"
            } h-[54px] py-[10px] hover:bg-gray-50`}
          >
            <span className="text-xl flex-shrink-0">🚪</span>
            {isSidebarOpen ? (
              <span
                className="text-[10px] font-medium whitespace-nowrap"
                style={{
                  color: "#EA3A3A",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                }}
              >
                Logout
              </span>
            ) : (
              <span
                className="text-[10px] whitespace-nowrap"
                style={{
                  color: "#EA3A3A",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                }}
              >
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
