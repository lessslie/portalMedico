import { Outlet } from 'react-router'
import SidebarDoctor from '../components/navigation/SidebarDoctor'

export default function DoctorLayout() {
    return (
        <div className='max-w-7xl mx-auto flex'>
            <SidebarDoctor />
            <div className='w-full p-5'><Outlet /></div>
        </div>
    )
}
