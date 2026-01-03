"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

export default function PremiumPage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          setUserData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  return (
    <main className="min-h-screen bg-bunny-black selection:bg-bunny-gold selection:text-black">
      <Navbar />
      
      <div className="relative min-h-[80vh] pt-32 pb-20 px-6">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-bunny-gold/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-bunny-gold via-yellow-200 to-bunny-gold mb-6">
              Premium
            </h1>
            <p className="text-xl text-gray-400">Unlock the full potential of Bunny Bot.</p>
          </div>

          {!session ? (
            <div className="text-center p-12 bg-bunny-card border border-white/10 rounded-3xl">
              <p className="text-xl text-gray-300 mb-6">Please login to view your status</p>
              <button 
                onClick={() => signIn("discord")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold transition-all"
              >
                Login with Discord
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* STATUS CARD */}
              <div className="bg-bunny-card border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Your Status</h2>
                {loading ? (
                  <p className="text-gray-400">Loading...</p>
                ) : userData?.isPremium ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">👑</div>
                    <h3 className="text-3xl font-bold text-bunny-gold mb-2">Premium Active</h3>
                    <p className="text-gray-400">Thank you for supporting Bunny Bot!</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🌑</div>
                    <h3 className="text-2xl font-bold text-gray-300 mb-4">Free Plan</h3>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/checkout", { method: "POST" });
                          const data = await res.json();
                          if (data.url) {
                            window.location.href = data.url;
                          }
                        } catch {}
                      }}
                      className="inline-block bg-bunny-gold hover:bg-yellow-400 text-black px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105"
                    >
                      Upgrade for $4/mo
                    </button>
                    <p className="text-xs text-gray-500 mt-4">Redirects to secure checkout</p>
                  </div>
                )}
              </div>

              {/* FEATURES CARD */}
              <div className="bg-bunny-card border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Premium Perks</h2>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-center gap-3">
                    <span className="text-bunny-gold">✓</span> Play local MP3/MP4 files (/file)
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-bunny-gold">✓</span> Audio Filters (Bassboost, Nightcore)
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-bunny-gold">✓</span> Autoplay Mode
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-bunny-gold">✓</span> 24/7 Radio Mode
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-bunny-gold">✓</span> High Quality Audio
                  </li>
                </ul>
              </div>

              {/* SONG HISTORY - FULL WIDTH */}
              <div className="md:col-span-2 bg-bunny-card border border-white/10 rounded-3xl p-8 mt-4">
                <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
                {loading ? (
                   <p className="text-gray-400">Loading...</p>
                ) : userData?.history?.length > 0 ? (
                  <div className="space-y-3">
                    {userData.history.map((song: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                        <div>
                          <p className="font-bold text-white">{song.title}</p>
                          <p className="text-sm text-gray-400">{song.author}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(song.playedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No songs played recently.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
