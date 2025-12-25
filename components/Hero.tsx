"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-bunny-black">
      {/* Background Gradient Spotlights */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-bunny-gold/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
        {/* Left Content */}
        <div className="space-y-8 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
            The Best <br />
            <span className="text-bunny-gold">Discord</span> Music Bot
          </h1>
          <p className="text-bunny-muted text-lg md:text-xl max-w-lg leading-relaxed">
            A general bot with many music commands, you can use for free and it is very fast and safe!
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <a 
              href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-bunny-gold hover:bg-bunny-goldLight text-black font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,215,0,0.3)] text-lg inline-block text-center"
            >
              Add to Discord
            </a>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 px-10 rounded-full transition-all hover:scale-105 backdrop-blur-sm text-lg">
              Features
            </button>
          </div>
        </div>

        {/* Right Content - 3D Card */}
        <div className="relative flex justify-center items-center perspective-1000">
          {/* Background Discord Logo */}
          <div className="absolute -z-10 opacity-[0.03] transform scale-150 rotate-12">
            <svg viewBox="0 0 127 96" className="w-96 h-96 text-white fill-current">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.82,105.82,0,0,0,126.6,80.22c2.36-24.44-2.91-49.33-18.9-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.25-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
            </svg>
          </div>

          {/* Music Player Card */}
          <div className="relative w-80 bg-bunny-card rounded-[2rem] p-6 shadow-2xl animate-float border border-white/5 backdrop-blur-xl transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-500">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="ml-auto text-[10px] font-bold tracking-widest text-bunny-muted uppercase">Now Playing</div>
            </div>

            {/* Album Art */}
            <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-gray-800 to-black mb-6 overflow-hidden shadow-lg group">
              {/* Bunny Placeholder Art */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                  <Image 
                     src="/logo.png" 
                     alt="Bunny Album Art" 
                     width={200} 
                     height={200} 
                     className="w-full h-full object-cover rounded-full shadow-2xl"
                   />
              </div>
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Song Info */}
            <div className="text-center mb-6">
              <h3 className="text-white font-bold text-lg truncate">Bunny Vibes</h3>
              <p className="text-bunny-muted text-sm">Best Music Bot</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-bunny-gold rounded-full" />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-bunny-muted font-medium">
                <span>1:23</span>
                <span>3:45</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-2">
              {/* Loop */}
              <button className="text-bunny-muted hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                </svg>
              </button>
              
              {/* Like */}
              <button className="text-bunny-muted hover:text-bunny-gold transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 4.05 7.15 8.71 11.36L12 21l1.29-1.14C17.95 15.65 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3z"/>
                </svg>
              </button>

              {/* Play/Pause Group */}
              <div className="flex items-center gap-4">
                 {/* Stop */}
                 <button className="text-white hover:text-bunny-gold transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 6h12v12H6z"/>
                    </svg>
                 </button>

                 {/* Pause (Center) */}
                 <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                 </button>

                 {/* Next */}
                 <button className="text-white hover:text-bunny-gold transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                    </svg>
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
