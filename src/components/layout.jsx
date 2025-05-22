// components/MainLayout.jsx
import Navbar from '../components/navbar'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from "react-toastify"


const MainLayout = () => {
  return (
    <>
     <ToastContainer />
      <Navbar />
      <div className="main-content">
        <Outlet />
      </div>
    </>
  )
}

export default MainLayout
