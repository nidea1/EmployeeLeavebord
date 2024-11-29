import { BASE_API_URL } from "../services";
import { getData, setData } from "../utils/LocalStorage";

const AUTH_LOCAL_STORAGE_KEY = "auth";

const getAuth = () => {
	try {
		const auth = getData(AUTH_LOCAL_STORAGE_KEY);

		if (auth) {
			return auth;
		} else {
			return undefined;
		}
	} catch (error) {
		console.error("AUTH LOCAL STORAGE PARSE ERROR", error);
	}
};

const setAuth = (auth) => {
	setData(AUTH_LOCAL_STORAGE_KEY, auth);
};

const removeAuth = () => {
	if (!localStorage) return;

	try {
		localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
	} catch (error) {
		console.error("AUTH LOCAL STORAGE REMOVE ERROR", error);
	}
};

export function setupAxios(axios) {
	axios.defaults.headers.Accept = "application/json";
	axios.defaults.baseURL = BASE_API_URL;
	axios.interceptors.request.use(
		(config) => {
			const auth = getAuth();

			if (auth?.token) {
				config.headers.Authorization = `Token ${auth.token}`;
			}

			return config;
		},
		async (err) => await Promise.reject(err)
	);

	axios.interceptors.response.use(
		(response) => response,
		async (error) => {
			if (
				error.response?.status === 401 ||
				error.response?.status === 403
			) {
				removeAuth();
				window.location.reload();
			}

			return Promise.reject(error);
		}
	);
}

export { getAuth, setAuth, removeAuth, AUTH_LOCAL_STORAGE_KEY };
