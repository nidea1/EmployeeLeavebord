import axios from "axios";
import { useEffect, useState } from "react";
import { LEAVE_REQUEST_URL } from "../services";

const LeaveRecords = () => {
    const [leaveRecords, setLeaveRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaveRecords = async () => {
            try {
                const response = await axios.get(LEAVE_REQUEST_URL, {
                    params: {
                        status: "APPROVED",
                    },
                });
                console.log(response.data);
                setLeaveRecords(response.data);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        };

        fetchLeaveRecords();
    }, []);

    return (
        <div className="container mt-4">
            <h1 className="mb-4">İzin Kayıtları</h1>
            {loading ? (
                <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Yükleniyor...</span>
                    </div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th scope="col">Başlangıç Tarihi</th>
                                <th scope="col">Bitiş Tarihi</th>
                                <th scope="col">Sebep</th>
                                <th scope="col">Onay Durumu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveRecords.map((record) => (
                                <tr key={record.id}>
                                    <td>{record.start_date}</td>
                                    <td>{record.end_date}</td>
                                    <td>{record.reason}</td>
                                    <td>
                                        <span
                                            className={`badge ${
                                                record.status === "APPROVED"
                                                    ? "bg-success"
                                                    : "bg-warning"
                                            }`}
                                        >
                                            {record.status === "APPROVED"
                                                ? "Onaylandı"
                                                : "Onay Bekliyor"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export { LeaveRecords };
