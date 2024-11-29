import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "react-toastify/dist/ReactToastify.css";

import axios from "axios";
import ReactDOM from "react-dom/client";

import App from "./App";
import React from "react";
import { AuthProvider } from "./auth/providers/AuthProvider";
import { setupAxios } from "./auth";

setupAxios(axios);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
        <AuthProvider>
		    <App />
        </AuthProvider>
	</React.StrictMode>
);