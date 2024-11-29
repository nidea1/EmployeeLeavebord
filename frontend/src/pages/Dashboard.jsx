import React, { useState, useEffect } from "react";
import axios from "axios";
import {
	ATTENDANCES_URL,
	LEAVE_REQUEST_URL,
	USER_BY_TOKEN_URL,
} from "../services";

const Dashboard = () => {
	const [userData, setUserData] = useState(null);
	const [attendanceRecords, setAttendanceRecords] = useState([]);
	const [leaveRequests, setLeaveRequests] = useState([]);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				const userResponse = await axios.get(USER_BY_TOKEN_URL);
				setUserData(userResponse.data);

				const attendanceResponse = await axios.get(ATTENDANCES_URL);
				setAttendanceRecords(attendanceResponse.data);

				const leaveResponse = await axios.get(LEAVE_REQUEST_URL);
				setLeaveRequests(leaveResponse.data);
			} catch (error) {
				console.error("Veri yüklenirken hata oluştu", error);
			}
		};

		fetchDashboardData();
	}, []);

	if (!userData)
		return (
			<div className="d-flex justify-content-center">
				<div className="spinner-border" role="status">
					<span className="visually-hidden">Yükleniyor...</span>
				</div>
			</div>
		);

	return (
		<div className="container mt-4">
			<div className="row mb-4">
				<div className="col">
					<h1 className="display-4">
						Hoşgeldin, {userData.username}
					</h1>
				</div>
			</div>

			<div className="row mb-4">
				<div className="col-md-6">
					<div className="card text-center bg-primary text-white">
						<div className="card-body">
							<h3 className="card-title">Kalan İzin Günleri</h3>
							<p className="card-text display-6">
								{userData.annual_leave_days} gün
							</p>
						</div>
					</div>
				</div>
				<div className="col-md-6">
					<div className="card text-center bg-success text-white">
						<div className="card-body">
							<h3 className="card-title">Toplam Çalışma Günü</h3>
							<p className="card-text display-6">
								{attendanceRecords.length} gün
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="row">
				<div className="col-md-6 mb-4">
					<div className="card">
						<div className="card-header bg-light">
							<h2 className="h4 mb-0">Devam Kayıtları</h2>
						</div>
						<div className="card-body">
							<div className="table-responsive">
								<table className="table table-hover">
									<thead className="table-light">
										<tr>
											<th>Tarih</th>
											<th>Giriş Saati</th>
											<th>Çıkış Saati</th>
										</tr>
									</thead>
									<tbody>
										{attendanceRecords.map((record) => (
											<tr key={record.id}>
												<td>{record.date}</td>
												<td>
													{new Date(
														record.start_time
													).toLocaleTimeString()}
												</td>
												<td>
													{record.end_time ? (
														new Date(
															record.end_time
														).toLocaleTimeString()
													) : (
														<span className="badge bg-warning">
															Henüz Çıkış
															Yapılmadı
														</span>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				<div className="col-md-6 mb-4">
					<div className="card">
						<div className="card-header bg-light">
							<h2 className="h4 mb-0">İzin Hareketlerim</h2>
						</div>
						<div className="card-body">
							<div className="table-responsive">
								<table className="table table-hover">
									<thead className="table-light">
										<tr>
											<th>Başlangıç Tarihi</th>
											<th>Bitiş Tarihi</th>
											<th>Durum</th>
										</tr>
									</thead>
									<tbody>
										{leaveRequests.map((request) => (
											<tr key={request.id}>
												<td>{request.start_date}</td>
												<td>{request.end_date}</td>
												<td>
													<span
														className={`badge ${
															request.status ===
															"APPROVED"
																? "bg-success"
																: request.status ===
																  "REJECTED"
																? "bg-danger"
																: "bg-info"
														}`}
													>
														{request.status ===
														"APPROVED"
															? "Onaylandı"
															: request.status ===
															  "REJECTED"
															? "Reddedildi"
															: "Onay Bekliyor"}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export { Dashboard };
