// App.jsx
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/dashboard'
import AuthLayout from './pages/AuthLayout'
import FullHistoryPage from './pages/full-history'
import TransferPage from './pages/transfer'
import MainLayout from './components/layout'
import PrivateRoute from "./components/PrivateRoute"


function App() {
  return (
    
    <Routes>
      <Route path="/" element={<AuthLayout />} />

      {/* Rutas que tienen navbar */}
      <Route element={<MainLayout />}>
      <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/transfer" element={
          <PrivateRoute>
          <TransferPage />
          </PrivateRoute>
          } />
        <Route path="/full-history" element={
          <PrivateRoute>
          <FullHistoryPage />
          </PrivateRoute>
          } />
      </Route>
    </Routes>
  )
}

export default App
