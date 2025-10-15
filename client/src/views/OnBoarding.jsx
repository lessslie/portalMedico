import React from 'react'
import { Link } from "react-router";
import Title from '../components/fonts/Title'

export default function OnBoarding() {
  return (
    <div className='max-w-7xl mx-auto h-screen px-5 flex flex-col justify-center'>
      <Title text={'Información del negocio de la aplicación'} variant={'primary'}/>
      <p>Prueba nuestro servicio ahora!</p>
      <div className='pt-5 md:pt-10 flex gap-5'>
        <Link to={"/login"} className='border py-2 px-10 rounded-sm bg-black text-white'>Login</Link>
        <Link to={"/register"} className='border py-2 px-10 rounded-sm bg-black text-white'>Register</Link>
      </div>
    </div>
  )
}
