import { useState } from "react";
import { useAuth } from "../useAuth";
import { useNavigate } from "react-router";
import axios from "axios";
import { USER_BY_TOKEN_URL } from "../../services";

const Login = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			await login(username, password);

			const userResponse = await axios.get(USER_BY_TOKEN_URL);
			const userData = await userResponse.data;
			console.log(userData);

			if (userData.is_staff || userData.is_superuser) {
				navigate("/admin-dashboard");
			} else {
				navigate("/employee-dashboard");
			}
		} catch (err) {
			console.log(err);
			setError("Giriş başarısız. Lütfen bilgilerinizi kontrol ediniz.");
		}
	};

	return (
		<div className="container">
			<div className="row justify-content-center mt-5">
				<div className="col-md-6 col-lg-4">
					<div className="card shadow">
						<div className="card-body">
							<h2 className="text-center mb-4">Giriş Yap</h2>
							<form onSubmit={handleLogin}>
								{error && (
									<div className="alert alert-danger" role="alert">
										{error}
									</div>
								)}
								<div className="mb-3">
									<input
										type="text"
										className="form-control"
										placeholder="Kullanıcı Adı"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										required
									/>
								</div>
								<div className="mb-3">
									<input
										type="password"
										className="form-control"
										placeholder="Şifre"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
									/>
								</div>
								<button type="submit" className="btn btn-primary w-100">
									Giriş
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export { Login };
