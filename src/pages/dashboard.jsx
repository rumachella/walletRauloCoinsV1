import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowUpRight, ArrowDownLeft, Clock, DollarSign } from "../components/icons"
import "../styles/dashboard.css"

export default function Dashboard() {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [nombre, setNombre] = useState("");


  useEffect(() => {
    const raw = localStorage.getItem("userHistory")
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
  
        // ✅ Actualiza el balance si existe y es número
        if (parsed?.user?.balance !== undefined && typeof parsed.user.balance === "number") {
          setBalance(parsed.user.balance)
        } else {
          setBalance(0)
        }
  
        // 👇 Lo demás (transacciones) queda como estaba
        if (Array.isArray(parsed.transactions)) {
          const sorted = parsed.transactions
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 3)
  
          setTransactions(sorted)
        }
  
      } catch (error) {
        console.error("Error al leer userHistory:", error)
      }
    }
  }, [])
  

  useEffect(() => {
    const userDetailsRaw = localStorage.getItem("userDetails")
    if (userDetailsRaw) {
      try {
        const parsed = JSON.parse(userDetailsRaw)
        const nombreFinal = parsed?.user?.username?.trim() || "Usuario"
        setNombre(nombreFinal)
      } catch (error) {
        console.error("Error al leer userDetails:", error)
      }
    }
  }, [])
  

  return (
    <div className="dashboard-content">
      <div className="balance-card">
        <div className="balance-header">
          <h2>Balance Total de <span style={{ fontStyle: "italic" }}>{nombre}</span></h2>
          <div className="balance-icon">
            <DollarSign />
          </div>
        </div>
        <div className="balance-amount">
          <span className="currency">R$</span>
          <span className="amount">{balance}</span>
        </div>
        <div className="balance-actions">
          <button className="action-button transfer-btn" onClick={() => navigate("/transfer")}>
            <ArrowUpRight /> Transferir
          </button>
          <button className="action-button history-btn" onClick={() => navigate("/full-history")}>
            <Clock /> Historial
          </button>
        </div>
      </div>

      <div className="history-section">
        <h3>Historial Reciente</h3>
        <div className="transactions-list">
          {transactions.map((transaction, index) => (
            <div key={transaction.id || index} className="transaction-item" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={`transaction-icon ${transaction.type}`}>
                {transaction.type === "received" ? <ArrowDownLeft /> : <ArrowUpRight />}
              </div>
              <div className="transaction-details">
                <div className="transaction-title">
                  {transaction.type === "received"
                    ? `Recibido de ${transaction.fromName || "Sistema"}`
                    : transaction.type === "sent"
                    ? `Enviado a ${transaction.toName || "Destino"}`
                    : "Transacción"}
                </div>
                <div className="transaction-date">{formatDateFromTimestamp(transaction.createdAt)}</div>
              </div>
              <div className="transaction-amount">
                <span className={transaction.amount < 0 ? "sent" : "received"}>
                  {transaction.amount < 0 ? "-" : "+"}${Math.abs(transaction.amount).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function formatDateFromTimestamp(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000)
  const options = { year: "numeric", month: "short", day: "numeric" }
  return date.toLocaleDateString("es-ES", options)
}
