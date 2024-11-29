import { Navigate, Route, Routes } from "react-router";
import { AuthPage, RequireAuth } from "../auth";
import { Main } from "../layouts";
import { PrivateRoute } from "./PrivateRoute";
import { AdminDashboard, Dashboard, Employees, LeaveApproval, LeaveRecords, LeaveRequest, MonthlyEmployeeReport } from "../pages";

const AppRouting = () => (
	<Routes>
		<Route element={<RequireAuth />}>
			<Route element={<Main />}>
				<Route
					path="/employee-dashboard"
					element={
						<PrivateRoute allowedRoles={["employee"]}>
							<Dashboard />
						</PrivateRoute>
					}
				/>
				<Route
					path="/leave-request"
					element={
						<PrivateRoute allowedRoles={["employee"]}>
							<LeaveRequest />
						</PrivateRoute>
					}
				/>
				<Route
					path="/leave-records"
					element={
						<PrivateRoute allowedRoles={["employee"]}>
							<LeaveRecords />
						</PrivateRoute>
					}
				/>

				{/* Yönetici Rotaları */}
				<Route
					path="/admin-dashboard"
					element={
						<PrivateRoute allowedRoles={["admin"]}>
							<AdminDashboard />
						</PrivateRoute>
					}
				/>
				<Route
					path="/leave-approval"
					element={
						<PrivateRoute allowedRoles={["admin"]}>
							<LeaveApproval />
						</PrivateRoute>
					}
				/>
				<Route
					path="/employees"
					element={
						<PrivateRoute allowedRoles={["admin"]}>
							<Employees />
						</PrivateRoute>
					}
				/>
				<Route
					path="/reports"
					element={
						<PrivateRoute allowedRoles={["admin"]}>
							<MonthlyEmployeeReport />
						</PrivateRoute>
					}
				/>
			</Route>
		</Route>
		<Route path="*" element={<Navigate to="/auth/login" replace />} />
		<Route path="auth/*" element={<AuthPage />} />
	</Routes>
);

export { AppRouting };
