// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { EMPLOYEES_URL, LATE_ARRIVALS_URL, PENDING_LEAVES_URL, LEAVE_REQUEST_URL } from "../services";

const AdminDashboard = () => {
    const [lateArrivals, setLateArrivals] = useState([]);
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const lateResponse = await axios.get(LATE_ARRIVALS_URL);
                setLateArrivals(lateResponse.data);

                const pendingLeavesResponse = await axios.get(PENDING_LEAVES_URL);
                setPendingLeaves(pendingLeavesResponse.data);

                const employeesResponse = await axios.get(EMPLOYEES_URL);
                setEmployees(employeesResponse.data);
            } catch (error) {
                console.error("Veri yüklenirken hata oluştu", error);
            }

            setLoading(false);
        };

        fetchAdminData();
    }, []);

    const formatLateTime = (minutes) => {
        const absMinutes = Math.abs(minutes);
        const hours = Math.floor(absMinutes / 60);
        const remainingMinutes = absMinutes % 60;
        return hours > 0 ? `${hours} saat ${remainingMinutes} dakika` : `${remainingMinutes} dakika`;
    };

    const handleApprove = async (leaveId) => {
        try {
            await axios.post(`${LEAVE_REQUEST_URL}${leaveId}/approve/`);
            setPendingLeaves(pendingLeaves.filter(leave => leave.id !== leaveId));
        } catch (error) {
            console.error("İzin onaylanırken hata oluştu", error);
        }
    };

    const handleReject = async (leaveId) => {
        try {
            await axios.post(`${LEAVE_REQUEST_URL}${leaveId}/reject/`);
            setPendingLeaves(pendingLeaves.filter(leave => leave.id !== leaveId));
        } catch (error) {
            console.error("İzin reddedilirken hata oluştu", error);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Yükleniyor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">Yönetici Kontrol Paneli</h1>

            <div className="row">
                <div className="col-md-12 mb-4">
                    <div className="card">
                        <div className="card-header bg-danger text-white">
                            <h2 className="h5 mb-0">Bugün Geç Kalan Çalışanlar</h2>
                        </div>
                        <div className="card-body table-responsive">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Personel</th>
                                        <th>Tarih</th>
                                        <th>Geç Kalma Süresi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lateArrivals.map((arrival) => (
                                        <tr key={arrival.id}>
                                            <td>{arrival.user}</td>
                                            <td>{arrival.date}</td>
                                            <td>{formatLateTime(arrival.late_time)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-md-12 mb-4">
                    <div className="card">
                        <div className="card-header bg-warning">
                            <h2 className="h5 mb-0">Bekleyen İzin Talepleri</h2>
                        </div>
                        <div className="card-body table-responsive">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Personel</th>
                                        <th>Başlangıç Tarihi</th>
                                        <th>Bitiş Tarihi</th>
                                        <th>Neden</th>
                                        <th>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingLeaves.map((leave) => (
                                        <tr key={leave.id}>
                                            <td>{leave.user}</td>
                                            <td>{leave.start_date}</td>
                                            <td>{leave.end_date}</td>
                                            <td>{leave.reason}</td>
                                            <td>
                                                <button 
                                                    className="btn btn-success btn-sm me-2" 
                                                    onClick={() => handleApprove(leave.id)}
                                                >
                                                    Kabul Et
                                                </button>
                                                <button 
                                                    className="btn btn-danger btn-sm" 
                                                    onClick={() => handleReject(leave.id)}
                                                >
                                                    Reddet
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-md-12 mb-4">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h2 className="h5 mb-0">Çalışan Listesi</h2>
                        </div>
                        <div className="card-body table-responsive">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Adı</th>
                                        <th>Kullanıcı Adı</th>
                                        <th>Kalan İzin Günü</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((employee) => (
                                        <tr key={employee.id}>
                                            <td>{employee.first_name} {employee.last_name}</td>
                                            <td>{employee.username}</td>
                                            <td>{employee.annual_leave_days} gün</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { AdminDashboard };
