import { useState } from "react";
import DeleteModal from "../Modal/DeleteModal";
import EditModal from "../Modal/EditModal";

const Table = ({ filteredContacts, selectedContact, setSelectedContact, Avatar, StatusBadge, ActiveTab, getInitials, formatDate }) => {

    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [deleteContact, setDeleteContact] = useState(null);
    const [editContact, setEditContact] = useState(null);

    const handleSort = (key) => {
        setSortConfig(prev =>
            prev.key === key
                ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
                : { key, direction: "asc" }
        );
    };

    const SortArrow = ({ colKey }) => {
        if (sortConfig.key !== colKey) return <span style={{ color: "#cbd5e1", marginLeft: 4, fontSize: 10 }}>▼</span>;
        return <span style={{ color: "#2563eb", marginLeft: 4, fontSize: 10, display: "inline-block", transform: sortConfig.direction === "asc" ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>;
    };

    const tabFilteredContacts = ActiveTab === "All Contacts"
        ? filteredContacts
        : filteredContacts.filter(c => c.status === ActiveTab);

    const sortedContacts = [...tabFilteredContacts].sort((a, b) => {
        if (!sortConfig.key) return 0;
        if (sortConfig.key === "name") {
            return sortConfig.direction === "asc"
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        }
        if (sortConfig.key === "updatedAt") {
            return sortConfig.direction === "asc"
                ? new Date(a.updatedAt) - new Date(b.updatedAt)
                : new Date(b.updatedAt) - new Date(a.updatedAt);
        }
        return 0;
    });

    const headers = [
        { label: "Name", key: "name", sortable: true },
        { label: "Designation", key: "designation", sortable: false },
        { label: "Phone", key: "phone", sortable: false },
        { label: "Email", key: "email", sortable: false },
        { label: "Company", key: "company", sortable: false },
        { label: "Source", key: "source", sortable: false },
        { label: "Status", key: "status", sortable: false },
        { label: "Last Updated", key: "updatedAt", sortable: true },
        { label: "Actions", key: "actions", sortable: false },
    ];

    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ background: "#f8fafc" }}>
                        {headers.map(h => (
                            <th
                                key={h.key}
                                onClick={() => h.sortable && handleSort(h.key)}
                                style={{
                                    padding: "10px 12px", textAlign: "left", fontSize: 13,
                                    fontWeight: 600, color: "#475569", borderBottom: "1px solid #e2e8f0",
                                    cursor: h.sortable ? "pointer" : "default",
                                    userSelect: "none",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {h.label}
                                {h.sortable && <SortArrow colKey={h.key} />}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedContacts.length > 0 ? (
                        sortedContacts.map((c, i) => (
                            <tr
                                key={c.uid}
                                onClick={() => setSelectedContact(c)}
                                style={{
                                    cursor: "pointer",
                                    background: selectedContact?.uid === c.uid ? "#eff6ff" : "#fff",
                                    transition: "background 0.15s"
                                }}
                            >
                                <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <Avatar initials={getInitials(c.name)} index={i} />
                                        <span style={{ color: "#2563eb", fontWeight: 600, fontSize: 14 }}>{c.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: "12px", fontSize: 13, color: "#475569", borderBottom: "1px solid #f1f5f9" }}>
                                     {c.designation || "—"}
                                </td>
                                <td style={{ padding: "12px", fontSize: 13, color: "#475569", borderBottom: "1px solid #f1f5f9" }}>
                                    📱 {c.phone || "—"}
                                </td>
                                <td style={{ padding: "12px", fontSize: 13, color: "#475569", borderBottom: "1px solid #f1f5f9" }}>
                                    {c.email || "—"}
                                </td>
                                <td style={{ padding: "12px", fontSize: 13, color: "#475569", borderBottom: "1px solid #f1f5f9" }}>
                                    {c.company || "—"}
                                </td>
                                <td style={{ padding: "12px", fontSize: 13, color: "#475569", borderBottom: "1px solid #f1f5f9" }}>
                                    {c.source || "—"}
                                </td>
                                <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9" }}>
                                    <StatusBadge status={c.status} />
                                </td>
                                <td style={{ padding: "12px", fontSize: 13, color: "#475569", borderBottom: "1px solid #f1f5f9" }}>
                                    {formatDate(c.updatedAt)}
                                </td>
                                <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9" }}>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditContact(c); }}
                                            style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", background: "#fff", color: "#2563eb", fontWeight: 600 }}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setDeleteContact(c); }}
                                            style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer", background: "#fff" }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                                No contacts found for <strong>{ActiveTab}</strong>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Modals rendered once, outside the table, only when a contact is selected */}
            {deleteContact && (
                <DeleteModal
                    isOpen={true}
                    onClose={() => setDeleteContact(null)}
                    uid={deleteContact.uid}
                    name={deleteContact.name}
                />
            )}

            {editContact && (
                <EditModal
                    isOpen={true}
                    onClose={() => setEditContact(null)}
                    uid={editContact.uid}
                />
            )}
        </div>
    );
}

export default Table;