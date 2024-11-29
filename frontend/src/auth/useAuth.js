import { useContext } from "react";
import { AuthContext } from "./providers/AuthProvider";

export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context)
		throw new Error("useAuthContext must be used within AuthProvider");

	return context;
};
