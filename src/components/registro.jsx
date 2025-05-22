"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "../styles/login.css"

function Register({ onLoginClick }) {
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    alias: "",
    email: "",
  })

  const [qrData, setQrData] = useState(null)
  const [totpToken, setTotpToken] = useState("")
  const [showModal, setShowModal] = useState(false)

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      name: formData.nombreCompleto,
      username: formData.alias,
      email: formData.email,
    }

    try {
      const res = await fetch("https://raulocoin.onrender.com/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        setQrData({ ...data.totpSetup, username: data.user.username })
        setShowModal(true)
      } else {
        alert("Error al registrar: " + data.message)
      }
    } catch (error) {
      console.error("Error al registrar:", error)
      alert("Error de red o del servidor.")
    }
  }

  const handleTotpSubmit = async (e) => {
    e.preventDefault()

    try {
      const verifyRes = await axios.post("https://raulocoin.onrender.com/api/verify-totp-setup", {
        username: qrData.username,
        totpToken: totpToken,
      })

      if (verifyRes.data.success) {
        const operationToken = verifyRes.data.operationToken
        const expiresAt = Date.now() + 5 * 60 * 1000
        localStorage.setItem("operationToken", operationToken)
        localStorage.setItem("expiresAt", expiresAt.toString())

        const userDetailsRes = await axios.post("https://raulocoin.onrender.com/api/user-details", {
          username: qrData.username,
          totpToken: totpToken,
        })
        localStorage.setItem("userDetails", JSON.stringify(userDetailsRes.data))

        const userHistoryRes = await axios.post("https://raulocoin.onrender.com/api/transactions", {
          username: qrData.username,
          totpToken: totpToken,
        })
        localStorage.setItem("userHistory", JSON.stringify(userHistoryRes.data))

        navigate("/dashboard")
      } else {
        alert("Código incorrecto. Inténtalo de nuevo.")
      }
    } catch (error) {
      console.error("Error al verificar TOTP:", error)
      alert("Error de red o del servidor.")
    }
  }

  return (
    <>
      <div className="auth-card">
        <h1 className="auth-title">Registrarse</h1>
        <p className="auth-description">
          Crea tu cuenta en RauloCoin Wallet para comenzar a usar nuestra billetera digital.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombreCompleto">Nombre Completo</label>
            <input
              type="text"
              id="nombreCompleto"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
              required
            />
          </div>

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
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            CREAR CUENTA
          </button>
        </form>

        <button onClick={onLoginClick} className="btn btn-secondary">
          VOLVER AL LOGIN
        </button>
      </div>

      {/* MODAL DE QR */}
      {showModal && qrData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Autenticación de Dos Factores</h2>
            <img src={qrData.qrCodeUrl} alt="QR para Google Authenticator" />

            <form onSubmit={handleTotpSubmit}>
              <div className="form-group">
                <label htmlFor="totpToken">Código del autenticador</label>
                <input
                  type="text"
                  id="totpToken"
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">VERIFICAR Y ACCEDER</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Register
