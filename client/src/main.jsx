import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import OnBoarding from './views/OnBoarding';
import Login from './views/auth/Login';
import Register from './views/auth/Register';
import UserLayout from './layouts/UserLayout';
import UserDashboard from './views/user/Dashboard';
import MedicalHistory from './views/user/MedicalHistory';
import Comunication from './views/user/Comunication';
import MedicalAppointment from './views/user/MedicalAppointment';
import UserProfile from './views/user/UserProfile';
import DoctorDashboard from './views/doctor/Dashboard';
import DoctorProfile from './views/doctor/DoctorProfile';
import DoctorLayout from './layouts/DoctorLayout';
import Appointments from './views/doctor/Appointments';
import PatientsHistory from './views/doctor/PatientsHistory';



const router = createBrowserRouter([
  {
    path: "/",
    element: <OnBoarding/>,
  },
  {
    path: "/login",
    element: <Login/>,
  },
  {
    path: "/register",
    element: <Register/>,
  },
  {
    path: "/user",
    element: <UserLayout/>,
    children: [
      {
        path: "dashboard",
        element: <UserDashboard/>,
      },
      {
        path: "medical-history",
        element: <MedicalHistory/>,
      },
      {
        path: "medical-appointment",
        element: <MedicalAppointment/>,
      },
      {
        path: "comunication",
        element: <Comunication/>,
      },
      {
        path: "profile",
        element: <UserProfile/>,
      },
    ],
  },
  {
    path: "/doctor",
    element: <DoctorLayout/>,
    children: [
      {
        path: "dashboard",
        element: <DoctorDashboard/>,
      },
      {
        path: "profile",
        element: <DoctorProfile/>,
      },
      {
        path: "appointments",
        element: <Appointments/>,
      },
      {
        path: "patients-history",
        element: <PatientsHistory/>,
      },
    ],
  },
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <RouterProvider router={router} />,
);