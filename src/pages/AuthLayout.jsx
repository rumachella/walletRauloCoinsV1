// layouts/AuthLayout.jsx
import { useState } from "react"
import Login from "../components/login"
import Register from "../components/registro"
import "../App.css"

export default function AuthLayout() {
  const [currentView, setCurrentView] = useState("login")

  const toggleView = () => {
    setCurrentView(currentView === "login" ? "register" : "login")
  }

  return (
    <div className="app-container">
      <div className="content">
        <div className={`forms-container ${currentView}`}>
          <div className="form-wrapper login-wrapper">
            <Login onRegisterClick={toggleView} />
          </div>
          <div className="form-wrapper register-wrapper">
            <Register onLoginClick={toggleView} />
          </div>
        </div>
      </div>
      <div className="brand-container">
        <div className="brand">
          <span className="brand-name">RauloCoin</span>
          <span className="brand-wallet">Wallet</span>
        </div>
      </div>
    </div>
  )
}
