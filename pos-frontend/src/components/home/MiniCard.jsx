import React from 'react'

const MiniCard = ({ title, icon, number, footerNum, variant = "primary", prefix = "" }) => {
  const accent = variant === "success" ? "bg-[#02ca3a]" : "bg-theme-accent";
  return (
    <div className='bg-theme-surface py-5 px-5 rounded-lg w-[50%] border border-theme-border'>
        <div className='flex items-start justify-between'>
            <h1 className='text-theme-text text-lg font-semibold tracking-wide'>{title}</h1>
            <span className={`${accent} p-3 rounded-lg text-white text-2xl`} aria-hidden="true">{icon}</span>
        </div>
        <div>
            <h1 className='text-theme-text text-4xl font-bold mt-5'>{prefix}{number}</h1>
            {footerNum != null && (
              <p className='text-theme-muted text-sm mt-2'>
                <span className='text-[#02ca3a] font-semibold'>{footerNum}%</span> respecto a ayer
              </p>
            )}
        </div>
    </div>
  )
}

export default MiniCard