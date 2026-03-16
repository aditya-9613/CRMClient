import { useState, useRef, useEffect } from 'react'
import Navbar from '../Navbar/Navbar'
import * as XLSX from 'xlsx'
import { useNavigate } from 'react-router-dom'
import checkSubscription from '../../Utils/CheckSubscription.js'
import axios from 'axios'
import { baseURL } from '../../Utils/baseURL.js'
import { triggerLogout } from '../../Utils/logoutEvent.js'


const REQUIRED_HEADERS = ['name', 'email', 'designation', 'phone', 'profileURL', 'company', 'source']

const Imports = () => {
    const [dragging, setDragging] = useState(false)
    const [tableData, setTableData] = useState([])
    const [headers, setHeaders] = useState([])
    const [fileName, setFileName] = useState("")
    const [error, setError] = useState("")
    const [uploaded, setUploaded] = useState(false)
    const [paymentDone, setPaymentDone] = useState(false)
    const [loading, setLoading] = useState(true)   // ← NEW
    const fileInputRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        const getData = async () => {
            const value = await checkSubscription()
            setPaymentDone(value.isPremium)
            setLoading(false)   // ← unblock the page only after the check resolves
        }

        getData()
    }, [])


    const resetState = () => {
        setTableData([])
        setHeaders([])
        setFileName("")
        setError("")
        setUploaded(false)
    }

    const processFile = (file) => {
        setError("")
        setUploaded(false)

        const validTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv",
        ]
        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
            setError("❌ Invalid file type. Please upload a .xlsx, .xls, or .csv file.")
            return
        }

        setFileName(file.name)

        const reader = new FileReader()
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: "array" })
            const sheet = workbook.Sheets[workbook.SheetNames[0]]
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

            if (!rows || rows.length === 0) {
                setError("❌ The file is empty.")
                return
            }

            const fileHeaders = rows[0].map((h) => String(h).trim().toLowerCase())
            const normalizedRequired = REQUIRED_HEADERS.map((h) => h.toLowerCase())
            const missingHeaders = normalizedRequired.filter((h) => !fileHeaders.includes(h))

            if (missingHeaders.length > 0) {
                setError(
                    `❌ Wrong format! Missing column(s): ${missingHeaders.join(", ")}.\n\nYour file's first row must have exactly these headings:\n${REQUIRED_HEADERS.join(", ")}\n\n⚠️ Note: Do NOT include a "status" column — status is automatically set to "New" for all imported contacts.`
                )
                setTableData([])
                setHeaders([])
                return
            }

            const originalHeaders = rows[0].map((h) => String(h).trim())
            const dataRows = rows.slice(1).filter((row) => row.some((cell) => cell !== undefined && cell !== ""))
            const parsed = dataRows.map((row) => {
                const obj = {}
                originalHeaders.forEach((h, i) => {
                    if (h.toLowerCase() === 'status') return
                    obj[h] = row[i] !== undefined ? String(row[i]) : ""
                })
                return obj
            })

            const filteredHeaders = originalHeaders.filter(h => h.toLowerCase() !== 'status')

            setHeaders(filteredHeaders)
            setTableData(parsed)
        }
        reader.readAsArrayBuffer(file)
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) processFile(file)
        e.target.value = ""
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) processFile(file)
    }

    const handleUpload = () => {
        setLoading(true)

        const json = tableData.map((row) => ({
            name: row["name"] || row["Name"] || "",
            email: row["email"] || row["Email"] || "",
            designation: row["designation"] || row["Designation"] || "",
            phone: row["phone"] || row["Phone"] || "",
            profileURL: row["profileURL"] || row["ProfileURL"] || "",
            company: row["company"] || row["Company"] || "",
            source: row["source"] || row["Source"] || "",
            status: "New",
        }))
        setUploaded(true)

        axios({
            url: `${baseURL}/api/v1/contact/importExcel`,
            method: 'POST',
            data: { json },
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('user')}`
            }
        }).then((res) => {
            setLoading(false)
            if (res.status === 200) {
                alert('Excel File Imported Successfully')
                window.location.reload()
            }
        }).catch((err) => {
            setLoading(false)
            const message = err.response?.data?.message;
            const code = err?.response?.status;
            if (code === 401) {
                triggerLogout()
            } else if (code === 403) {
                setPaymentDone(false)
            } else {
                alert(`${message}: ${code}`);
            }
        })
    }

    // ── FULL-PAGE LOADER ──────────────────────────────────────────
    if (loading) {
        return (
            <div style={{
                fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                background: "#f1f5f9",
                minHeight: "100vh",
                color: "#1e293b",
            }}>
                <Navbar />

                {/* Overlay that blocks the entire page */}
                <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(241, 245, 249, 0.85)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                    gap: 20,
                }}>
                    {/* Spinner */}
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                        @keyframes pulse-text {
                            0%, 100% { opacity: 1; }
                            50%       { opacity: 0.4; }
                        }
                    `}</style>

                    <div style={{
                        width: 52,
                        height: 52,
                        border: "4px solid #dbeafe",
                        borderTop: "4px solid #2563eb",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                    }} />

                    <p style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#2563eb",
                        animation: "pulse-text 1.5s ease-in-out infinite",
                    }}>
                        Loading.....
                    </p>
                </div>
            </div>
        )
    }

    // ── NOT PREMIUM ───────────────────────────────────────────────
    if (!paymentDone) {
        return (
            <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f1f5f9", minHeight: "100vh", color: "#1e293b" }}>
                <Navbar />
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", minHeight: "calc(100vh - 56px)", padding: "24px", textAlign: "center",
                }}>
                    <div style={{
                        background: "#fff", borderRadius: 20,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                        padding: "48px 40px", maxWidth: 460, width: "100%",
                    }}>
                        <div style={{ fontSize: 60, marginBottom: 16 }}>🔒</div>
                        <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700 }}>Premium Feature</h2>
                        <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: 15, lineHeight: 1.6 }}>
                            You are not a premium user, so you cannot use this feature.
                            Upgrade your plan to access bulk import.
                        </p>
                        <button
                            style={{
                                background: "#2563eb", color: "#fff", border: "none",
                                borderRadius: 10, padding: "12px 32px",
                                fontWeight: 700, fontSize: 15, cursor: "pointer",
                            }}
                            onMouseEnter={e => e.target.style.background = "#1d4ed8"}
                            onMouseLeave={e => e.target.style.background = "#2563eb"}
                            onClick={() => navigate("/billing")}
                        >
                            ⚡ Upgrade to Premium
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ── PREMIUM ───────────────────────────────────────────────────
    return (
        <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f1f5f9", minHeight: "100vh", color: "#1e293b" }}>
            <Navbar />

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .import-table tr:hover td { background: #f8fafc; }
            `}</style>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Page Header */}
                <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Import Contacts</h2>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
                        Upload an Excel or CSV file to bulk import contacts into the system
                    </p>
                </div>

                {/* Required Format Info Box */}
                <div style={{
                    background: "#eff6ff", border: "1px solid #bfdbfe",
                    borderRadius: 12, padding: "16px 20px",
                    animation: "fadeIn 0.3s ease both",
                }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1d4ed8", marginBottom: 8 }}>
                        📋 Required File Format
                    </div>
                    <div style={{ fontSize: 13, color: "#1e40af", marginBottom: 10 }}>
                        Your file's first row <strong>must</strong> contain exactly these column headings:
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                        {REQUIRED_HEADERS.map((h) => (
                            <span key={h} style={{
                                background: "#dbeafe", color: "#1d4ed8",
                                borderRadius: 6, padding: "3px 12px",
                                fontSize: 12, fontWeight: 600,
                                border: "1px solid #bfdbfe",
                            }}>
                                {h}
                            </span>
                        ))}
                    </div>

                    <div style={{
                        background: "#f0fdf4", border: "1px solid #86efac",
                        borderRadius: 8, padding: "8px 14px",
                        fontSize: 13, color: "#15803d", fontWeight: 500,
                        marginBottom: 12, display: "flex", alignItems: "center", gap: 8,
                    }}>
                        ✅ <span><strong>Status</strong> column is <strong>not required</strong> in your file — the status of every imported contact will automatically be set to <strong>"New"</strong>.</span>
                    </div>

                    <div style={{ fontSize: 12, color: "#3b82f6" }}>
                        💡 <strong>Demo row example:</strong>&nbsp;
                        John Doe &nbsp;|&nbsp; john@example.com &nbsp;|&nbsp; Manager &nbsp;|&nbsp;
                        9876543210 &nbsp;|&nbsp; https://linkedin.com/in/johndoe &nbsp;|&nbsp;
                        Apple &nbsp;|&nbsp; LinkedIn
                    </div>
                </div>

                {/* Upload Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                    style={{
                        background: dragging ? "#eff6ff" : "#fff",
                        border: dragging ? "2px dashed #2563eb" : "2px dashed #cbd5e1",
                        borderRadius: 14, padding: "40px 24px",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 10,
                        cursor: "pointer", transition: "all 0.18s",
                        boxShadow: "0 1px 4px #0001",
                    }}
                >
                    <div style={{ fontSize: 44 }}>📂</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: dragging ? "#2563eb" : "#1e293b" }}>
                        {dragging ? "Drop your file here" : "Drag & drop your file here"}
                    </div>
                    <div style={{ fontSize: 13, color: "#94a3b8" }}>
                        or <span style={{ color: "#2563eb", fontWeight: 600 }}>click to browse</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 4 }}>
                        Supported formats: .xlsx, .xls, .csv
                    </div>
                    {fileName && (
                        <div style={{
                            marginTop: 8, background: "#f0fdf4",
                            border: "1px solid #86efac", borderRadius: 8,
                            padding: "6px 16px", fontSize: 13,
                            color: "#16a34a", fontWeight: 600,
                        }}>
                            ✅ {fileName}
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                </div>

                {/* Error Box */}
                {error && (
                    <div style={{
                        background: "#fef2f2", border: "1px solid #fecaca",
                        borderRadius: 12, padding: "16px 20px",
                        animation: "fadeIn 0.25s ease both",
                    }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#dc2626", marginBottom: 6 }}>
                            ⚠️ Format Error
                        </div>
                        <pre style={{
                            margin: 0, fontSize: 13, color: "#b91c1c",
                            whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.6,
                        }}>
                            {error}
                        </pre>
                        <button
                            onClick={resetState}
                            style={{
                                marginTop: 12, background: "#fee2e2",
                                border: "1px solid #fca5a5", color: "#dc2626",
                                borderRadius: 7, padding: "6px 16px",
                                fontSize: 13, fontWeight: 600, cursor: "pointer",
                            }}
                        >
                            🔄 Try Again
                        </button>
                    </div>
                )}

                {/* Parsed Table */}
                {tableData.length > 0 && (
                    <div style={{
                        background: "#fff", borderRadius: 14,
                        boxShadow: "0 1px 4px #0001", padding: 20,
                        animation: "fadeIn 0.3s ease both",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                                    Preview — {tableData.length} record{tableData.length !== 1 ? "s" : ""} found
                                </h3>
                                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                                    Review your data before uploading. Status will be set to{" "}
                                    <span style={{
                                        background: "#22c55e", color: "#fff",
                                        padding: "1px 8px", borderRadius: 5,
                                        fontSize: 12, fontWeight: 600,
                                    }}>
                                        New
                                    </span>
                                    {" "}for all records automatically.
                                </p>
                            </div>
                            <button
                                onClick={resetState}
                                style={{
                                    border: "1px solid #e2e8f0", background: "#fff",
                                    borderRadius: 8, padding: "7px 14px",
                                    fontSize: 13, fontWeight: 600,
                                    color: "#64748b", cursor: "pointer",
                                }}
                            >
                                ✕ Clear
                            </button>
                        </div>

                        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                            <table className="import-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: "#f8fafc" }}>
                                        <th style={{ padding: "10px 14px", fontWeight: 600, color: "#64748b", textAlign: "left", whiteSpace: "nowrap" }}>
                                            #
                                        </th>
                                        {headers.map((h) => (
                                            <th key={h} style={{
                                                padding: "10px 14px", fontWeight: 600,
                                                color: "#64748b", textAlign: "left", whiteSpace: "nowrap",
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                        <th style={{
                                            padding: "10px 14px", fontWeight: 600,
                                            color: "#64748b", textAlign: "left", whiteSpace: "nowrap",
                                        }}>
                                            status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((row, i) => (
                                        <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                                            <td style={{ padding: "10px 14px", color: "#94a3b8", fontWeight: 500 }}>
                                                {i + 1}
                                            </td>
                                            {headers.map((h) => (
                                                <td key={h} style={{ padding: "10px 14px", color: "#1e293b", whiteSpace: "nowrap" }}>
                                                    {row[h] || <span style={{ color: "#cbd5e1" }}>—</span>}
                                                </td>
                                            ))}
                                            <td style={{ padding: "10px 14px" }}>
                                                <span style={{
                                                    background: "#22c55e", color: "#fff",
                                                    padding: "3px 10px", borderRadius: 5,
                                                    fontSize: 12, fontWeight: 600,
                                                }}>
                                                    New
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
                            {uploaded && (
                                <div style={{
                                    background: "#f0fdf4", border: "1px solid #86efac",
                                    borderRadius: 8, padding: "8px 16px",
                                    fontSize: 13, color: "#16a34a", fontWeight: 600,
                                    animation: "fadeIn 0.2s ease both",
                                }}>
                                    ✅Converted to  JSON successfully!
                                </div>
                            )}
                            <button
                                onClick={handleUpload}
                                style={{
                                    background: "#2563eb", color: "#fff", border: "none",
                                    borderRadius: 10, padding: "10px 28px",
                                    fontWeight: 700, fontSize: 15, cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 8,
                                    transition: "background 0.15s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
                                onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}
                            >
                                ⬆️ Upload to Database
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Imports