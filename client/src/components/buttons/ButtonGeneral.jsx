import React from 'react'

export default function ButtonGeneral({text, onClick}) {
  return (
    <button onClick={onClick} className='bg-black text-white p-2 rounded-md cursor-pointer'>
        {text}
    </button>
  )
}
