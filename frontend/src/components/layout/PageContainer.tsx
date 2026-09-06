import React from 'react'
import Header from './Header'

export default function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 h-full flex flex-col min-w-0 bg-slate-50 relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-coral/5 rounded-full blur-[100px] pointer-events-none" />
      <Header />
      <main className="flex-1 overflow-y-auto p-8 relative z-10" id="main-scroll">
        <div className="max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
