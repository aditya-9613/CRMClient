import { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { baseURL } from "../../Utils/baseURL";

const Logout = ({ isOpen = false, onClose }) => {
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();


    const handleLogout = useCallback(() => {
        if (loggingOut) return;

        setLoggingOut(true);

        axios({
            url: `${baseURL}/api/v1/user/logout`,
            method: "POST",
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("user")}`,
            },
        })
            .then((res) => {
                if (res.status === 200) {
                    localStorage.removeItem("user");
                    Cookies.remove("user");

                    setTimeout(() => {
                        setLoggingOut(false);
                        onClose?.();
                        navigate("/");
                    }, 700);
                }
            })
            .catch((err) => {
                setLoggingOut(false);
                const message = err.response?.data?.message || "Logout failed";
                const code = err?.response?.status || "";
                alert(`${message} ${code}`);
                onClose?.();
            });
    }, [loggingOut, navigate, onClose]);

    useEffect(() => {
        if (isOpen) {
            handleLogout();
        }
    }, [isOpen, handleLogout]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <>
            <style>{`
                @keyframes lo-spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes lo-fade-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
            `}</style>

            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 99999,
                    background: "rgba(255,255,255,0.8)",
                    backdropFilter: "blur(6px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 18,
                    animation: "lo-fade-in 0.25s ease both",
                }}
            >
                {/* Spinner */}
                <div
                    style={{
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        border: "4px solid #e2e8f0",
                        borderTopColor: "#2563eb",
                        animation: "lo-spin 0.8s linear infinite",
                    }}
                />

                {/* Text */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    <span
                        style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#1e293b",
                        }}
                    >
                        Logging out...
                    </span>

                    <span
                        style={{
                            fontSize: 13,
                            color: "#94a3b8",
                        }}
                    >
                        Clearing your session
                    </span>
                </div>
            </div>
        </>,
        document.body
    );
};

export default Logout;