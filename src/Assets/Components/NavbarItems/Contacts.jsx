import { useEffect, useState } from 'react'
import Navbar from '../Navbar/Navbar'
import { useNavigate, Link } from 'react-router-dom'
import checkSubscription from '../../Utils/CheckSubscription'
import axios from 'axios'
import { baseURL } from '../../Utils/baseURL'
import * as XLSX from 'xlsx'
import {
    Container, Row, Col, Button, Table, Badge,
    Spinner, Card
} from 'react-bootstrap'
import { triggerLogout } from '../../Utils/logoutEvent'

// ── Status config: DB value → display label + Bootstrap badge variant ─────────
const STATUS_CONFIG = {
    NEW: { label: "New", bg: "primary", text: undefined },
    CONNECTED: { label: "Connected", bg: "success", text: undefined },
    PENDING: { label: "Pending", bg: "warning", text: "dark" },
    IN_PROGRESS: { label: "In Progress", bg: "info", text: "dark" },
    COMPLETED: { label: "Completed", bg: "success", text: undefined },
    REJECTED: { label: "Rejected", bg: "danger", text: undefined },
    ARCHIVED: { label: "Archived", bg: "secondary", text: undefined },
}

const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || { label: status || "—", bg: "secondary", text: undefined }
    return (
        <Badge bg={config.bg} text={config.text}>
            {config.label}
        </Badge>
    )
}

const Contacts = () => {
    const [showDeleted, setShowDeleted] = useState(false)
    const [showAllContacts, setShowAllContacts] = useState(false)
    const [paymentDone, setPaymentDone] = useState(false)
    const [deletedContacts, setDeletedContacts] = useState([])
    const [allContacts, setAllContacts] = useState([])
    const [loading, setLoading] = useState(true)
    const [allContactsLoading, setAllContactsLoading] = useState(false)

    const navigate = useNavigate()

    const formatDate = (isoString) => {
        if (!isoString) return "—"
        const date = new Date(isoString)
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
    }

    const getDeletedValues = async () => {
        try {
            const res = await axios({
                url: `${baseURL}/api/v1/contact/getDeletedContact`,
                method: 'GET',
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('user')}`
                }
            })
            setDeletedContacts(res.data.data.findContacts)
        } catch (err) {
            const message = err.response?.data?.message
            const code = err?.response?.status
            if (code === 404) {
                setDeletedContacts([])
            } else if (code === 401) {
                triggerLogout()
            } else if (code === 403) {
                setPaymentDone(false)
            } else {
                alert(`${message}: ${code}`)
            }
        }
    }

    // ── Fetch all contacts (replace dummy data with real API call later) ───────
    const handleGetAllContacts = async () => {
        setAllContactsLoading(true)
        setShowAllContacts(true)
        try {
            const res = await axios({
                url: `${baseURL}/api/v1/contact/getContacts`,
                method: 'GET',
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('user')}`
                }
            })
            setAllContacts(res.data.data.contacts)
        } catch (err) {
            const message = err.response?.data?.message;
            const code = err?.response?.status;
            if (code === 401) {
                triggerLogout()
            } else if (code === 403) {
                setPaymentDone(false)
            } else {
                alert(`${message}: ${code}`);
            }
        } finally {
            setAllContactsLoading(false)
        }
    }

    // ── Export all contacts to Excel ──────────────────────────────────────────
    const handleExportExcel = () => {
        if (!allContacts.length) {
            alert("No contacts to export. Please load contacts first.")
            return
        }

        const exportData = allContacts.map((c) => ({
            "Name": c.name || "—",
            "Email": c.email || "—",
            "Phone": c.phone || "—",
            "Company": c.company || "—",
            "Designation": c.designation || "—",
            "Source": c.source || "—",
            "Status": STATUS_CONFIG[c.status]?.label || c.status || "—",
            "LinkedIn": c.profileURL || "—",
            "Date": formatDate(c.updatedAt),
        }))

        const worksheet = XLSX.utils.json_to_sheet(exportData)

        // Auto-fit column widths
        const colWidths = Object.keys(exportData[0]).map((key) => ({
            wch: Math.max(key.length, ...exportData.map((row) => String(row[key]).length)) + 2
        }))
        worksheet['!cols'] = colWidths

        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "All Details")

        // writeFile directly triggers the browser's Save As dialog as a real .xlsx file
        XLSX.writeFile(workbook, "All Details.xlsx")
    }

    useEffect(() => {
        const getData = async () => {
            const value = await checkSubscription()
            setPaymentDone(value.isPremium)
            setLoading(false)
        }
        getData()
        getDeletedValues()
    }, [])

    const handleRetrieve = async (contact) => {
        setLoading(true)
        const message = prompt(`Enter a message before retrieving "${contact.name}"`)
        if (message === null) return

        try {
            axios({
                url: `${baseURL}/api/v1/contact/reteriveContact`,
                method: 'PUT',
                data: { uid: contact.uid, message },
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('user')}`
                }
            }).then((res) => {
                setLoading(false)
                if (res.status === 200) {
                    alert('Contact Reterived Successfully')
                    window.location.reload()
                }
            }).catch((err) => {
                setLoading(false)
                const message = err.response?.data?.message;
                const code = err?.response?.status;
                alert(`${message}: ${code}`);
            })
        } catch (err) {
            alert("Failed to retrieve contact")
        }
    }

    const getInitials = (name = "") =>
        name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase()

    const avatarColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b"]

    const getProfileHref = (url) => {
        if (!url) return "#"
        return url.startsWith("http") ? url : `https://${url}`
    }

    if (loading) {
        return (
            <div className="min-vh-100 bg-light">
                <Navbar />
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                    style={{ background: "rgba(241,245,249,0.85)", backdropFilter: "blur(4px)", zIndex: 9999 }}
                >
                    <Spinner animation="border" variant="primary" style={{ width: 52, height: 52, borderWidth: 4 }} />
                    <p className="mt-3 fw-semibold text-primary" style={{ fontSize: 15 }}>Loading....</p>
                </div>
            </div>
        )
    }

    if (!paymentDone) {
        return (
            <div className="min-vh-100 bg-light">
                <Navbar />
                <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "calc(100vh - 56px)" }}>
                    <Card className="text-center shadow-sm p-5" style={{ maxWidth: 460, width: "100%", borderRadius: 20, border: "none" }}>
                        <div style={{ fontSize: 60 }}>🔒</div>
                        <Card.Body>
                            <h4 className="fw-bold mb-2">Premium Feature</h4>
                            <p className="text-muted mb-4" style={{ fontSize: 15, lineHeight: 1.6 }}>
                                You are not a premium user, so you cannot use this feature.
                                Upgrade your plan to access the full Contacts page.
                            </p>
                            <Button
                                variant="primary"
                                className="fw-bold px-4 py-2"
                                style={{ borderRadius: 10, fontSize: 15 }}
                                onClick={() => navigate("/billing")}
                            >
                                ⚡ Upgrade to Premium
                            </Button>
                        </Card.Body>
                    </Card>
                </Container>
            </div>
        )
    }

    return (
        <div className="min-vh-100 bg-light">
            <Navbar />
            <Container fluid className="py-4 px-4">

                {/* ── Page Header ─────────────────────────────────────────── */}
                <Row className="align-items-center mb-4">
                    <Col>
                        <h5 className="fw-bold mb-1">Contacts</h5>
                        <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                            Manage your contacts and recover deleted ones
                        </p>
                    </Col>
                    <Col xs="auto">
                        <Button
                            onClick={() => setShowDeleted(v => !v)}
                            variant={showDeleted ? "outline-danger" : "outline-secondary"}
                            className="fw-semibold"
                            style={{ fontSize: 14 }}
                        >
                            🗑️ {showDeleted ? "Hide Deleted Contacts" : "View Deleted Contacts"}
                        </Button>
                    </Col>
                </Row>

                {/* ── Empty state when nothing is toggled ─────────────────── */}
                {!showDeleted && !showAllContacts && (
                    <Card className="shadow-sm border-0 text-center py-5 mb-4" style={{ borderRadius: 14 }}>
                        <Card.Body>
                            <div style={{ fontSize: 36 }}>👥</div>
                            <p className="fw-semibold mt-2 mb-1" style={{ fontSize: 15 }}>
                                Your contacts will appear here
                            </p>
                            <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                                Add contacts to get started
                            </p>
                        </Card.Body>
                    </Card>
                )}

                {/* ── Deleted Contacts Table ───────────────────────────────── */}
                {showDeleted && (
                    <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: 14 }}>
                        <Card.Body className="p-4">
                            <h6 className="fw-bold mb-3 text-danger">🗑️ Deleted Contacts</h6>
                            <div className="table-responsive">
                                <Table hover className="align-middle mb-0" style={{ fontSize: 14 }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th>Contact</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Company</th>
                                            <th>Designation</th>
                                            <th>Source</th>
                                            <th>LinkedIn</th>
                                            <th>Deleted On</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deletedContacts.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="text-center text-muted py-4">
                                                    No deleted contacts found
                                                </td>
                                            </tr>
                                        ) : (
                                            deletedContacts.map((contact, i) => (
                                                <tr key={contact.uid}>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div
                                                                className="d-flex align-items-center justify-content-center rounded-circle"
                                                                style={{
                                                                    width: 34, height: 34,
                                                                    background: avatarColors[i % avatarColors.length],
                                                                    color: "#fff", fontWeight: 700, fontSize: 12
                                                                }}
                                                            >
                                                                {getInitials(contact.name)}
                                                            </div>
                                                            <span className="fw-semibold text-secondary">{contact.name}</span>
                                                        </div>
                                                    </td>
                                                    <td>{contact.email || "—"}</td>
                                                    <td>{contact.phone || "—"}</td>
                                                    <td>{contact.company || "—"}</td>
                                                    <td>{contact.designation || "—"}</td>
                                                    <td><Badge bg="secondary">{contact.source || "—"}</Badge></td>
                                                    <td>
                                                        {contact.profileURL ? (
                                                            <Link to={getProfileHref(contact.profileURL)} target="_blank"
                                                                className="text-primary fw-semibold text-decoration-none" style={{ fontSize: 13 }}>
                                                                🔗 View
                                                            </Link>
                                                        ) : <span>—</span>}
                                                    </td>
                                                    <td>{formatDate(contact.updatedAt)}</td>
                                                    <td>
                                                        <Button variant="outline-success" size="sm" onClick={() => handleRetrieve(contact)}>
                                                            ♻️ Retrieve
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* ── All Contacts Card ────────────────────────────────────── */}
                <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: 14 }}>
                    <Card.Body className="p-4">
                        <Row className="align-items-center mb-3">
                            <Col>
                                <h6 className="fw-bold mb-0">📋 All Contacts</h6>
                                <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                                    View and export your complete contact list
                                </p>
                            </Col>
                            <Col xs="auto" className="d-flex gap-2 flex-wrap justify-content-end">
                                <Button
                                    variant="outline-primary"
                                    className="fw-semibold"
                                    style={{ fontSize: 14 }}
                                    onClick={handleGetAllContacts}
                                    disabled={allContactsLoading}
                                >
                                    {allContactsLoading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-1" />
                                            Loading...
                                        </>
                                    ) : (
                                        "📂 Get All Contact List"
                                    )}
                                </Button>

                                <Button
                                    variant="success"
                                    className="fw-semibold"
                                    style={{ fontSize: 14 }}
                                    onClick={handleExportExcel}
                                    disabled={!allContacts.length}
                                >
                                    📥 Export Excel
                                </Button>
                            </Col>
                        </Row>

                        {/* Table shown after fetching */}
                        {showAllContacts && (
                            <div className="table-responsive">
                                {allContactsLoading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 text-muted" style={{ fontSize: 13 }}>Fetching contacts...</p>
                                    </div>
                                ) : allContacts.length === 0 ? (
                                    <p className="text-center text-muted py-4">No contacts found.</p>
                                ) : (
                                    <Table hover className="align-middle mb-0" style={{ fontSize: 14 }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th>S No</th>
                                                <th>Contact</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Company</th>
                                                <th>Designation</th>
                                                <th>Source</th>
                                                <th>Status</th>
                                                <th>LinkedIn</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allContacts.map((contact, i) => (
                                                <tr key={contact.uid}>
                                                    <td className="text-muted" style={{ fontSize: 12 }}>{i + 1}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div
                                                                className="d-flex align-items-center justify-content-center rounded-circle"
                                                                style={{
                                                                    width: 34, height: 34,
                                                                    background: avatarColors[i % avatarColors.length],
                                                                    color: "#fff", fontWeight: 700, fontSize: 12
                                                                }}
                                                            >
                                                                {getInitials(contact.name)}
                                                            </div>
                                                            <span className="fw-semibold text-secondary">{contact.name}</span>
                                                        </div>
                                                    </td>
                                                    <td>{contact.email || "—"}</td>
                                                    <td>{contact.phone || "—"}</td>
                                                    <td>{contact.company || "—"}</td>
                                                    <td>{contact.designation || "—"}</td>
                                                    <td><Badge bg="info" text="dark">{contact.source || "—"}</Badge></td>
                                                    <td>{getStatusBadge(contact.status)}</td>
                                                    <td>
                                                        {contact.profileURL ? (
                                                            <Link to={getProfileHref(contact.profileURL)} target="_blank"
                                                                className="text-primary fw-semibold text-decoration-none" style={{ fontSize: 13 }}>
                                                                🔗 View
                                                            </Link>
                                                        ) : <span>—</span>}
                                                    </td>
                                                    <td>{formatDate(contact.updatedAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </div>
                        )}

                        {/* Placeholder when not yet loaded */}
                        {!showAllContacts && (
                            <div className="text-center py-4 text-muted" style={{ fontSize: 13 }}>
                                Click <strong>"Get All Contact List"</strong> to load contacts, then <strong>"Export Excel"</strong> to download.
                            </div>
                        )}
                    </Card.Body>
                </Card>

            </Container>
        </div>
    )
}

export default Contacts