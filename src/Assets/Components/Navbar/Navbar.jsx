import { useState, useRef, useEffect } from "react";
import ContactModal from "../Modal/ContactModal";
import { useNavigate, useLocation } from "react-router-dom";
import Logout from "../Logout/Logout";

const Navbar = ({ onContactAdded }) => {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const userMenuRef = useRef(null);

    const navItems = [
        { label: "Dashboard", path: "/admin" },
        { label: "Contacts", path: "/contacts" },
        { label: "Import", path: "/import" },
        { label: "Reports", path: "/reports" },
        { label: "Billing", path: "/billing" },
    ];

    const menuItem = {
        padding: "10px 14px",
        cursor: "pointer",
        borderBottom: "1px solid #f1f5f9",
        fontSize: 14,
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleLogoutEvent = () => {
            setIsLogoutOpen(true);
        };

        window.addEventListener("app-logout", handleLogoutEvent);

        return () => {
            window.removeEventListener("app-logout", handleLogoutEvent);
        };
    }, []);

    return (
        <>
            <style>{`
                @keyframes dropdownFade {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Navbar */}
            <nav style={{
                background: "#fff", borderBottom: "1px solid #e2e8f0",
                display: "flex", alignItems: "center",
                padding: "0 24px", height: 56, gap: 8,
            }}>
                {/* Logo */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "#2563eb", color: "#fff", borderRadius: 8,
                    padding: "6px 14px", fontWeight: 700, fontSize: 15, marginRight: 24,
                }}>
                    <span style={{ fontSize: 18 }}>👥</span> CRM
                </div>

                {/* Nav Links */}
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            style={{
                                background: "none", border: "none", cursor: "pointer",
                                padding: "6px 14px",
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? "#2563eb" : "#64748b",
                                borderBottom: isActive ? "2px solid #2563eb" : "2px solid transparent",
                                fontSize: 14, transition: "all 0.15s",
                            }}
                        >
                            {item.label}
                        </button>
                    );
                })}

                {/* Right side */}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20, cursor: "pointer" }}>🔔</span>

                    <button
                        onClick={() => setIsContactModalOpen(true)}
                        style={{
                            background: "#2563eb", color: "#fff", border: "none",
                            borderRadius: 8, padding: "8px 18px",
                            fontWeight: 600, fontSize: 14, cursor: "pointer",
                        }}
                    >
                        + Add Contact
                    </button>

                    {/* User menu */}
                    <div ref={userMenuRef} style={{ position: "relative", zIndex: 1000 }}>
                        <div
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            style={{
                                width: 36, height: 36, borderRadius: "50%",
                                background: "#2563eb", color: "#fff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 700, cursor: "pointer", userSelect: "none",
                            }}
                        >
                            U
                        </div>

                        {userMenuOpen && (
                            <div style={{
                                position: "absolute", top: 44, right: 0, width: 180,
                                background: "#fff", borderRadius: 10,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                                border: "1px solid #e2e8f0", overflow: "hidden",
                                fontSize: 14, zIndex: 9999,
                                animation: "dropdownFade 0.18s ease both",
                            }}>
                                <div style={menuItem}>👤 Profile</div>
                                <div style={menuItem}>🔑 Change Password</div>
                                <div style={menuItem}>⚙️ Settings</div>

                                {/* Just flip a boolean — Logout owns everything else */}
                                <div
                                    style={{ ...menuItem, color: "#ef4444" }}
                                    onClick={() => {
                                        setIsLogoutOpen(true);
                                        setUserMenuOpen(false);
                                    }}
                                >
                                    🚪 Logout
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <ContactModal
                show={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                onContactAdded={onContactAdded}
            />

            <Logout
                isOpen={isLogoutOpen}
                onClose={() => setIsLogoutOpen(false)}
            />
        </>
    );
};

export default Navbar;