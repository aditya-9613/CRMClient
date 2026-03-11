import { useEffect, useState, useRef } from "react";
import ContactModal from "../Modal/ContactModal";
import Table from "../Table/Table";
import axios from "axios";
import { baseURL } from "../../Utils/baseURL";
import { useNavigate } from "react-router-dom";
import Form from 'react-bootstrap/Form'

const Admin = () => {
    const [contacts, setContacts] = useState([]);
    const [activities, setActivities] = useState([]);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();
    const userMenuRef = useRef(null);

    // --- Filter state ---
    const [filterOpen, setFilterOpen] = useState(false);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [appliedFrom, setAppliedFrom] = useState("");
    const [appliedTo, setAppliedTo] = useState("");
    const filterRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        if (loggingOut) return;
        setLoggingOut(true);
        setUserMenuOpen(false);
        axios({
            url: `${baseURL}/api/v1/user/logout`,
            method: "POST",
            withCredentials: true,
            headers: { Authorization: `Bearer ${localStorage.getItem("user")}` },
        })
            .then((res) => {
                if (res.status === 200) {
                    localStorage.removeItem("user");
                    setTimeout(() => {
                        setLoggingOut(false);
                        navigate("/");
                    }, 600);
                }
            })
            .catch((err) => {
                setLoggingOut(false);
                const message = err.response?.data?.message;
                const code = err?.response?.status;
                alert(`${message}:${code}`);
            });
    };

    const fetchContacts = () => {
        axios({
            url: `${baseURL}/api/v1/contact/getContacts`,
            method: "GET",
            withCredentials: true,
            headers: { Authorization: `Bearer ${localStorage.getItem("user")}` },
        })
            .then((res) => {
                if (res.status === 200) {
                    setContacts(res.data.data.contacts);
                    setSelectedContact(null);
                }
            })
            .catch(() => setContacts([]));
    };

    useEffect(() => {
        fetchContacts();
        axios({
            url: `${baseURL}/api/v1/contact/getActivity`,
            method: "GET",
            withCredentials: true,
            headers: { Authorization: `Bearer ${localStorage.getItem("user")}` },
        })
            .then((res) => {
                if (res.status === 200) setActivities(res.data.data.getActivities);
            })
            .catch(() => setActivities([]));
    }, []);

    const [selectedContact, setSelectedContact] = useState(null);
    const [activeTab, setActiveTab] = useState("All Contacts");
    const [activeNav, setActiveNav] = useState("Dashboard");
    const [search, setSearch] = useState("");
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    const tabs = ["All Contacts", "New", "Connected", "Pending", "In Progress", "Completed", "Rejected", "Archived"];
    const navItems = ["Dashboard", "Contacts", "Import", "Reports"];
    const avatarColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b"];

    const statusColors = {
        New: { bg: "#22c55e", color: "#fff" },
        Connected: { bg: "#3b82f6", color: "#fff" },
        Pending: { bg: "#eab308", color: "#fff" },
        "In Progress": { bg: "#86efac", color: "#166534" },
        Completed: { bg: "#bae6fd", color: "#0369a1" },
        Rejected: { bg: "#ef4444", color: "#fff" },
        Archived: { bg: "#9ca3af", color: "#fff" },
    };

    const getInitials = (name = "") =>
        name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

    const formatDate = (isoStr) => {
        if (!isoStr) return "-";
        return new Date(isoStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    function Avatar({ initials, index, size = 36 }) {
        return (
            <div style={{
                width: size, height: size, borderRadius: "50%",
                background: avatarColors[index % avatarColors.length],
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: size * 0.35, flexShrink: 0, fontFamily: "inherit",
            }}>
                {initials}
            </div>
        );
    }

    function StatusBadge({ status }) {
        const style = statusColors[status] || { bg: "#e5e7eb", color: "#374151" };
        return (
            <span style={{
                background: style.bg, color: style.color,
                padding: "3px 10px", borderRadius: 5, fontSize: 12, fontWeight: 600,
            }}>
                {status}
            </span>
        );
    }

    // Apply search + date range filter
    const isDateInRange = (isoStr) => {
        if (!appliedFrom && !appliedTo) return true;
        if (!isoStr) return false;
        const d = new Date(isoStr);
        d.setHours(0, 0, 0, 0);
        if (appliedFrom) {
            const from = new Date(appliedFrom);
            from.setHours(0, 0, 0, 0);
            if (d < from) return false;
        }
        if (appliedTo) {
            const to = new Date(appliedTo);
            to.setHours(23, 59, 59, 999);
            if (d > to) return false;
        }
        return true;
    };

    const filteredContacts = contacts.filter((c) => {
        const matchesSearch =
            (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
            (c.phone || "").includes(search) ||
            (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
            (c.company || "").toLowerCase().includes(search.toLowerCase());

        const matchesDate = isDateInRange(c.createdAt);

        return matchesSearch && matchesDate;
    });

    const handleApplyFilter = () => {
        setAppliedFrom(dateFrom);
        setAppliedTo(dateTo);
        setFilterOpen(false);
    };

    const handleClearFilter = () => {
        setDateFrom("");
        setDateTo("");
        setAppliedFrom("");
        setAppliedTo("");
        setFilterOpen(false);
    };

    const isFilterActive = appliedFrom || appliedTo;

    const menuItem = { padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f1f5f9" };

    const refreshFn = async () => {
        window.location.reload();
    };

    return (
        <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f1f5f9", minHeight: "100vh", color: "#1e293b" }}>

            <style>{`
                @keyframes spinDot {
                    to { transform: rotate(360deg); }
                }
                @keyframes logoutDotBounce {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
                    40%           { transform: translateY(-4px); opacity: 1; }
                }
                @keyframes fadeOverlay {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes dropdownFade {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .filter-input:focus {
                    outline: none;
                    border-color: #2563eb !important;
                    box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
                }
                .filter-apply-btn:hover {
                    background: #1d4ed8 !important;
                }
                .filter-clear-btn:hover {
                    background: #f1f5f9 !important;
                }
            `}</style>

            {/* Full-screen logout overlay */}
            {loggingOut && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 99999,
                    background: "rgba(255,255,255,0.75)",
                    backdropFilter: "blur(6px)",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 16,
                    animation: "fadeOverlay 0.25s ease both",
                }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: "50%",
                        border: "4px solid #e2e8f0",
                        borderTopColor: "#2563eb",
                        animation: "spinDot 0.75s linear infinite",
                    }} />
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", letterSpacing: "0.2px" }}>
                        Logging out…
                    </span>
                </div>
            )}

            {/* Navbar */}
            <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 24px", height: 56, gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#2563eb", color: "#fff", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 15, marginRight: 24 }}>
                    <span style={{ fontSize: 18 }}>👥</span> CRM
                </div>

                {navItems.map((item) => (
                    <button key={item} onClick={() => setActiveNav(item)} style={{
                        background: "none", border: "none", cursor: "pointer", padding: "6px 14px",
                        fontWeight: activeNav === item ? 700 : 500,
                        color: activeNav === item ? "#2563eb" : "#64748b",
                        borderBottom: activeNav === item ? "2px solid #2563eb" : "2px solid transparent",
                        fontSize: 14, transition: "all 0.15s",
                    }}>
                        {item}
                    </button>
                ))}

                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20, cursor: "pointer" }}>🔔</span>

                    <button
                        onClick={() => setIsContactModalOpen(true)}
                        style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
                    >
                        + Add Contact
                    </button>

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
                            }}>
                                <div style={menuItem}>👤 Profile</div>
                                <div style={menuItem}>🔑 Change Password</div>
                                <div style={menuItem}>⚙️ Settings</div>
                                <div
                                    onClick={handleLogout}
                                    style={{
                                        ...menuItem,
                                        borderBottom: "none",
                                        color: loggingOut ? "#94a3b8" : "#ef4444",
                                        display: "flex", alignItems: "center", gap: 8,
                                        cursor: loggingOut ? "not-allowed" : "pointer",
                                        pointerEvents: loggingOut ? "none" : "auto",
                                        transition: "color 0.2s",
                                    }}
                                >
                                    {loggingOut ? (
                                        <>
                                            <span style={{ display: "flex", gap: 3, alignItems: "center" }}>
                                                {[0, 1, 2].map(i => (
                                                    <span key={i} style={{
                                                        width: 5, height: 5, borderRadius: "50%",
                                                        background: "#94a3b8", display: "inline-block",
                                                        animation: "logoutDotBounce 1s ease-in-out infinite",
                                                        animationDelay: `${i * 0.16}s`,
                                                    }} />
                                                ))}
                                            </span>
                                            Logging out…
                                        </>
                                    ) : (
                                        <>🚪 Logout</>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <ContactModal
                    show={isContactModalOpen}
                    onClose={() => setIsContactModalOpen(false)}
                    onContactAdded={fetchContacts}
                />
            </nav>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Contact List */}
                <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px #0001", padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                            Contact List <span style={{ fontSize: 14, color: "#94a3b8" }}>ℹ️</span>
                        </h2>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <div style={{ position: "relative" }}>
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search"
                                    style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px 7px 32px", fontSize: 14, outline: "none", width: 200 }}
                                />
                                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }}>🔍</span>
                            </div>

                            <button
                                style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 16 }}
                                onClick={refreshFn}
                            >
                                🔄
                            </button>

                            {/* ── Filters button + dropdown ── */}
                            <div ref={filterRef} style={{ position: "relative" }}>
                                <button
                                    onClick={() => setFilterOpen((v) => !v)}
                                    style={{
                                        border: isFilterActive ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                                        background: isFilterActive ? "#eff6ff" : "#fff",
                                        color: isFilterActive ? "#2563eb" : "#374151",
                                        borderRadius: 8,
                                        padding: "7px 14px",
                                        cursor: "pointer",
                                        fontSize: 13,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        fontWeight: 600,
                                        transition: "all 0.15s",
                                    }}
                                >
                                    {isFilterActive ? "🔵" : "▼"} Filters
                                    {isFilterActive && (
                                        <span style={{
                                            background: "#2563eb", color: "#fff",
                                            borderRadius: "50%", width: 16, height: 16,
                                            fontSize: 10, display: "inline-flex",
                                            alignItems: "center", justifyContent: "center",
                                            fontWeight: 700,
                                        }}>1</span>
                                    )}
                                </button>

                                {filterOpen && (
                                    <div style={{
                                        position: "absolute",
                                        top: "calc(100% + 8px)",
                                        right: 0,
                                        width: 300,
                                        background: "#fff",
                                        borderRadius: 12,
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                        border: "1px solid #e2e8f0",
                                        padding: 18,
                                        zIndex: 9999,
                                        animation: "dropdownFade 0.18s ease both",
                                    }}>
                                        {/* Header */}
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                                            <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>
                                                📅 Filter by Date
                                            </span>
                                            <span
                                                onClick={() => setFilterOpen(false)}
                                                style={{ cursor: "pointer", color: "#94a3b8", fontSize: 16, lineHeight: 1 }}
                                            >
                                                ✕
                                            </span>
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                            {/* From */}
                                            <div>
                                                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>
                                                    FROM
                                                </label>
                                                <input
                                                    type="date"
                                                    className="filter-input"
                                                    value={dateFrom}
                                                    max={dateTo || undefined}
                                                    onChange={(e) => setDateFrom(e.target.value)}
                                                    style={{
                                                        width: "100%",
                                                        border: "1px solid #e2e8f0",
                                                        borderRadius: 8,
                                                        padding: "8px 12px",
                                                        fontSize: 13,
                                                        color: "#1e293b",
                                                        background: "#f8fafc",
                                                        boxSizing: "border-box",
                                                        transition: "border-color 0.15s, box-shadow 0.15s",
                                                    }}
                                                />
                                            </div>

                                            {/* To */}
                                            <div>
                                                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>
                                                    TO
                                                </label>
                                                <input
                                                    type="date"
                                                    className="filter-input"
                                                    value={dateTo}
                                                    min={dateFrom || undefined}
                                                    onChange={(e) => setDateTo(e.target.value)}
                                                    style={{
                                                        width: "100%",
                                                        border: "1px solid #e2e8f0",
                                                        borderRadius: 8,
                                                        padding: "8px 12px",
                                                        fontSize: 13,
                                                        color: "#1e293b",
                                                        background: "#f8fafc",
                                                        boxSizing: "border-box",
                                                        transition: "border-color 0.15s, box-shadow 0.15s",
                                                    }}
                                                />
                                            </div>

                                            {/* Quick presets */}
                                            <div>
                                                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>
                                                    QUICK SELECT
                                                </label>
                                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                    {[
                                                        { label: "Today", days: 0 },
                                                        { label: "Last 7 days", days: 7 },
                                                        { label: "Last 30 days", days: 30 },
                                                        { label: "Last 90 days", days: 90 },
                                                    ].map(({ label, days }) => {
                                                        const today = new Date();
                                                        const toStr = today.toISOString().split("T")[0];
                                                        const fromDate = new Date();
                                                        fromDate.setDate(today.getDate() - days);
                                                        const fromStr = fromDate.toISOString().split("T")[0];
                                                        const isActive = dateFrom === fromStr && dateTo === toStr;
                                                        return (
                                                            <button
                                                                key={label}
                                                                onClick={() => { setDateFrom(fromStr); setDateTo(toStr); }}
                                                                style={{
                                                                    border: isActive ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                                                                    background: isActive ? "#eff6ff" : "#f8fafc",
                                                                    color: isActive ? "#2563eb" : "#374151",
                                                                    borderRadius: 6,
                                                                    padding: "4px 10px",
                                                                    fontSize: 12,
                                                                    fontWeight: 500,
                                                                    cursor: "pointer",
                                                                    transition: "all 0.12s",
                                                                }}
                                                            >
                                                                {label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div style={{ borderTop: "1px solid #f1f5f9", margin: "2px 0" }} />

                                            {/* Action buttons */}
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button
                                                    className="filter-clear-btn"
                                                    onClick={handleClearFilter}
                                                    style={{
                                                        flex: 1,
                                                        border: "1px solid #e2e8f0",
                                                        background: "#fff",
                                                        color: "#64748b",
                                                        borderRadius: 8,
                                                        padding: "8px",
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        cursor: "pointer",
                                                        transition: "background 0.15s",
                                                    }}
                                                >
                                                    Clear
                                                </button>
                                                <button
                                                    className="filter-apply-btn"
                                                    onClick={handleApplyFilter}
                                                    style={{
                                                        flex: 2,
                                                        border: "none",
                                                        background: "#2563eb",
                                                        color: "#fff",
                                                        borderRadius: 8,
                                                        padding: "8px",
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        cursor: "pointer",
                                                        transition: "background 0.15s",
                                                    }}
                                                >
                                                    Apply Filter
                                                </button>
                                            </div>

                                            {/* Active filter summary */}
                                            {(appliedFrom || appliedTo) && (
                                                <div style={{
                                                    background: "#eff6ff",
                                                    border: "1px solid #bfdbfe",
                                                    borderRadius: 7,
                                                    padding: "7px 10px",
                                                    fontSize: 12,
                                                    color: "#1d4ed8",
                                                    fontWeight: 500,
                                                }}>
                                                    ✅ Active:{" "}
                                                    {appliedFrom ? formatDate(appliedFrom) : "Any"} → {appliedTo ? formatDate(appliedTo) : "Any"}
                                                    {" "}· <strong>{filteredContacts.length}</strong> result{filteredContacts.length !== 1 ? "s" : ""}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e2e8f0", marginBottom: 16 }}>
                        {tabs.map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                background: "none", border: "none", cursor: "pointer", padding: "8px 18px",
                                fontWeight: activeTab === tab ? 700 : 500,
                                color: activeTab === tab ? "#2563eb" : "#64748b",
                                borderBottom: activeTab === tab ? "2px solid #2563eb" : "2px solid transparent",
                                fontSize: 14, transition: "all 0.15s", marginBottom: -1,
                            }}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    <Table
                        filteredContacts={filteredContacts}
                        selectedContact={selectedContact}
                        setSelectedContact={setSelectedContact}
                        Avatar={Avatar}
                        StatusBadge={StatusBadge}
                        ActiveTab={activeTab}
                        getInitials={getInitials}
                        formatDate={formatDate}
                    />
                </div>

                {/* Middle Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {/* Contact Details */}
                    <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px #0001", padding: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Contact Details</h3>
                            {selectedContact && <div style={{ color: "#94a3b8", cursor: "pointer" }}>↗️</div>}
                        </div>

                        {!selectedContact && (
                            <div style={{ height: 250, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 15 }}>
                                <div style={{ fontSize: 40, marginBottom: 10 }}>👤</div>
                                <div style={{ fontWeight: 600 }}>No Contact Selected</div>
                                <div style={{ fontSize: 13 }}>Select a contact to view details</div>
                            </div>
                        )}

                        {selectedContact && (
                            <>
                                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                                    <Avatar initials={getInitials(selectedContact.name)} index={selectedContact.uid?.charCodeAt(0) || 0} size={52} />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 17 }}>{selectedContact.name}</div>
                                        <div style={{ color: "#64748b", fontSize: 13 }}>{selectedContact.company}</div>
                                    </div>
                                    <div style={{ marginLeft: "auto" }}>
                                        <StatusBadge status={selectedContact.status} />
                                    </div>
                                </div>

                                <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
                                    <div style={{ display: "flex", gap: 10 }}><span>👔</span><span>{selectedContact.designation}</span></div>
                                    <div style={{ display: "flex", gap: 10 }}><span>📱</span><span>{selectedContact.phone}</span></div>
                                    <div style={{ display: "flex", gap: 10 }}><span>✉️</span><span style={{ color: "#2563eb" }}>{selectedContact.email}</span></div>
                                    <div style={{ display: "flex", gap: 10 }}><span>💼</span><span>{selectedContact.company}</span></div>
                                    <div style={{ display: "flex", gap: 10 }}><span>🔗</span><span style={{ color: "#2563eb" }}>{selectedContact.profileURL || "—"}</span></div>
                                    <div style={{ display: "flex", gap: 10 }}><span>📣</span><span>{selectedContact.source}</span></div>
                                    <div style={{ display: "flex", gap: 10 }}><span>📅</span><span>Created: {formatDate(selectedContact.createdAt)}</span></div>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: 14, marginBottom: 10 }}>Activity History</h4>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                        <thead>
                                            <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                                                <th style={{ padding: 8 }}>Date</th>
                                                <th style={{ padding: 8 }}>Activity</th>
                                                <th style={{ padding: 8 }}>Message</th>
                                                <th style={{ padding: 8 }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedContact.activities?.activity?.map((act, i) => (
                                                <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                                                    <td style={{ padding: 8 }}>{formatDate(selectedContact.activities.dates[i])}</td>
                                                    <td style={{ padding: 8 }}>{act}</td>
                                                    <td style={{ padding: 8 }}>{selectedContact.activities.message[i]}</td>
                                                    <td style={{ padding: 8 }}><StatusBadge status={selectedContact.activities.status[i]} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Activity Timeline */}
                        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px #0001", padding: 20 }}>
                            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Activity Timeline</h3>

                            {activities.length === 0 && (
                                <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", flexDirection: "column", gap: 6 }}>
                                    <div style={{ fontSize: 30 }}>📭</div>
                                    <div>No Activity Found</div>
                                </div>
                            )}

                            {activities.length > 0 && (
                                <div style={{ position: "relative", paddingLeft: 20 }}>
                                    <div style={{ position: "absolute", left: 8, top: 0, bottom: 0, width: 2, background: "#e2e8f0" }} />
                                    {activities.map((act, i) => (
                                        <div key={i} style={{ display: "flex", gap: 12, marginBottom: 20, position: "relative" }}>
                                            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#2563eb", border: "3px solid #fff", boxShadow: "0 0 0 2px #e2e8f0", marginTop: 4, zIndex: 1 }} />
                                            <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 14px", flex: 1, fontSize: 14 }}>
                                                <div style={{ fontWeight: 600 }}>
                                                    {formatDate(act.date)} — {act.activity} <span style={{ color: "#2563eb" }}>{act.name}</span>
                                                </div>
                                                <div style={{ color: "#64748b", marginTop: 3 }}>Message: {act.message}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Import Summary */}
                        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px #0001", padding: 20 }}>
                            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700 }}>Import Summary</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", fontSize: 14, marginBottom: 14 }}>
                                {[
                                    ["File Name:", "contacts.csv"], ["Imported By:", "Admin User"],
                                    ["Total Records:", "150"], ["Total Records:", "150"],
                                    ["Successful:", "140"], ["Failed:", "10"],
                                    ["Import Date:", "Mar 10, 2022"], ["", ""],
                                ].map(([l, v], i) => (
                                    <div key={i} style={{ display: "flex", gap: 6 }}>
                                        {l && <span style={{ color: "#64748b" }}>{l}</span>}
                                        {v && <span style={{ fontWeight: 500 }}>{v}</span>}
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <Form.Group controlId="formFile" className="mb-3">
                                    <Form.Label>Import Excel File</Form.Label>
                                    <Form.Control type="file" accept=".xls,.xlsx,.csv" />
                                </Form.Group>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;