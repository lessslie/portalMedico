import React from 'react'
import { Link, useNavigate } from 'react-router'
import Title from '../../components/fonts/Title'
import ButtonGeneral from '../../components/buttons/ButtonGeneral'
export default function Register() {
  const navigate = useNavigate()
  const handleSubmit = () => {
    navigate('/user/dashboard')
  }
  return (
      <div className='flex flex-col justify-center items-center h-screen max-w-sm mx-auto px-5'>
        <div className='pb-10'><Title text={'Crear Cuenta'} variant={'primary'}/></div>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5 w-full'>
          <select className='border p-2 rounded-sm border-gray-300'>
            <option value="">Selecciona un rol</option>
            <option value="medico">Medico</option>
            <option value="usuario">Usuario</option>
          </select>
          <input placeholder='Nombre' type="text" className='border p-2 rounded-sm border-gray-300'/>
          <input placeholder='Apellido' type="text" className='border p-2 rounded-sm border-gray-300'/>
          <input placeholder='Código' type="text" className='border p-2 rounded-sm border-gray-300'/>
          <input placeholder='Correo' type="email" className='border p-2 rounded-sm border-gray-300'/>
          <input placeholder='Contraseña' type="password" className='border p-2 rounded-sm border-gray-300'/>
          <ButtonGeneral text={'Registrarse'} type={'submit'}/>
        </form>

        <p className='text-center py-5'>Ya tienes cuenta?  <Link to={'/login'} className='text-blue-500'>Iniciar Sesión</Link></p>
      </div>
  )
}
