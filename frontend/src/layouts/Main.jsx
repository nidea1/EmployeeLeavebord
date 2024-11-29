import { Outlet } from "react-router";
import { Header } from "./Header";
import { ToastContainer } from "react-toastify";


const Main = () => (
    <>
        <Header />

        <main>
            <Outlet />
        </main>

        <ToastContainer />
    </>
);

export { Main };