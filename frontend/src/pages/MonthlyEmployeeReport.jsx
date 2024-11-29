import React, { useState } from "react";
import axios from "axios";
import { MONTHLY_WORK_REPORT_URL } from "../services";

const MonthlyEmployeeReport = () => {
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFetchReport = async () => {
        if (!month || !year) {
            setError("Ay ve yıl seçimi zorunludur.");
            return;
        }

        setLoading(true);
        setError("");
        setReportData([]);

        try {
            const response = await axios.get(MONTHLY_WORK_REPORT_URL, {
                params: { month, year }
            });
            setReportData(response.data);
        } catch (err) {
            console.error(err);
            setError("Rapor alınırken bir hata oluştu.");
        }

        setLoading(false);
    };

    const months = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Aylık Çalışma Raporu</h1>
            <div className="row mb-4">
                <div className="col-md-3">
                    <label htmlFor="month" className="form-label">
                        Ay
                    </label>
                    <select
                        id="month"
                        className="form-select"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                    >
                        <option value="">Seçiniz</option>
                        {months.map((monthName, index) => (
                            <option key={index + 1} value={index + 1}>
                                {monthName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-3">
                    <label htmlFor="year" className="form-label">
                        Yıl
                    </label>
                    <input
                        type="number"
                        id="year"
                        className="form-control"
                        placeholder="Örneğin: 2024"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    />
                </div>
                <div className="col-md-6 d-flex align-items-end">
                    <button className="btn btn-primary me-2" onClick={handleFetchReport}>
                        Raporu Getir
                    </button>
                </div>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
                <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Yükleniyor...</span>
                    </div>
                </div>
            ) : (
                reportData.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th scope="col">Kullanıcı ID</th>
                                    <th scope="col">Kullanıcı Adı</th>
                                    <th scope="col">Ay</th>
                                    <th scope="col">Yıl</th>
                                    <th scope="col">Toplam Çalışma Saati</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((report) => (
                                    <tr key={`${report.user_id}-${report.month}-${report.year}`}>
                                        <td>{report.user_id}</td>
                                        <td>{report.username}</td>
                                        <td>{months[report.month - 1]}</td>
                                        <td>{report.year}</td>
                                        <td>{report.total_work_hours}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
};

export { MonthlyEmployeeReport };