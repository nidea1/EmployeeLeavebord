import { Navigate } from "react-router";
import { useAuth } from "../auth";

const PrivateRoute = ({ children, allowedRoles }) => {
	const { currentUser } = useAuth();

    const role = currentUser.is_staff || currentUser.is_superuser ? 'admin' : currentUser.is_employee ? 'employee' : 'user';

	if (allowedRoles && !allowedRoles.includes(role)) {
		return <Navigate to="/" />;
	}

	return children;
};

export { PrivateRoute };
