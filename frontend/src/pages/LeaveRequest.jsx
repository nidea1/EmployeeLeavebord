import axios from 'axios';
import React, { useState } from 'react';
import { LEAVE_REQUEST_URL } from '../services';
import 'bootstrap/dist/css/bootstrap.min.css';

const LeaveRequest = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const leaveData = {
                start_date: startDate,
                end_date: endDate,
                reason: reason
            };

            console.log(leaveData);

            await axios.post(LEAVE_REQUEST_URL, leaveData);
            setMessage('İzin talebiniz başarıyla gönderildi.');
            
            setStartDate('');
            setEndDate('');
            setReason('');
        } catch (error) {
            setMessage('İzin talebi gönderilemedi: ' + error.detail);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">İzin Talebi Oluştur</h2>
                            
                            {message && (
                                <div className={`alert ${message.includes('başarıyla') ? 'alert-success' : 'alert-danger'}`}>
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Başlangıç Tarihi</label>
                                    <input 
                                        type="date" 
                                        className="form-control"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Bitiş Tarihi</label>
                                    <input 
                                        type="date" 
                                        className="form-control"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">İzin Nedeni</label>
                                    <textarea 
                                        className="form-control"
                                        rows="3"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary">
                                        İzin Talebi Gönder
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { LeaveRequest };