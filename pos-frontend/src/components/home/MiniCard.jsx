import React from 'react'

const MiniCard = ({title, icon, number, footerNum}) => {
  return (
    <div className='bg-theme-surface py-5 px-5 rounded-lg w-[50%]'>
        <div className='flex items-start justify-between'>
            <h1 className='text-theme-text text-lg font-semibold tracking-wide'>{title}</h1>
            <button className={`${title === "Ingresos Totales" ? "bg-[#02ca3a]" : "bg-[#f6b100]"} p-3 rounded-lg text-white text-2xl`}>{icon}</button>
        </div>
        <div>
            <h1 className='text-theme-text text-4xl font-bold mt-5'>{
              title === "Ingresos Totales" ? `Bs ${number}` : number}</h1>
            <h1 className='text-theme-text text-lg mt-2'><span className='text-[#02ca3a]'>{footerNum}%</span> que ayer</h1>
        </div>
    </div>
  )
}

export default MiniCard