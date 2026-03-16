import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import ProgressBar from 'react-bootstrap/ProgressBar'
import axios from 'axios'
import { baseURL } from '../../Utils/baseURL'
import Navbar from '../Navbar/Navbar'

const Payment = () => {
    const { state } = useLocation()
    const navigate = useNavigate()
    const [{ isPending }] = usePayPalScriptReducer()

    const [isApproving, setIsApproving] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [errorMsg, setErrorMsg] = useState(null)
    const [cancelMsg, setCancelMsg] = useState(null)
    const [countdown, setCountdown] = useState(3)
    const timerRef = useRef(null)

    const { planLabel, planId, rate, duration, totalAmount } = state

    const authHeader = {
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("user")}`
        }
    }

    // Auto-redirect timer — fires when modal opens
    useEffect(() => {
        if (!showModal) return

        setCountdown(3)

        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current)
                    navigate("/admin")
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timerRef.current)
    }, [showModal, navigate])

    const createOrder = async () => {
        const res = await axios.post(
            `${baseURL}/api/v1/payment/createOrder`,
            { planId, planLabel, rate, duration, totalAmount: totalAmount.toFixed(2).toString() },
            authHeader
        )
        return res.data.data.orderId
    }

    const onApprove = async (data) => {
        setIsApproving(true)
        setErrorMsg(null)
        try {
            const res = await axios.post(
                `${baseURL}/api/v1/payment/captureOrder`,
                { orderId: data.orderID, planId, planLabel, rate, duration, totalAmount },
                authHeader
            )
            if (res.status === 200) {
                setShowModal(true)
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Payment capture failed"
            const code = err.response?.status ?? ""
            setErrorMsg(code ? `${message} (${code})` : message)
        } finally {
            setIsApproving(false)
        }
    }

    const handleGoToDashboard = () => {
        clearInterval(timerRef.current)
        setShowModal(false)
        navigate("/admin")
    }

    return (
        <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f1f5f9", minHeight: "100vh", color: "#1e293b" }}>
            <Navbar />

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            {/* ── Loading overlay ── */}
            {isApproving && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", zIndex: 999,
                }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        border: "3px solid #e2e8f0", borderTopColor: "#7c3aed",
                        animation: "spin 0.7s linear infinite", marginBottom: 16,
                    }} />
                    <p style={{ color: "#fff", fontSize: 15, fontWeight: 600, margin: 0 }}>
                        Confirming your payment…
                    </p>
                </div>
            )}

            {/* ── Premium Member Modal (React-Bootstrap) ── */}
            <Modal
                show={showModal}
                centered
                backdrop="static"
                keyboard={false}
            >
                <Modal.Body style={{ textAlign: "center", padding: "40px 32px 32px" }}>

                    {/* Crown icon */}
                    <div style={{
                        width: 72, height: 72, borderRadius: "50%",
                        background: "#f5f3ff", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        margin: "0 auto 20px", fontSize: 34,
                    }}>
                        👑
                    </div>

                    <p style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                        color: "#7c3aed", textTransform: "uppercase", margin: "0 0 8px",
                    }}>
                        Payment successful
                    </p>

                    <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, color: "#1e293b" }}>
                        You're now a Premium Member!
                    </h2>

                    <p style={{ margin: "0 0 6px", fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
                        Your <strong style={{ color: "#1e293b" }}>{planLabel}</strong> plan is now active.
                    </p>

                    <p style={{ margin: "0 0 20px", fontSize: 13, color: "#94a3b8" }}>
                        Redirecting to dashboard in{" "}
                        <strong style={{ color: "#7c3aed" }}>{countdown}s</strong>…
                    </p>

                    {/* Countdown progress bar */}
                    <ProgressBar
                        now={(countdown / 3) * 100}
                        style={{ height: 5, borderRadius: 99, marginBottom: 24 }}
                        variant="primary"
                    />

                    <Button
                        onClick={handleGoToDashboard}
                        style={{
                            width: "100%", padding: "12px",
                            background: "#7c3aed", border: "none",
                            borderRadius: 10, fontSize: 15, fontWeight: 700,
                        }}
                    >
                        Go to Dashboard →
                    </Button>

                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "12px 0 0" }}>
                        Thank you for your purchase!
                    </p>

                </Modal.Body>
            </Modal>

            {/* ── Main content ── */}
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", minHeight: "calc(100vh - 56px)",
                padding: "24px", animation: "fadeIn 0.35s ease both",
            }}>
                <div style={{ maxWidth: 480, width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* Page Header */}
                    <div style={{ textAlign: "center", marginBottom: 4 }}>
                        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#1e293b" }}>
                            Complete Your Payment
                        </h2>
                        <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>
                            Review your order and pay securely below
                        </p>
                    </div>

                    {/* ── Inline error banner ── */}
                    {errorMsg && (
                        <div style={{
                            background: "#fef2f2", border: "1px solid #fecaca",
                            borderRadius: 10, padding: "12px 16px",
                            display: "flex", alignItems: "center", gap: 10,
                        }}>
                            <span style={{ fontSize: 16 }}>⚠️</span>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#991b1b" }}>
                                    Payment failed
                                </p>
                                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#b91c1c" }}>
                                    {errorMsg}
                                </p>
                            </div>
                            <button
                                onClick={() => setErrorMsg(null)}
                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#ef4444", padding: 0 }}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* ── Inline cancel banner ── */}
                    {cancelMsg && (
                        <div style={{
                            background: "#fffbeb", border: "1px solid #fde68a",
                            borderRadius: 10, padding: "12px 16px",
                            display: "flex", alignItems: "center", gap: 10,
                        }}>
                            <span style={{ fontSize: 16 }}>ℹ️</span>
                            <p style={{ margin: 0, fontSize: 13, color: "#92400e", flex: 1 }}>
                                {cancelMsg}
                            </p>
                            <button
                                onClick={() => setCancelMsg(null)}
                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#f59e0b", padding: 0 }}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Order Summary Card */}
                    <div style={{
                        background: "#fff", borderRadius: 16,
                        boxShadow: "0 1px 4px #0001", padding: "24px 28px",
                    }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#1e293b" }}>
                            🧾 Order Summary
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "#64748b" }}>Plan</span>
                                <span style={{
                                    fontWeight: 700, color: "#7c3aed",
                                    background: "#f5f3ff", border: "1px solid #ddd6fe",
                                    borderRadius: 6, padding: "2px 12px", fontSize: 13,
                                }}>
                                    {planLabel}
                                </span>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "#64748b" }}>Rate</span>
                                <span style={{ fontWeight: 600, color: "#1e293b" }}>${rate} / month</span>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "#64748b" }}>Duration</span>
                                <span style={{ fontWeight: 600, color: "#1e293b" }}>
                                    {duration === 1 ? "1 month" : `${duration} months`}
                                </span>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "#64748b" }}>Calculation</span>
                                <span style={{ fontWeight: 600, color: "#1e293b" }}>
                                    ${rate} × {duration} = ${totalAmount.toFixed(2)}
                                </span>
                            </div>

                            <div style={{ borderTop: "1px solid #f1f5f9", margin: "4px 0" }} />

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>Total Amount</span>
                                <span style={{ fontWeight: 800, fontSize: 26, color: "#2563eb" }}>
                                    ${totalAmount.toFixed(2)}
                                </span>
                            </div>

                        </div>
                    </div>

                    {/* PayPal Card */}
                    <div style={{
                        background: "#fff", borderRadius: 16,
                        boxShadow: "0 1px 4px #0001", padding: "24px 28px",
                    }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: "#1e293b" }}>
                            💳 Pay with PayPal
                        </div>
                        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
                            You will be charged{" "}
                            <strong style={{ color: "#1e293b" }}>${totalAmount.toFixed(2)}</strong>
                            {" "}for the{" "}
                            <strong style={{ color: "#1e293b" }}>{planLabel}</strong> plan.
                        </div>

                        {isPending && (
                            <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: 14 }}>
                                Loading PayPal...
                            </div>
                        )}

                        <PayPalButtons
                            style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay", height: 45 }}
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onError={(err) => {
                                setErrorMsg(err.message || "An unexpected PayPal error occurred. Please try again.")
                            }}
                            onCancel={() => {
                                setCancelMsg("Payment was cancelled. You can try again anytime.")
                            }}
                        />
                    </div>

                    {/* Security Notice */}
                    <div style={{
                        textAlign: "center", fontSize: 12, color: "#94a3b8",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                        🔒 Payments are securely processed via PayPal. We do not store your card details.
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={() => navigate("/billing")}
                        style={{
                            background: "none", border: "1px solid #e2e8f0",
                            borderRadius: 10, padding: "10px",
                            fontSize: 14, fontWeight: 600,
                            color: "#64748b", cursor: "pointer", transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1" }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#e2e8f0" }}
                    >
                        ← Back to Billing
                    </button>

                </div>
            </div>
        </div>
    )
}

export default Payment