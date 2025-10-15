import React from 'react'
import { Link, useNavigate } from 'react-router'
import ButtonGeneral from '../buttons/ButtonGeneral'
import { useUIStore } from '../../stores/useUIStore'

export default function SidebarDoctor() {
  const sidebar = useUIStore((state) => state.sidebar)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const navigate = useNavigate()
  const handleSignOut = () => {
    toggleSidebar()
    navigate('/login')
  }

  return (
    <>
      {/* ----- Backdrop con gradiente negro */}
      {sidebar && (
        <div
          className='fixed inset-0 bg-gradient-to-r from-black/80 to-black/60 z-40'
          onClick={toggleSidebar}
        />
      )}

      {/* ----- Sidebar */}
      <div className={`${sidebar ? 'block' : 'hidden'} md:block fixed md:relative z-50 md:z-auto`}>
        <div className='h-screen md:border-r p-5 flex flex-col justify-between min-w-64 bg-white'>
          <div className='flex flex-col gap-1'>
            <p className='font-bold text-xl pb-5 whitespace-nowrap'>Hola Doctor</p>
            <Link to={'/doctor/profile'} onClick={sidebar && toggleSidebar}  className='whitespace-nowrap'>Mi perfil</Link>
            <Link onClick={toggleSidebar} className='whitespace-nowrap'>Notificaciones (Pronto)</Link>
            <Link onClick={toggleSidebar} className='whitespace-nowrap'>Ayuda (Pronto)</Link>
          </div>
          <ButtonGeneral text={'Cerrar Sesión'} onClick={handleSignOut} />
        </div>
      </div>
    </>
  )
}
