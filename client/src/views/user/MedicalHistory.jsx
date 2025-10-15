import React from 'react'
import ButtonGeneral from '../../components/buttons/ButtonGeneral'
import NavbarUser from '../../components/navigation/NavbarUser'

export default function MedicalHistory() {
  return (
    <div className=''>
      <div className='pb-5'><NavbarUser title={'Historial Médico'}/></div>
      <div className=''>
        <form className='flex flex-col gap-5'>
          <input type="text" placeholder='Peso' className='border p-2' />
          <input type="text" placeholder='Estatura' className='border p-2' />
          <input type="text" placeholder='Alergias' className='border p-2' />
          <select name="" id="" className='border p-2'>
            <option value="">O+</option>
            <option value="">O-</option>
          </select>
          <select name="" id="" className='border p-2'>
            <option value="">Masculino</option>
            <option value="">Femenino</option>
          </select>
          <textarea name="" id="" placeholder='Información adicional' className='border p-2' />
          <ButtonGeneral text={'Guardar Historial'} />
        </form>
      </div>
    </div>
  )
}
