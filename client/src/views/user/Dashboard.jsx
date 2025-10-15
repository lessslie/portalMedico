import React from 'react'
import { Link } from 'react-router'
import NavbarUser from '../../components/navigation/NavbarUser'

export default function Dashboard() {
  return (
    <>
      <div className='pb-5'><NavbarUser title={'Dashboard Usuario'}/></div>
      <div className='grid grid-cols-2 gap-5'>
        <Link to={'/user/medical-history'} className='border p-2'>Historial Médico</Link>
        <Link to={'/user/medical-appointment'} className='border p-2'>Agendar Cita</Link>
        <Link to={'/user/comunication'} className='border p-2'>Teleconsultas y chat</Link>
      </div>
    </>
  )
}
