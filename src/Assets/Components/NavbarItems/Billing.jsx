import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Navbar/Navbar'
import checkSubscription from '../../Utils/CheckSubscription'

const PLANS = [
    {
        id: "monthly",
        label: "Monthly",
        rate: 3,
        per: "month",
        duration: 1,
        badge: null,
        description: "Billed every month. Cancel anytime.",
        color: "#3b82f6",
        lightBg: "#eff6ff",
        border: "#bfdbfe",
    },
    {
        id: "quarterly",
        label: "Quarterly",
        rate: 2.5,
        per: "month",
        duration: 3,
        badge: "Save 17%",
        description: "Billed every 3 months. Great value.",
        color: "#8b5cf6",
        lightBg: "#f5f3ff",
        border: "#ddd6fe",
    },
    {
        id: "yearly",
        label: "Yearly",
        rate: 2,
        per: "month",
        duration: 12,
        badge: "Best Value",
        description: "Billed annually. Maximum savings.",
        color: "#16a34a",
        lightBg: "#f0fdf4",
        border: "#86efac",
    },
]

const FEATURES = [
    "✅ Access to all Premium Features",
    "✅ Bulk Import via Excel / CSV",
    "✅ Deleted Contacts Recovery",
    "✅ Finalized Reports by Tenure",
    "✅ Priority Support",
    "✅ Unlimited Contacts",
]

const formatDate = (isoStr) => {
    if (!isoStr) return "—"
    return new Date(isoStr).toLocaleDateString("en-GB", {
        day: "2-digit", month: "long", year: "numeric"
    })
}

const getDaysRemaining = (expiryDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryDate)
    expiry.setHours(0, 0, 0, 0)
    const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    return diff
}

const Billing = () => {
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [paymentDone, setPaymentDone] = useState(false)
    const [subscription, setSubscription] = useState(null)  // starts null
    const navigate = useNavigate()

    useEffect(() => {
        const getData = async () => {
            const value = await checkSubscription()
            setPaymentDone(value.isPremium)
            setSubscription(value)
        }
        getData()
    }, [])

    if (subscription === null) {
        return (
            <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f1f5f9", minHeight: "100vh" }}>
                <Navbar />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 56px)", color: "#64748b", fontSize: 15 }}>
                    Loading...
                </div>
            </div>
        )
    }


    const getTotal = (plan) => (plan.rate * plan.duration).toFixed(2)

    const existingPlan = {
        planLabel: subscription.planLabel,
        totalAmount: parseFloat(subscription.totalAmount) || 0,  // ✅ ensure it's a number
        startDate: subscription.startDate,
        expiryDate: subscription.expiryDate,
    }

    const handleProceed = () => {
        if (!selectedPlan) return
        const plan = PLANS.find(p => p.id === selectedPlan)
        const total = getTotal(plan)
        navigate("/payment", {
            state: {
                planId: plan.id,
                planLabel: plan.label,
                rate: plan.rate,
                duration: plan.duration,
                totalAmount: parseFloat(total),
            }
        })
    }

    const selected = PLANS.find(p => p.id === selectedPlan)

    // ── ALREADY PREMIUM ───────────────────────────────────────────
    if (paymentDone && existingPlan) {
        const daysLeft = getDaysRemaining(existingPlan.expiryDate)
        const isExpiringSoon = daysLeft <= 7 && daysLeft > 0
        const isExpired = daysLeft <= 0

        return (
            <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f1f5f9", minHeight: "100vh", color: "#1e293b" }}>
                <Navbar />

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(8px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50%      { opacity: 0.6; }
                    }
                `}</style>

                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", minHeight: "calc(100vh - 56px)",
                    padding: "24px", animation: "fadeIn 0.35s ease both",
                }}>
                    <div style={{ maxWidth: 520, width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* Premium Badge Card */}
                        <div style={{
                            background: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)",
                            borderRadius: 20, padding: "36px 32px",
                            boxShadow: "0 8px 32px rgba(37,99,235,0.25)",
                            textAlign: "center", color: "#fff",
                        }}>
                            <div style={{ fontSize: 56, marginBottom: 12 }}>👑</div>
                            <div style={{
                                display: "inline-block",
                                background: "rgba(255,255,255,0.2)",
                                borderRadius: 20, padding: "4px 18px",
                                fontSize: 12, fontWeight: 700,
                                letterSpacing: "1px", marginBottom: 14,
                            }}>
                                PREMIUM MEMBER
                            </div>
                            <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800 }}>
                                You are a Premium User!
                            </h2>
                            <p style={{ margin: 0, fontSize: 14, opacity: 0.85, lineHeight: 1.6 }}>
                                Enjoy unlimited access to all premium features
                            </p>
                        </div>

                        {/* Plan Details Card */}
                        <div style={{
                            background: "#fff", borderRadius: 16,
                            boxShadow: "0 1px 4px #0001", padding: "24px 28px",
                        }}>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#1e293b" }}>
                                📋 Your Current Plan
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ color: "#64748b" }}>Plan</span>
                                    <span style={{
                                        fontWeight: 700, color: "#7c3aed",
                                        background: "#f5f3ff", border: "1px solid #ddd6fe",
                                        borderRadius: 6, padding: "2px 12px", fontSize: 13,
                                    }}>
                                        {existingPlan.planLabel}
                                    </span>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ color: "#64748b" }}>Amount Paid</span>
                                    <span style={{ fontWeight: 700, color: "#1e293b", fontSize: 16 }}>
                                        ${existingPlan.totalAmount.toFixed(2)}
                                    </span>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ color: "#64748b" }}>Start Date</span>
                                    <span style={{ fontWeight: 600, color: "#1e293b" }}>
                                        {formatDate(existingPlan.startDate)}
                                    </span>
                                </div>

                                {/* Divider */}
                                <div style={{ borderTop: "1px solid #f1f5f9" }} />

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ color: "#64748b" }}>Plan Expires On</span>
                                    <span style={{
                                        fontWeight: 700,
                                        color: isExpired ? "#dc2626" : isExpiringSoon ? "#d97706" : "#16a34a",
                                        fontSize: 15,
                                    }}>
                                        {formatDate(existingPlan.expiryDate)}
                                    </span>
                                </div>

                                {/* Days remaining pill */}
                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <div style={{
                                        display: "inline-flex", alignItems: "center", gap: 6,
                                        background: isExpired ? "#fef2f2" : isExpiringSoon ? "#fffbeb" : "#f0fdf4",
                                        border: `1px solid ${isExpired ? "#fca5a5" : isExpiringSoon ? "#fcd34d" : "#86efac"}`,
                                        borderRadius: 20, padding: "4px 14px",
                                        fontSize: 12, fontWeight: 700,
                                        color: isExpired ? "#dc2626" : isExpiringSoon ? "#d97706" : "#16a34a",
                                        animation: isExpiringSoon ? "pulse 1.5s ease infinite" : "none",
                                    }}>
                                        {isExpired
                                            ? "⛔ Plan Expired"
                                            : isExpiringSoon
                                                ? `⚠️ Expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`
                                                : `✅ ${daysLeft} days remaining`
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features Card */}
                        <div style={{
                            background: "#fff", borderRadius: 16,
                            boxShadow: "0 1px 4px #0001", padding: "24px 28px",
                        }}>
                            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#1e293b" }}>
                                🎁 Your Premium Includes
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 32px" }}>
                                {FEATURES.map((f, i) => (
                                    <div key={i} style={{ fontSize: 13, color: "#374151" }}>{f}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ── NEW USER — PLAN SELECTION ─────────────────────────────────
    return (
        <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f1f5f9", minHeight: "100vh", color: "#1e293b" }}>
            <Navbar />

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .plan-card { transition: all 0.2s ease; cursor: pointer; }
                .plan-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important;
                }
                .proceed-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(37,99,235,0.3);
                }
                .proceed-btn { transition: all 0.15s ease !important; }
            `}</style>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 960, margin: "0 auto" }}>

                {/* Page Header */}
                <div style={{ textAlign: "center", padding: "16px 0 4px" }}>
                    <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#1e293b" }}>
                        Choose Your Plan
                    </h2>
                    <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 15 }}>
                        Unlock premium features with a plan that suits you best
                    </p>
                </div>

                {/* Plan Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, animation: "fadeIn 0.3s ease both" }}>
                    {PLANS.map((plan) => {
                        const isSelected = selectedPlan === plan.id
                        const total = getTotal(plan)
                        return (
                            <div
                                key={plan.id}
                                className="plan-card"
                                onClick={() => setSelectedPlan(plan.id)}
                                style={{
                                    background: isSelected ? plan.lightBg : "#fff",
                                    border: isSelected ? `2px solid ${plan.color}` : "2px solid #e2e8f0",
                                    borderRadius: 16, padding: "28px 24px",
                                    position: "relative",
                                    boxShadow: isSelected ? "0 4px 20px rgba(0,0,0,0.08)" : "0 1px 4px #0001",
                                }}
                            >
                                {plan.badge && (
                                    <div style={{
                                        position: "absolute", top: -12, right: 16,
                                        background: plan.color, color: "#fff",
                                        borderRadius: 20, padding: "3px 12px",
                                        fontSize: 11, fontWeight: 700,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                    }}>
                                        {plan.badge}
                                    </div>
                                )}

                                <div style={{
                                    position: "absolute", top: 16, right: 16,
                                    width: 20, height: 20, borderRadius: "50%",
                                    border: isSelected ? `2px solid ${plan.color}` : "2px solid #cbd5e1",
                                    background: isSelected ? plan.color : "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "all 0.15s",
                                }}>
                                    {isSelected && (
                                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
                                    )}
                                </div>

                                <div style={{
                                    fontSize: 13, fontWeight: 700, color: plan.color,
                                    textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10,
                                }}>
                                    {plan.label}
                                </div>

                                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 36, fontWeight: 800, color: "#1e293b", lineHeight: 1 }}>
                                        ${plan.rate}
                                    </span>
                                    <span style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>
                                        / {plan.per}
                                    </span>
                                </div>

                                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                                    {plan.description}
                                </div>

                                <div style={{ borderTop: "1px solid #e2e8f0", marginBottom: 16 }} />

                                <div style={{
                                    background: isSelected ? "#fff" : "#f8fafc",
                                    border: `1px solid ${isSelected ? plan.border : "#e2e8f0"}`,
                                    borderRadius: 10, padding: "10px 14px",
                                }}>
                                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>Total billed</div>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: plan.color }}>
                                        ${total}
                                        <span style={{ fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                                            {" "}/ {plan.duration === 1 ? "month" : `${plan.duration} months`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Features List */}
                <div style={{
                    background: "#fff", borderRadius: 14,
                    boxShadow: "0 1px 4px #0001", padding: "24px 28px",
                    animation: "fadeIn 0.4s ease both",
                }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#1e293b" }}>
                        🎁 Everything included in all plans:
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 32px" }}>
                        {FEATURES.map((f, i) => (
                            <div key={i} style={{ fontSize: 14, color: "#374151" }}>{f}</div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                {selected && (
                    <div style={{
                        background: "#fff", borderRadius: 14,
                        boxShadow: "0 1px 4px #0001", padding: "24px 28px",
                        animation: "fadeIn 0.25s ease both",
                        border: `1.5px solid ${selected.border}`,
                    }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#1e293b" }}>
                            🧾 Order Summary
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                                <span>Plan</span>
                                <span style={{ fontWeight: 600, color: "#1e293b" }}>{selected.label}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                                <span>Rate</span>
                                <span style={{ fontWeight: 600, color: "#1e293b" }}>${selected.rate} / month</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                                <span>Duration</span>
                                <span style={{ fontWeight: 600, color: "#1e293b" }}>
                                    {selected.duration === 1 ? "1 month" : `${selected.duration} months`}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                                <span>Calculation</span>
                                <span style={{ fontWeight: 600, color: "#1e293b" }}>
                                    ${selected.rate} × {selected.duration} = ${getTotal(selected)}
                                </span>
                            </div>

                            <div style={{ borderTop: "1px solid #f1f5f9", margin: "4px 0" }} />

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>Total Amount</span>
                                <span style={{ fontWeight: 800, fontSize: 22, color: selected.color }}>
                                    ${getTotal(selected)}
                                </span>
                            </div>
                        </div>

                        <button
                            className="proceed-btn"
                            onClick={handleProceed}
                            style={{
                                marginTop: 20, width: "100%",
                                background: selected.color, color: "#fff",
                                border: "none", borderRadius: 10, padding: "14px",
                                fontWeight: 700, fontSize: 16, cursor: "pointer",
                                display: "flex", alignItems: "center",
                                justifyContent: "center", gap: 8,
                            }}
                        >
                            Proceed to Payment &nbsp; →
                        </button>

                        <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#94a3b8" }}>
                            🔒 Secure payment. You will be redirected to the payment page.
                        </div>
                    </div>
                )}

                {!selected && (
                    <div style={{
                        textAlign: "center", fontSize: 14,
                        color: "#94a3b8", padding: "8px 0",
                        animation: "fadeIn 0.3s ease both",
                    }}>
                        👆 Select a plan above to see your order summary
                    </div>
                )}
            </div>
        </div>
    )
}

export default Billing