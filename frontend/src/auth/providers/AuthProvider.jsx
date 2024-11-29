/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useEffect, useRef, useState } from "react";
import * as authHelper from "../_helpers";
import {
	CHECK_IN_URL,
	CHECK_OUT_URL,
	LOGIN_URL,
	USER_BY_TOKEN_URL,
	WS_NOTIFICATIONS_URL
} from "../../services";
import axios from "axios";
import ReconnectingWebSocket from "reconnecting-websocket";
import { toast } from "react-toastify";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
	const [loading, setLoading] = useState(true);
	const [auth, setAuth] = useState(authHelper.getAuth());
	const [currentUser, setCurrentUser] = useState();
	const ws = useRef(null);

	const toastOptions = {
		position: "top-right",
		autoClose: 5000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		progress: undefined,
	};

	const verify = async () => {
		if (auth) {
			try {
				const { data: user } = await getUser();
				setCurrentUser(user);
			} catch {
				saveAuth(undefined);
				setCurrentUser(undefined);
			}
		}
	};

	useEffect(() => {
		verify().finally(() => {
			setLoading(false);
		});
	}, []);

	const connectWebSocket = () => {
		if (!auth?.token) return;

		const socketUrl = `${WS_NOTIFICATIONS_URL}?token=${auth.token}`;

		ws.current = new ReconnectingWebSocket(socketUrl);

		ws.current.onopen = () => {
			console.log("WebSocket bağlantısı kuruldu.");
		};

		ws.current.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.message) {
				switch(data.type) {
					case 'info':
						toast.info(data.message, toastOptions);
						break;
					case 'success':
						toast.success(data.message, toastOptions);
						break;
					case 'warning':
						toast.warn(data.message, toastOptions);
						break;
					case 'error':
						toast.error(data.message, toastOptions);
						break;
					default:
						toast.info(data.message, toastOptions);
				}
			}
		};

		ws.current.onclose = () => {
			console.log("WebSocket bağlantısı kapandı.");
		};

		ws.current.onerror = (error) => {
			console.error("WebSocket hatası:", error);
		};
	};

	useEffect(() => {
		if (auth && auth.token) {
			connectWebSocket();
		}

		return () => {
			if (ws.current) {
				ws.current.close();
			}
		};
	}, [auth]);

	const saveAuth = (auth) => {
		setAuth(auth);
		if (auth) {
			authHelper.setAuth(auth);
		} else {
			authHelper.removeAuth();
		}
	};

	const login = async (username, password) => {
		try {
			const { data: auth } = await axios.post(LOGIN_URL, {
				username,
				password,
			});
			saveAuth(auth);
			const { data: user } = await getUser();
			setCurrentUser(user);

			if (user.is_employee) {
				await axios.post(CHECK_IN_URL).catch(console.error);
			}
		} catch (error) {
			saveAuth(undefined);
			throw error;
		}
	};

	const getUser = async () => {
		return await axios.get(USER_BY_TOKEN_URL);
	};

	const logout = async () => {
		if (currentUser?.is_employee) {
			await axios.post(CHECK_OUT_URL).catch(console.error);
		}
		saveAuth(undefined);
		setCurrentUser(undefined);
	};

	return (
		<AuthContext.Provider
			value={{
				isLoading: loading,
				auth,
				saveAuth,
				currentUser,
				setCurrentUser,
				login,
				getUser,
				logout,
				verify,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export { AuthContext, AuthProvider };
