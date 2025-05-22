"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import "../styles/Navbar.css"
import { Home, ArrowUpRight, Clock, LogOut, Menu } from "./icons"

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleNavClick = (route) => {
    navigate(route)
    setMobileMenuOpen(false)
  }

  const confirmLogout = () => {
    localStorage.removeItem("operationToken")
    localStorage.removeItem("expiresAt")
    toast.success("👋 Sesión cerrada correctamente")
    navigate("/")
  }

  const logoutToastId = "logout-confirm-toast"

const handleLogoutClick = () => {
  //esto hace q no se acumulen las alertas
  if (toast.isActive(logoutToastId)) return 

  toast.info(
    ({ closeToast }) => {
      return (
        <div>
          <p>¿Estás seguro de que querés cerrar sesión?</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              onClick={() => {
                confirmLogout()
                closeToast()
              }}
              className="btn btn-sm btn-danger"
            >
              Sí
            </button>
            <button
              onClick={() => closeToast()}
              className="btn btn-sm btn-secondary"
            >
              No
            </button>
          </div>
        </div>
      )
    },
    {
      toastId: logoutToastId,
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
      draggable: false,
    }
  )
}

//   const handleLogoutClick = () => {
//   toast.info("¿Estás seguro que querés cerrar sesión?");
// };

  

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-name">RauloCoin</span>
          <span className="brand-wallet">Wallet</span>
        </div>

        <div className={`navbar-menu ${mobileMenuOpen ? "open" : ""}`}>
          <button className="nav-item" onClick={() => handleNavClick("/dashboard")}>
            <Home />
            <span>Home</span>
          </button>
          <button className="nav-item" onClick={() => handleNavClick("/transfer")}>
            <ArrowUpRight />
            <span>Transferir</span>
          </button>
          <button className="nav-item" onClick={() => handleNavClick("/full-history")}>
            <Clock />
            <span>Historial</span>
          </button>
          <button className="nav-item logout" onClick={handleLogoutClick}>
            <LogOut />
            <span>Logout</span>
          </button>
        </div>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <Menu />
        </button>
      </nav>

      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={toggleMobileMenu}
      ></div>

      <ToastContainer />
    </>
  )
}

export default Navbar
