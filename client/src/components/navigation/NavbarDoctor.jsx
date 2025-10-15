import React from 'react'
import Title from '../fonts/Title'
import { useUIStore } from '../../stores/useUIStore'
import { Link } from 'react-router'
import { IoMenu } from "react-icons/io5";

export default function NavbarDoctor({ title }) {
    const toggleSidebar = useUIStore((state) => state.toggleSidebar)

    return (
        <div className='flex justify-between items-center'>
            <Link to={'/doctor/dashboard'}><Title text={`${title}`} variant={'primary'} /></Link>
            <button onClick={toggleSidebar} className='cursor-pointer md:hidden text-3xl'><IoMenu /></button>
        </div>
    )
}
