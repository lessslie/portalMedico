import React from 'react'
import { Link } from 'react-router'
import NavbarDoctor from '../../components/navigation/NavbarDoctor'

export default function Dashboard() {
  return (
    <div>
      <div className='pb-5'><NavbarDoctor title={'Dashboard Doctor'} /></div>
      <div className='grid grid-cols-2 gap-5'>
        <Link to={'/doctor/appointments'} className='border p-2'>Citas Agendadas</Link>
        <Link to={'/doctor/patients-history'} className='border p-2'>Historial de Pacientes</Link>
      </div>
    </div>
  )
}

