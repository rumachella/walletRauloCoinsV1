import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../styles/login.css";

function Login({ onRegisterClick }) {
  const [formData, setFormData] = useState({ alias: "", totp: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("https://raulocoin.onrender.com/api/verify-totp", {
        username: formData.alias,
        totpToken: formData.totp,
      });

      if (response.data.success) {
        const { operationToken } = response.data;

        // Guardamos token y expiración (5 minutos desde ahora)
        const expiresAt = Date.now() + 5 * 60 * 1000;
        localStorage.setItem("operationToken", operationToken);
        localStorage.setItem("expiresAt", expiresAt.toString());


        const userDetails = await axios.post("https://raulocoin.onrender.com/api/user-details", {
            username: formData.alias,
            totpToken: formData.totp,
        });

        localStorage.setItem("userDetails", JSON.stringify(userDetails.data));

        const userHistory = await axios.post("https://raulocoin.onrender.com/api/transactions", {
          username: formData.alias,
          totpToken: formData.totp
        });

        localStorage.setItem("userHistory", JSON.stringify(userHistory.data));
        

        // Usamos un setTimeout solo si el login fue exitoso
        
          navigate("/dashboard");
      
      } else {
        // Muestra un solo toast de error en caso de fallo en el login
        toast.error(response.data.message || "TOTP inválido", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      // Solo mostrar este toast si ocurre un error en la llamada al API
      toast.error("❌ Error al verificar. Intenta de nuevo.", {
        position: "top-right",
        autoClose: 3000,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="tituloMobile">RauloCoin Wallet</h1>
      <h1 className="auth-title">Inicio de sesión</h1>
      <p className="auth-description">
        Hola, bienvenido a tu billetera de confianza! Para continuar ingresa los siguientes datos:
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="alias">Alias</label>
          <input
            type="text"
            id="alias"
            name="alias"
            value={formData.alias}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="totp">TOTP</label>
          <input
            type="text"
            id="totp"
            name="totp"
            value={formData.totp}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Verificando..." : "INICIAR SESIÓN"}
        </button>
      </form>

      <button onClick={onRegisterClick} className="btn btn-secondary">
        REGISTRARSE
      </button>

      <ToastContainer />
    </div>
  );
}

export default Login;
