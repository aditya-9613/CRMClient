import { useEffect, useState } from "react"
import Navbar from "../Navbar/Navbar"
import checkSubscription from "../../Utils/CheckSubscription"

const Reports = () => {
    const [paymentDone, setPaymentDone] = useState(false)
    const [loading, setLoading] = useState(true) 

    useEffect(() => {
        const getData = async () => {
            const value = await checkSubscription()
            setPaymentDone(value.isPremium)
            setLoading(false)   // ← unblock the page only after the check resolves
        }

        getData()
    }, [])

    // ── FULL-PAGE LOADER ──────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f1f5f9", minHeight: "100vh", color: "#1e293b" }}>
                <Navbar />

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
                        Loading....
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
                    justifyContent: "center", minHeight: "calc(100vh - 56px)",
                    padding: "24px", textAlign: "center",
                }}>
                    <div style={{
                        background: "#fff", borderRadius: 20,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                        padding: "48px 40px", maxWidth: 460, width: "100%",
                    }}>
                        <div style={{ fontSize: 60, marginBottom: 16 }}>🔒</div>
                        <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 700, color: "#1e293b" }}>
                            Premium Feature
                        </h2>
                        <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: 15, lineHeight: 1.6 }}>
                            You are not a premium user, so you cannot use this feature.
                            Upgrade your plan to access detailed reports.
                        </p>
                        <button
                            style={{
                                background: "#2563eb", color: "#fff", border: "none",
                                borderRadius: 10, padding: "12px 32px",
                                fontWeight: 700, fontSize: 15, cursor: "pointer",
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={e => e.target.style.background = "#1d4ed8"}
                            onMouseLeave={e => e.target.style.background = "#2563eb"}
                            onClick={() => alert("Redirect to upgrade/payment page")}
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
            `}</style>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Page Header */}
                <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Reports</h2>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
                        Generate and export finalized reports for your selected tenure
                    </p>
                </div>

                {/* Coming Soon Card */}
                <div style={{
                    background: "#fff", borderRadius: 16,
                    boxShadow: "0 1px 4px #0001",
                    padding: "60px 40px",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    textAlign: "center", gap: 16,
                    animation: "fadeIn 0.35s ease both",
                    minHeight: "calc(100vh - 220px)",
                }}>
                    <div style={{ fontSize: 64 }}>📊</div>

                    <h3 style={{
                        margin: 0, fontSize: 24, fontWeight: 700, color: "#1e293b",
                    }}>
                        Finalize Report from the Selected Tenure
                    </h3>

                    <p style={{
                        margin: 0, fontSize: 15, color: "#64748b",
                        maxWidth: 480, lineHeight: 1.7,
                    }}>
                        You will be able to select a tenure period and generate a
                        finalized report with all contact activity, status summaries,
                        and performance insights — all in one place.
                    </p>

                    <div style={{
                        marginTop: 8,
                        background: "#eff6ff", border: "1px solid #bfdbfe",
                        borderRadius: 10, padding: "12px 24px",
                        fontSize: 13, color: "#2563eb", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 8,
                    }}>
                        🚧 &nbsp; This feature is coming soon. Stay tuned!
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Reports