"use client"

import { useEffect, useState } from "react"
import { ArrowDownLeft, ArrowUpRight } from "../components/icons"
import "../styles/dashboard.css"
import { jsPDF } from "jspdf"
import {FileDown} from "lucide-react"

function generatePDF(transaction) {
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const boxWidth = pageWidth - margin * 2;
  const boxHeight = 100;
  const startY = 30;

  // Fondo con estilo tarjeta
  doc.setFillColor(240, 240, 240); // Gris claro tipo tarjeta
  doc.roundedRect(margin, startY, boxWidth, boxHeight, 8, 8, "F");

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(50, 50, 50);
  doc.text("Comprobante de Transacción RauloCoins", pageWidth / 2, startY + 12, { align: "center" });

  // Texto base
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);

  let y = startY + 30;
  const spacing = 10;

  doc.text(`ID de transacción: ${transaction.id || "N/A"}`, margin + 10, y);
  y += spacing;
  doc.text(`Fecha: ${formatDate(transaction.createdAt)}`, margin + 10, y);
  y += spacing;
  doc.text(`Tipo: ${transaction.type === "sent" ? "Enviado" : "Recibido"}`, margin + 10, y);
  y += spacing;

  if (transaction.type === "sent") {
    doc.text(`De: ${transaction.fromUsername}`, margin + 10, y); 
    doc.text(`Para: ${transaction.toUsername}`, margin + 100, y); 
  } else {
    doc.text(`De: ${transaction.fromUsername}`, margin + 10, y);
    doc.text(`Para: ${transaction.toUsername}`, margin + 100, y);
  }
  y += spacing;

  // Monto
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text(`Monto: $${Math.abs(transaction.amount).toFixed(2)}`, margin + 10, y);
  y += spacing;

  // Línea inferior decorativa
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, startY + boxHeight - 15, pageWidth - margin, startY + boxHeight - 15);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text("Gracias por usar nuestro sistema", pageWidth / 2, startY + boxHeight - 7, {
    align: "center",
  });

  doc.save(`comprobante_${transaction.id || "transaccion"}.pdf`);
}


export default function FullHistoryPage() {
  const [transactions, setTransactions] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const rawData = localStorage.getItem("userHistory")
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData)
        if (parsed.transactions && Array.isArray(parsed.transactions)) {
          const sorted = parsed.transactions.sort((a, b) => b.createdAt - a.createdAt)
          setTransactions(sorted)
        } else {
          console.error("El objeto no tiene un array 'transactions'")
        }
      } catch (err) {
        console.error("Error al parsear userHistory:", err)
      }
    }
  }, [])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem)

  return (
    <div className="full-history" style={{ marginTop: "4rem" }}>
      <h2>Historial Completo</h2>
      <div className="transactions-list full">
        {currentTransactions.map((transaction, index) => (
          <div key={transaction.id || index} className="transaction-item" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className={`transaction-icon ${transaction.type === "sent" ? "sent" : "received"}`}>
              {transaction.type === "sent" ? <ArrowUpRight /> : <ArrowDownLeft />}
            </div>
            <div className="transaction-details">
              <div className="transaction-title">
                {transaction.type === "sent"
                  ? `Enviado a ${transaction.toName}`
                  : transaction.type === "received"
                    ? `Recibido de ${transaction.fromName}`
                    : "Transacción"}
              </div>
              <div className="transaction-date">{formatDate(transaction.createdAt)}</div>
            </div>
              <div className="transaction-amount">
                <span className={transaction.amount < 0 ? "sent" : "received"}>
                  {transaction.amount < 0 ? "-" : "+"}${Math.abs(transaction.amount).toFixed(2)}
                </span>
                <button
                  onClick={() => generatePDF(transaction)}
                  className="download-btn"
                  title="Descargar comprobante"
                  style={{ marginLeft: "1rem", background: "none", border: "none", cursor: "pointer" }}
                >
                  <FileDown size={18} />
                </button>
              </div>

          </div>
        ))}

        <div className="pagination">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Anterior
          </button>
          <span>Página {currentPage} de {Math.ceil(transactions.length / itemsPerPage)}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(transactions.length / itemsPerPage)))}
            disabled={currentPage === Math.ceil(transactions.length / itemsPerPage)}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}

function formatDate(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000)
  const options = { year: "numeric", month: "short", day: "numeric" }
  return date.toLocaleDateString("es-ES", options)
}
