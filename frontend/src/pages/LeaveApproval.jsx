import React, { useState, useEffect } from "react";
import axios from "axios";
import { LEAVE_REQUEST_URL, PENDING_LEAVES_URL } from "../services";

const LeaveApproval = () => {
	const [pendingLeaves, setPendingLeaves] = useState([]);
	const [message, setMessage] = useState("");

	useEffect(() => {
		const fetchPendingLeaves = async () => {
			try {
				const response = await axios.get(PENDING_LEAVES_URL);
				setPendingLeaves(response.data);
			} catch (error) {
				console.error("Bekleyen izinler yüklenemedi", error);
			}
		};

		fetchPendingLeaves();
	}, []);

	const handleApprove = async (leaveId) => {
		try {
			await axios.post(LEAVE_REQUEST_URL + `${leaveId}/approve/`);
			setMessage("İzin talebi onaylandı.");
			setPendingLeaves(
				pendingLeaves.filter((leave) => leave.id !== leaveId)
			);
		} catch (error) {
			setMessage("İzin onaylanamadı: " + error.response.data.detail);
		}
	};

	const handleReject = async (leaveId) => {
		try {
			await axios.post(LEAVE_REQUEST_URL + `${leaveId}/reject/`);
			setMessage("İzin talebi reddedildi.");
			setPendingLeaves(
				pendingLeaves.filter((leave) => leave.id !== leaveId)
			);
		} catch (error) {
			setMessage("İzin reddedilemedi: " + error.response.data.detail);
		}
	};

	return (
		<div className="leave-approval-container">
			<h2>Bekleyen İzin Talepleri</h2>
			{message && (
				<p
					className={
						message.includes("onaylandı") ? "success" : "error"
					}
				>
					{message}
				</p>
			)}
			{pendingLeaves.length === 0 ? (
				<p>Bekleyen izin talebi bulunmamaktadır.</p>
			) : (
				<table>
					<thead>
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
										onClick={() => handleApprove(leave.id)}
									>
										Onayla
									</button>
									<button
										onClick={() => handleReject(leave.id)}
									>
										Reddet
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
};

export { LeaveApproval };
