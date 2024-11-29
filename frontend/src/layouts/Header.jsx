import { useAuth } from "../auth";
import { Link, useLocation } from "react-router";

const Header = () => {
    const { logout, currentUser } = useAuth();
    const location = useLocation();

    const isAdmin = currentUser?.is_superuser || currentUser?.is_staff;

    const isActive = (path) => (location.pathname === path ? "active" : "");

    return (
        <header>
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow sticky-top">
                <div className="container">
                    <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
                        <i className="fas fa-clock fs-4 me-2"></i>
                        <span>Çalışan Takip Sistemi</span>
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Navigasyonu Değiştir"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto gap-2">
                            <li className="nav-item">
                                <Link
                                    className={`nav-link d-flex align-items-center ${isActive(
                                        isAdmin ? "/admin-dashboard" : "/employee-dashboard"
                                    )}`}
                                    to={isAdmin ? "/admin-dashboard" : "/employee-dashboard"}
                                >
                                    <i className="fas fa-tachometer-alt me-2"></i> Kontrol Paneli
                                </Link>
                            </li>
                            {isAdmin && (
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link d-flex align-items-center ${isActive("/employees")}`}
                                        to="/employees"
                                    >
                                        <i className="fas fa-users me-2"></i> Çalışanlar
                                    </Link>
                                </li>
                            )}
                            {isAdmin && (
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link d-flex align-items-center ${isActive("/reports")}`}
                                        to="/reports"
                                    >
                                        <i className="fas fa-chart-bar me-2"></i> Raporlar
                                    </Link>
                                </li>
                            )}
                            {!isAdmin && (
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link d-flex align-items-center ${isActive("/leave-request")}`}
                                        to="/leave-request"
                                    >
                                        <i className="fas fa-calendar-plus me-2"></i> İzin Talebi
                                    </Link>
                                </li>
                            )}
                            {!isAdmin && (
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link d-flex align-items-center ${isActive("/leave-records")}`}
                                        to="/leave-records"
                                    >
                                        <i className="fas fa-calendar-alt me-2"></i> İzin Kayıtları
                                    </Link>
                                </li>
                            )}
                            <li className="nav-item">
                                <Link
                                    className={`nav-link d-flex align-items-center ${isActive("/logout")}`}
                                    to="/logout"
                                    onClick={logout}
                                >
                                    <i className="fas fa-sign-out-alt me-2"></i> Çıkış Yap
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export { Header };