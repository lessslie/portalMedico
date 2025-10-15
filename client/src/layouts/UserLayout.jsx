import { Outlet } from 'react-router'
import SidebarUser from '../components/navigation/SidebarUser'

export default function UserLayout() {
    return (
        <div className='max-w-7xl mx-auto flex'>
            <SidebarUser />
            <div className='w-full p-5'><Outlet /></div>
        </div>
    )
}
