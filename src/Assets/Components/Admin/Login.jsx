import axios from "axios";
import { useState } from "react";
import { baseURL } from "../../Utils/baseURL";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";

const FloatingIcon = ({ icon, style }) => (
    <div
        style={{
            position: "absolute",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(37,99,200,0.55)",
            fontSize: "22px",
            boxShadow: "0 4px 24px rgba(37,99,200,0.08)",
            animation: "floatDrift 6s ease-in-out infinite",
            ...style,
        }}
    >
        {icon}
    </div>
);

/* ── Smooth multi-dot loader ── */
const ButtonLoader = () => (
    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            {[0, 1, 2].map(i => (
                <span
                    key={i}
                    style={{
                        display: "inline-block",
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "white",
                        animation: "dotBounce 1.1s ease-in-out infinite",
                        animationDelay: `${i * 0.18}s`,
                        opacity: 0.9,
                    }}
                />
            ))}
        </span>
        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: "15px", fontWeight: "600", letterSpacing: "0.3px" }}>
            Signing in…
        </span>
    </span>
);

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(null);
    const navigate = useNavigate();

    const handleLogin = () => {
        if (loading) return;
        setLoading(true);
        axios({
            url: `${baseURL}/api/v1/user/login`,
            method: "POST",
            data: { username, password },
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => {
                if (res.status === 200) {
                    Cookies.set("accessToken", res.data.data.accessToken);
                    localStorage.setItem("user", JSON.stringify(res.data.data.accessToken));
                    setTimeout(() => {
                        setLoading(false);
                        navigate("/admin");
                    }, 800);
                }
            })
            .catch((err) => {
                setLoading(false);
                const message = err.response?.data?.message;
                const code = err?.response?.status;
                alert(`${message}: ${code}`);
            });
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100%",
                background: "linear-gradient(145deg, #dbeafe 0%, #eff6ff 35%, #bfdbfe 65%, #dbeafe 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700&display=swap');

        @keyframes floatDrift {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(2deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes meshMove {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 15px) scale(1.04); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
          40%           { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes btnPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(37,99,235,0.35); }
          50%       { box-shadow: 0 6px 32px rgba(37,99,235,0.55); }
        }
        .login-card {
          animation: fadeSlideUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .input-field {
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-field:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.13);
        }
        .login-btn {
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s, opacity 0.18s;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .login-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%) !important;
          box-shadow: 0 8px 28px rgba(37,99,235,0.42) !important;
          transform: translateY(-1px);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }
        .login-btn:disabled {
          cursor: not-allowed;
          animation: btnPulse 1.8s ease-in-out infinite;
        }
        /* ripple on click */
        .login-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.3s;
          border-radius: inherit;
        }
        .login-btn:active::after {
          background: rgba(255,255,255,0.12);
        }
        .eye-btn {
          transition: color 0.15s;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          color: #94a3b8;
        }
        .eye-btn:hover { color: #2563eb; }
        .link {
          color: #2563eb;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.15s;
        }
        .link:hover { color: #1d4ed8; text-decoration: underline; }
        .checkbox-custom {
          width: 16px; height: 16px;
          border: 2px solid #cbd5e1;
          border-radius: 4px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .checkbox-custom.checked {
          border-color: #2563eb;
          background: #2563eb;
        }
      `}</style>

            {/* Background mesh blobs */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                <div style={{
                    position: "absolute", top: "-20%", left: "-10%",
                    width: "600px", height: "600px", borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(147,197,253,0.45) 0%, transparent 70%)",
                    animation: "meshMove 9s ease-in-out infinite",
                }} />
                <div style={{
                    position: "absolute", bottom: "-15%", right: "-5%",
                    width: "500px", height: "500px", borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(96,165,250,0.35) 0%, transparent 70%)",
                    animation: "meshMove 11s ease-in-out infinite reverse",
                }} />
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }}>
                    <line x1="10%" y1="20%" x2="30%" y2="50%" stroke="#2563eb" strokeWidth="1" strokeDasharray="4 6" />
                    <line x1="30%" y1="50%" x2="70%" y2="30%" stroke="#2563eb" strokeWidth="1" strokeDasharray="4 6" />
                    <line x1="70%" y1="30%" x2="90%" y2="60%" stroke="#2563eb" strokeWidth="1" strokeDasharray="4 6" />
                    <line x1="20%" y1="80%" x2="50%" y2="60%" stroke="#2563eb" strokeWidth="1" strokeDasharray="4 6" />
                    <line x1="50%" y1="60%" x2="80%" y2="80%" stroke="#2563eb" strokeWidth="1" strokeDasharray="4 6" />
                    <circle cx="10%" cy="20%" r="3" fill="#2563eb" opacity="0.4" />
                    <circle cx="30%" cy="50%" r="3" fill="#2563eb" opacity="0.4" />
                    <circle cx="70%" cy="30%" r="3" fill="#2563eb" opacity="0.4" />
                    <circle cx="90%" cy="60%" r="3" fill="#2563eb" opacity="0.4" />
                    <circle cx="20%" cy="80%" r="3" fill="#2563eb" opacity="0.4" />
                    <circle cx="50%" cy="60%" r="3" fill="#2563eb" opacity="0.4" />
                    <circle cx="80%" cy="80%" r="3" fill="#2563eb" opacity="0.4" />
                </svg>
            </div>

            {/* Floating icons */}
            <FloatingIcon icon="🌐" style={{ top: "8%", left: "8%", animationDelay: "0s" }} />
            <FloatingIcon icon="📄" style={{ top: "18%", left: "3%", width: "52px", height: "52px", animationDelay: "1.2s" }} />
            <FloatingIcon icon="✉️" style={{ top: "52%", left: "3%", animationDelay: "2s" }} />
            <FloatingIcon icon="🔍" style={{ bottom: "22%", left: "6%", animationDelay: "0.5s" }} />
            <FloatingIcon icon="👥" style={{ top: "8%", right: "6%", animationDelay: "1.5s" }} />
            <FloatingIcon icon="📊" style={{ top: "35%", right: "3%", animationDelay: "0.8s" }} />
            <FloatingIcon icon="📋" style={{ top: "58%", right: "3%", width: "52px", height: "52px", animationDelay: "2.4s" }} />
            <FloatingIcon icon="👤" style={{ bottom: "15%", right: "6%", animationDelay: "1.8s" }} />

            {/* Card */}
            <div
                className="login-card"
                style={{
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "24px",
                    padding: "48px 44px 40px",
                    width: "100%",
                    maxWidth: "420px",
                    boxShadow: "0 20px 60px rgba(37,99,235,0.13), 0 4px 16px rgba(37,99,235,0.07)",
                    border: "1px solid rgba(255,255,255,0.7)",
                    position: "relative",
                    zIndex: 10,
                    margin: "0 16px",
                }}
            >
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "28px" }}>
                    <div style={{
                        width: "48px", height: "48px", borderRadius: "12px",
                        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
                        fontSize: "22px",
                    }}>
                        👥
                    </div>
                    <span style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: "28px", fontWeight: "700",
                        color: "#0f172a", letterSpacing: "-0.5px",
                    }}>CRM</span>
                </div>

                {/* Divider */}
                <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #e2e8f0, transparent)", marginBottom: "28px" }} />

                {/* Heading */}
                <h1 style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: "22px", fontWeight: "700",
                    color: "#0f172a", textAlign: "center",
                    margin: "0 0 8px",
                }}>Login to Your CRM</h1>
                <p style={{
                    fontSize: "14px", color: "#64748b",
                    textAlign: "center", margin: "0 0 28px", lineHeight: "1.6",
                }}>Welcome back! Please enter your credentials<br />to access your account.</p>

                {/* Username */}
                <div style={{ marginBottom: "18px" }}>
                    <label style={{
                        display: "flex", alignItems: "center", gap: "7px",
                        fontSize: "13.5px", fontWeight: "600", color: "#1e293b", marginBottom: "8px",
                    }}>
                        <span style={{ fontSize: "15px" }}>👤</span> Username
                    </label>
                    <div style={{ position: "relative" }}>
                        <span style={{
                            position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)",
                            color: "#94a3b8", fontSize: "14px",
                        }}>👤</span>
                        <input
                            className="input-field"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            disabled={loading}
                            style={{
                                width: "100%", padding: "11px 14px 11px 36px",
                                fontSize: "14px", color: "#0f172a",
                                background: loading ? "#f1f5f9" : "#f8fafc",
                                border: `1.5px solid ${focused === "username" ? "#2563eb" : "#e2e8f0"}`,
                                borderRadius: "10px",
                                boxSizing: "border-box",
                                fontFamily: "inherit",
                                transition: "background 0.2s",
                            }}
                            onFocus={() => setFocused("username")}
                            onBlur={() => setFocused(null)}
                        />
                    </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: "20px" }}>
                    <label style={{
                        display: "flex", alignItems: "center", gap: "7px",
                        fontSize: "13.5px", fontWeight: "600", color: "#1e293b", marginBottom: "8px",
                    }}>
                        <span style={{ fontSize: "15px" }}>🔒</span> Password
                    </label>
                    <div style={{ position: "relative" }}>
                        <span style={{
                            position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)",
                            color: "#94a3b8", fontSize: "14px",
                        }}>🔒</span>
                        <input
                            className="input-field"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={loading}
                            style={{
                                width: "100%", padding: "11px 42px 11px 36px",
                                fontSize: "14px", color: "#0f172a",
                                background: loading ? "#f1f5f9" : "#f8fafc",
                                border: `1.5px solid ${focused === "password" ? "#2563eb" : "#e2e8f0"}`,
                                borderRadius: "10px",
                                boxSizing: "border-box",
                                fontFamily: "inherit",
                                transition: "background 0.2s",
                            }}
                            onFocus={() => setFocused("password")}
                            onBlur={() => setFocused(null)}
                        />
                        <button
                            className="eye-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                </div>

                {/* Remember / Forgot */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "9px", cursor: "pointer" }}
                        onClick={() => setRemember(!remember)}>
                        <div className={`checkbox-custom${remember ? " checked" : ""}`}>
                            {remember && <span style={{ color: "white", fontSize: "10px", fontWeight: "bold" }}>✓</span>}
                        </div>
                        <span style={{ fontSize: "13.5px", color: "#475569", fontWeight: "500" }}>Remember Me</span>
                    </label>
                    <Link className="link" to="#" style={{ fontSize: "13.5px" }}>Forgot Password?</Link>
                </div>

                {/* Login Button */}
                <button
                    className="login-btn"
                    onClick={handleLogin}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "13px",
                        background: loading
                            ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                            : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "15px",
                        fontWeight: "600",
                        fontFamily: "'Sora', sans-serif",
                        letterSpacing: "0.2px",
                        boxShadow: "0 4px 20px rgba(37,99,235,0.3)",
                        marginBottom: "24px",
                        opacity: loading ? 0.88 : 1,
                    }}
                >
                    {loading ? <ButtonLoader /> : "Log In"}
                </button>

                {/* Footer links */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "14px" }}>
                    <Link className="link" to="#" style={{ fontSize: "12.5px", color: "#64748b", fontWeight: "400" }}>Privacy Policy</Link>
                    <span style={{ color: "#cbd5e1" }}>|</span>
                    <Link className="link" to="#" style={{ fontSize: "12.5px", color: "#64748b", fontWeight: "400" }}>Terms of Service</Link>
                    <span style={{ color: "#cbd5e1" }}>|</span>
                    <span style={{ fontSize: "16px" }}>👥</span>
                </div>
                <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", margin: 0 }}>
                    © 2024 CRM System. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;