"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-14 h-14 relative flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Bunny Logo"
              width={56}
              height={56}
              className="w-full h-full object-contain group-hover:opacity-80 transition-opacity rounded-full"
            />
          </div>
          <span className="text-2xl font-bold text-white tracking-wide">Bunny</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { name: "Home", link: "/" },
            { name: "Features", link: "/#features" },
            { name: "Invite", link: process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "#", external: true },
            { name: "Premium", link: "/premium" },
            { name: "Commands", link: "/commands" },
            { name: "Support", link: "/support" }
          ].map((item) => (
            <Link
              key={item.name}
              href={item.link}
              className="text-gray-300 hover:text-white font-medium transition-colors text-sm uppercase tracking-wider"
              target={item.external ? "_blank" : undefined}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Login Button */}
        <div className="hidden md:flex items-center">
          {session ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full border border-bunny-gold"
                  />
                )}
                <span className="text-white font-medium">{session.user?.name}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-full transition-all text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("discord")}
              className="bg-bunny-gold hover:bg-bunny-goldLight text-black font-bold py-2 px-6 rounded-full transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(255,215,0,0.3)]"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black border-t border-white/10 absolute top-20 left-0 right-0 p-6 flex flex-col gap-4">
          {[
            { name: "Home", link: "/" },
            { name: "Features", link: "/#features" },
            { name: "Invite", link: process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "#", external: true },
            { name: "Premium", link: "/premium" },
            { name: "Commands", link: "/commands" },
            { name: "Support", link: "/support" }
          ].map((item) => (
            <Link
              key={item.name}
              href={item.link}
              className="text-gray-300 hover:text-white font-medium py-2"
              onClick={() => setIsOpen(false)}
              target={item.external ? "_blank" : undefined}
            >
              {item.name}
            </Link>
          ))}
          {session ? (
             <button
              onClick={() => signOut()}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full w-full mt-2"
            >
              Logout ({session.user?.name})
            </button>
          ) : (
            <button
              onClick={() => signIn("discord")}
              className="bg-bunny-gold text-black font-bold py-3 px-6 rounded-full w-full mt-2"
            >
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
