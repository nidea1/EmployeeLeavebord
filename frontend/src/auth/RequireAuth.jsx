import { Navigate, Outlet } from "react-router";
import { useAuth } from "./useAuth";


const RequireAuth = () => {
    const { auth, isLoading } = useAuth();

    console.log('auth', auth);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return auth ? <Outlet /> : <Navigate to="/auth/login" />;
};


export { RequireAuth };