import { Route, Routes } from "react-router";
import { Login } from "./pages";

const AuthPage = () => (
	<Routes>
		<Route path="login" element={<Login />} />
	</Routes>
);

export { AuthPage };