"use client"

import "../styles/dashboard.css"
import { useState, useEffect } from "react"
import { Toaster, toast } from "react-hot-toast"

export default function TransferPage() {
  const [search, setSearch] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [message, setMessage] = useState("")
  const [fromUsername, setFromUsername] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [totpCode, setTotpCode] = useState("")

  useEffect(() => {
    const raw = localStorage.getItem("userHistory")
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setFromUsername(parsed?.user?.username || "")
      } catch (error) {
        console.error("Error leyendo userHistory:", error)
      }
    }
  }, [])

  // Buscar usuarios
  useEffect(() => {
    if (search.length >= 3) {
      fetch(`https://raulocoin.onrender.com/api/search-users?q=${search}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setSuggestions(data.users)
          else setSuggestions([])
        })
        .catch(() => setSuggestions([]))
    } else {
      setSuggestions([])
    }
  }, [search])

  const handleOpenModal = () => {
    if (!selectedUser || !amount || !fromUsername) {
      toast.error("Por favor, completá todos los campos obligatorios.")
      return
    }
    setShowModal(true)
  }

  const verifyTOTPAndTransfer = async () => {
    // verifica que haya un TOTP ingresado
    if (totpCode.trim().length !== 6) {
      toast.error("El código TOTP debe tener 6 dígitos.")
      return
    }

    try {
      // se verificamos el TOTP
      const res = await fetch("https://raulocoin.onrender.com/api/verify-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: fromUsername,
          totpToken: totpCode.trim()
        })
      })

      const result = await res.json()

      if (!result.success) {
        toast.error("❌ Código TOTP inválido.")
        return
      }

      const body = {
        fromUsername,
        toUsername: selectedUser.username,
        amount: parseFloat(amount),
        description,
        operationToken: result.operationToken,
      }

      const transferRes = await fetch("https://raulocoin.onrender.com/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const transferResult = await transferRes.json()

      if (transferResult.success) {
        toast.success("✅ Transferencia realizada con éxito.")

        // actualizo el balance en localStorage
        const newBalance = transferResult.transfer?.from?.newBalance
        if (typeof newBalance === "number") {
          const raw = localStorage.getItem("userHistory")
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed.user) {
              parsed.user.balance = newBalance
              localStorage.setItem("userHistory", JSON.stringify(parsed))
            }
          }
        }
        //con el mismo totp llamo a transaccionws para acutalizar en dashboard
        try {
          const historyRes = await fetch("https://raulocoin.onrender.com/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: fromUsername,
              totpToken: totpCode.trim(),
            }),
          })
  
          const historyData = await historyRes.json()
  
          if (historyRes.ok && historyData) {
            localStorage.setItem("userHistory", JSON.stringify(historyData))
          } else {
            console.warn("No se pudo actualizar el historial después de la transferencia.")
          }
        } catch (error) {
          console.error("Error al actualizar el historial:", error)
        }
  

        // Reset de inputs y cierre del modal
        setSearch("")
        setSelectedUser(null)
        setAmount("")
        setDescription("")
        setSuggestions([])
        setTotpCode("")
        setShowModal(false)

      } else {
        toast.error("❌ Error: " + transferResult.message)
      }

    } catch (err) {
      console.error(err)
      toast.error("❌ Error de red o servidor.")
    }
  }

  return (
    <div className="transferContainer">
      <div className="transfer-section" style={{ marginTop: "4rem" }}>
        <h2>Realizar Transferencia</h2>

        <div className="transfer-form">
          <div className="form-group" style={{ position: "relative" }}>
            <label>Destinatario (Alias o Nombre)</label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSelectedUser(null)
              }}
              placeholder="Buscar alias..."
            />
            {suggestions.length > 0 && !selectedUser && (
              <ul className="suggestions">
                {suggestions.map((user, i) => (
                  <li key={i} onClick={() => {
                    setSelectedUser(user)
                    setSearch(user.username)
                    setSuggestions([])
                  }}>
                    {user.name} ({user.username})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-group">
            <label>Monto</label>
            <div className="amount-input">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descripción (Opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añadir una descripción"
            />
          </div>

          <button className="transfer-submit-btn" onClick={handleOpenModal}>
            Enviar Transferencia
          </button>

          {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
        </div>
      </div>

      {/* Modal para TOTP */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Verificación con TOTP</h3>
            <p>Ingresa tu código de autenticación (TOTP) para confirmar la transferencia.</p>
            <input
              type="number"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              placeholder="Ej: 123456"
              maxLength={6}
            />
            <div className="modal-buttons">
              <button onClick={verifyTOTPAndTransfer}>Confirmar</button>
              <button onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" toastOptions={{ duration: 2000 }} />

      <style jsx>{`
        .suggestions {
          list-style: none;
          margin: 0;
          padding: 0.5rem;
          background: white;
          border: 1px solid #ccc;
          max-height: 150px;
          overflow-y: auto;
          position: absolute;
          z-index: 10;
          width: 100%;
          top: 100%;
          left: 0;
        }
        .suggestions li {
          padding: 0.5rem;
          cursor: pointer;
        }
        .suggestions li:hover {
          background-color: #f0f0f0;
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }
        .modal {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          width: 90%;
          max-width: 400px;
          text-align: center;
        }
        .modal input {
          margin-top: 1rem;
          padding: 0.5rem;
          width: 100%;
          font-size: 1.1rem;
        }
        .modal-buttons {
          margin-top: 1.5rem;
          display: flex;
          justify-content: space-between;
        }
        .modal-buttons button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .modal-buttons button:first-child {
          background-color: #4CAF50;
          color: white;
        }
        .modal-buttons button:last-child {
          background-color: #ccc;
        }
      `}</style>
    </div>
  )
}
