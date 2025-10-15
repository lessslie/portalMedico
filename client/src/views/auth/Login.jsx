import React from 'react'
import { Link, useNavigate } from 'react-router'
import Title from '../../components/fonts/Title'
import ButtonGeneral from '../../components/buttons/ButtonGeneral'

export default function Login() {
  const navigate = useNavigate()
  const handleSubmit = () => {
    navigate('/user/dashboard')
  }

  return (
    <div className='flex flex-col justify-center items-center h-screen max-w-sm mx-auto px-5'>
      <div className='pb-10'><Title text={'Iniciar Sesión'} variant={'primary'} /></div>
      <form onSubmit={handleSubmit} className='flex flex-col gap-5 w-full'>
        <input placeholder='Correo' type="email" className='border p-2 rounded-sm border-gray-300' />
        <input placeholder='Contraseña' type="password" className='border p-2 rounded-sm border-gray-300' />
        <ButtonGeneral text={'Iniciar Sesión'} type={'submit'} />
      </form>

      <p className='text-center py-5'>Aún no tienes cuenta? <Link to={'/register'} className='text-blue-500'>Regitrarse</Link></p>
    </div>
  )
}
