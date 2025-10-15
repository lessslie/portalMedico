import React from 'react'
import ButtonGeneral from '../../components/buttons/ButtonGeneral'
import Title from '../../components/fonts/Title'
import NavbarUser from '../../components/navigation/NavbarUser'

export default function MedicalAppointment() {
  return (
    <div className=''>
      <div className='pb-5'><NavbarUser title={'Historial Médico'}/></div>
      <div className='flex flex-col md:flex-row gap-10'>
        {/* ----- Form - Separar cita */}
        <div className='w-full md:w-1/2'>
          <Title text={'Separar Cita'} variant={'secondary'} />
          <form className='flex flex-col w-full gap-5'>
            <input type="text" placeholder='Especialidad' className='border p-2' />
            <textarea name="" id="" placeholder='Consulta' className='border p-2' />
            <input type="text" placeholder='Medico' className='border p-2' />
            <input type="date" className='border p-2' />
            <input type="time" name="" id="" className='border p-2' />
            <ButtonGeneral text={'Separar Cita'} />
          </form>
        </div>
        {/* ----- Historial */}
        <div className='w-full md:w-1/2'>
          <Title text={'Historial de citas'} variant={'secondary'} />
          <div className='flex flex-col gap-5'>
            <div className='border p-2'>
              <p>Fecha y hora</p>
              <p>Medico</p>
              <p>Consulta</p>
              <p>Especialidad</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
