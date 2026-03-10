import { useEffect, useState } from "react";
import ContactModal from "../Modal/ContactModal";
import Table from "../Table/Table";
import axios from "axios";
import { baseURL } from "../../Utils/baseURL";
import { useNavigate } from "react-router-dom";

const Admin = () => {
    // const [contact, setContact] = useState([])
    const [contacts, setContacts] = useState([])
    const [activities, setActivities] = useState([])
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const navigate = useNavigate()

    const handleLogout = () => {
        axios({
            url: `${baseURL}/api/v1/user/logout`,
            method: 'POST',
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('user')}`
            }
        }).then((res) => {
            if (res.status === 200) {
                localStorage.removeItem('user');
                alert(res.data.message);
                navigate('/');
            }
        }).catch((err) => {
            console.log(err);
            const message = err.response?.data?.message;
            const code = err?.response?.status;
            alert(`${message}:${code}`);
        })
    };

    useEffect(() => {
        axios({
            url: `${baseURL}/api/v1/contact/getContacts`,
            method: 'GET',
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('user')}`
            }
        }).then((res) => {
            if (res.status === 200) {
                // setContact(res.data.data.contact);
                setContacts(res.data.data.contacts);
                setSelectedContact(null);
            }
        }).catch((err) => {
            // setContact([])
            setContacts([])
        })

        axios({
            url: `${baseURL}/api/v1/contact/getActivity`,
            method: 'GET',
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('user')}`
            }
        }).then((res) => {
            if (res.status === 200) {
                setActivities(res.data.data.getActivities);
            }
        }).catch((err) => {
            setActivities([])
        })

    }, [])

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

    // Helper: get initials from name
    const getInitials = (name = "") =>
        name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    // Helper: format ISO date to readable string
    const formatDate = (isoStr) => {
        if (!isoStr) return "-";
        const d = new Date(isoStr);
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    function Avatar({ initials, index, size = 36 }) {
        return (
            <div style={{
                width: size, height: size, borderRadius: "50%",
                background: avatarColors[index % avatarColors.length],
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: size * 0.35, flexShrink: 0, fontFamily: "inherit"
            }}>{initials}</div>
        );
    }

    function StatusBadge({ status }) {
        const style = statusColors[status] || { bg: "#e5e7eb", color: "#374151" };
        return (
            <span style={{
                background: style.bg, color: style.color,
                padding: "3px 10px", borderRadius: 5, fontSize: 12, fontWeight: 600
            }}>{status}</span>
        );
    }

    // filteredContacts uses `contacts` (full detail objects from API)
    const filteredContacts = contacts.filter(c =>
        (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || "").includes(search) ||
        (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.company || "").toLowerCase().includes(search.toLowerCase())
    );

    const menuItem = {
        padding: "10px 14px",
        cursor: "pointer",
        borderBottom: "1px solid #f1f5f9"
    };

    return (
        <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f1f5f9", minHeight: "100vh", color: "#1e293b" }}>
            {/* Navbar */}
            <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", padding: "0 24px", height: 56, gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#2563eb", color: "#fff", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 15, marginRight: 24 }}>
                    <span style={{ fontSize: 18 }}>👥</span> CRM
                </div>
                {navItems.map(item => (
                    <button key={item} onClick={() => setActiveNav(item)} style={{
                        background: "none", border: "none", cursor: "pointer", padding: "6px 14px",
                        fontWeight: activeNav === item ? 700 : 500, color: activeNav === item ? "#2563eb" : "#64748b",
                        borderBottom: activeNav === item ? "2px solid #2563eb" : "2px solid transparent",
                        fontSize: 14, transition: "all 0.15s"
                    }}>{item}</button>
                ))}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, position: "relative" }}>

                    <span style={{ fontSize: 20, cursor: "pointer" }}>🔔</span>

                    <button
                        onClick={() => setIsContactModalOpen(true)}
                        style={{
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 18px",
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: "pointer"
                        }}
                    >
                        + Add Contact
                    </button>

                    {/* USER AVATAR */}
                    <div
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "#2563eb",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            cursor: "pointer",
                            userSelect: "none"
                        }}
                    >
                        U
                    </div>

                    {/* DROPDOWN */}
                    {userMenuOpen && (
                        <div
                            style={{
                                position: "absolute",
                                top: 48,
                                right: 0,
                                width: 180,
                                background: "#fff",
                                borderRadius: 10,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                border: "1px solid #e2e8f0",
                                overflow: "hidden",
                                fontSize: 14
                            }}
                        >
                            <div style={menuItem}>👤 Profile</div>
                            <div style={menuItem}>🔑 Change Password</div>
                            <div style={menuItem}>⚙️ Settings</div>
                            <div style={{ ...menuItem, color: "#ef4444" }} onClick={handleLogout}>
                                🚪 Logout
                            </div>
                        </div>
                    )}

                </div>

                <ContactModal
                    show={isContactModalOpen}
                    onClose={() => setIsContactModalOpen(false)}
                />
            </nav>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Contact List */}
                <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px #0001", padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Contact List <span style={{ fontSize: 14, color: "#94a3b8" }}>ℹ️</span></h2>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <div style={{ position: "relative" }}>
                                <input
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search"
                                    style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px 7px 32px", fontSize: 14, outline: "none", width: 200 }}
                                />
                                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }}>🔍</span>
                            </div>
                            <button style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 16 }}>🔄</button>
                            <button style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                                ▼ Filters
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e2e8f0", marginBottom: 16 }}>
                        {tabs.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                background: "none", border: "none", cursor: "pointer",
                                padding: "8px 18px", fontWeight: activeTab === tab ? 700 : 500,
                                color: activeTab === tab ? "#2563eb" : "#64748b",
                                borderBottom: activeTab === tab ? "2px solid #2563eb" : "2px solid transparent",
                                fontSize: 14, transition: "all 0.15s", marginBottom: -1
                            }}>{tab}</button>
                        ))}
                    </div>

                    {/* Table */}
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

                {/* Middle Row: Contact Details + Activity Timeline + Import Summary */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {/* Contact Details */}
                    <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px #0001", padding: 20 }}>

                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Contact Details</h3>
                            {selectedContact && (
                                <div style={{ display: "flex", gap: 10, color: "#94a3b8", cursor: "pointer" }}>
                                    ↗️
                                </div>
                            )}
                        </div>

                        {/* NO CONTACT SELECTED */}
                        {!selectedContact && (
                            <div
                                style={{
                                    height: 250,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#94a3b8",
                                    fontSize: 15
                                }}
                            >
                                <div style={{ fontSize: 40, marginBottom: 10 }}>👤</div>
                                <div style={{ fontWeight: 600 }}>No Contact Selected</div>
                                <div style={{ fontSize: 13 }}>Select a contact to view details</div>
                            </div>
                        )}

                        {/* CONTACT DETAILS */}
                        {selectedContact && (
                            <>
                                {/* Header */}
                                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                                    <Avatar
                                        initials={getInitials(selectedContact.name)}
                                        index={selectedContact.uid?.charCodeAt(0) || 0}
                                        size={52}
                                    />

                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 17 }}>{selectedContact.name}</div>
                                        <div style={{ color: "#64748b", fontSize: 13 }}>{selectedContact.company}</div>
                                    </div>

                                    <div style={{ marginLeft: "auto" }}>
                                        <StatusBadge status={selectedContact.status} />
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>

                                    <div style={{ display: "flex", gap: 10 }}>
                                        <span>📱</span>
                                        <span>{selectedContact.phone}</span>
                                    </div>

                                    <div style={{ display: "flex", gap: 10 }}>
                                        <span>✉️</span>
                                        <span style={{ color: "#2563eb" }}>{selectedContact.email}</span>
                                    </div>

                                    <div style={{ display: "flex", gap: 10 }}>
                                        <span>💼</span>
                                        <span>{selectedContact.company}</span>
                                    </div>

                                    <div style={{ display: "flex", gap: 10 }}>
                                        <span>🔗</span>
                                        <span style={{ color: "#2563eb" }}>
                                            {selectedContact.profileURL || "—"}
                                        </span>
                                    </div>

                                    <div style={{ display: "flex", gap: 10 }}>
                                        <span>📣</span>
                                        <span>{selectedContact.source}</span>
                                    </div>

                                    <div style={{ display: "flex", gap: 10 }}>
                                        <span>📅</span>
                                        <span>Created: {formatDate(selectedContact.createdAt)}</span>
                                    </div>

                                </div>

                                {/* ACTIVITIES TABLE */}
                                <div>
                                    <h4 style={{ fontSize: 14, marginBottom: 10 }}>Activity History</h4>

                                    <table
                                        style={{
                                            width: "100%",
                                            borderCollapse: "collapse",
                                            fontSize: 13
                                        }}
                                    >
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
                                                    <td style={{ padding: 8 }}>
                                                        {formatDate(selectedContact.activities.dates[i])}
                                                    </td>

                                                    <td style={{ padding: 8 }}>
                                                        {act}
                                                    </td>

                                                    <td style={{ padding: 8 }}>
                                                        {selectedContact.activities.message[i]}
                                                    </td>

                                                    <td style={{ padding: 8 }}>
                                                        <StatusBadge status={selectedContact.activities.status[i]} />
                                                    </td>
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
                                <div
                                    style={{
                                        height: 200,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#94a3b8",
                                        flexDirection: "column",
                                        gap: 6
                                    }}
                                >
                                    <div style={{ fontSize: 30 }}>📭</div>
                                    <div>No Activity Found</div>
                                </div>
                            )}

                            {activities.length > 0 && (
                                <div style={{ position: "relative", paddingLeft: 20 }}>

                                    {/* vertical line */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: 8,
                                            top: 0,
                                            bottom: 0,
                                            width: 2,
                                            background: "#e2e8f0"
                                        }}
                                    />

                                    {activities.map((act, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                display: "flex",
                                                gap: 12,
                                                marginBottom: 20,
                                                position: "relative"
                                            }}
                                        >
                                            {/* timeline dot */}
                                            <div
                                                style={{
                                                    width: 16,
                                                    height: 16,
                                                    borderRadius: "50%",
                                                    background: "#2563eb",
                                                    border: "3px solid #fff",
                                                    boxShadow: "0 0 0 2px #e2e8f0",
                                                    marginTop: 4,
                                                    zIndex: 1
                                                }}
                                            />

                                            {/* activity card */}
                                            <div
                                                style={{
                                                    background: "#f8fafc",
                                                    borderRadius: 10,
                                                    padding: "10px 14px",
                                                    flex: 1,
                                                    fontSize: 14
                                                }}
                                            >
                                                <div style={{ fontWeight: 600 }}>
                                                    {formatDate(act.date)} — {act.activity} <span style={{ color: "#2563eb" }}>{act.name}</span>
                                                </div>

                                                <div style={{ color: "#64748b", marginTop: 3 }}>
                                                    Message: {act.message}
                                                </div>
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
                                <button style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "9px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Import</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Admin;
