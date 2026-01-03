"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";

const commands = [
  // Music
  { name: "/play", desc: "Play a song from YouTube, Spotify, or SoundCloud", category: "Music" },
  { name: "/pause", desc: "Pause the currently playing song", category: "Music" },
  { name: "/resume", desc: "Resume the paused song", category: "Music" },
  { name: "/skip", desc: "Skip the current song", category: "Music" },
  { name: "/queue", desc: "Show the current music queue", category: "Music" },
  { name: "/stop", desc: "Stop the music and clear the queue", category: "Music" },
  { name: "/volume", desc: "Change the volume of the music", category: "Music" },
  { name: "/lyrics", desc: "Get lyrics for the current song", category: "Music" },
  
  // Moderation
  { name: "/ban", desc: "Ban a user from the server", category: "Moderation" },
  { name: "/kick", desc: "Kick a user from the server", category: "Moderation" },
  { name: "/mute", desc: "Mute a user temporarily", category: "Moderation" },
  { name: "/purge", desc: "Delete multiple messages at once", category: "Moderation" },
  
  // Fun
  { name: "/ping", desc: "Check the bot's latency", category: "Fun" },
  { name: "/avatar", desc: "Get a user's avatar", category: "Fun" },
  { name: "/poll", desc: "Create a poll for users to vote", category: "Fun" },
];

const categories = ["All", "Music", "Moderation", "Fun"];

export default function CommandsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredCommands = activeCategory === "All" 
    ? commands 
    : commands.filter(cmd => cmd.category === activeCategory);

  return (
    <main className="min-h-screen bg-bunny-black selection:bg-bunny-gold selection:text-black">
      <Navbar />
      
      <div className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">Bot <span className="text-bunny-gold">Commands</span></h1>
            <p className="text-gray-400 text-lg">Explore everything Bunny can do.</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full border transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-bunny-gold text-black border-bunny-gold font-bold"
                    : "bg-transparent text-gray-400 border-white/10 hover:border-bunny-gold/50 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Commands Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommands.map((cmd, i) => (
              <div key={i} className="bg-bunny-card p-6 rounded-2xl border border-white/5 hover:border-bunny-gold/30 transition-all hover:-translate-y-1 group">
                <div className="flex justify-between items-start mb-3">
                  <code className="bg-black/30 text-bunny-gold px-3 py-1 rounded-lg font-mono text-lg">
                    {cmd.name}
                  </code>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 py-1 rounded bg-white/5">
                    {cmd.category}
                  </span>
                </div>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {cmd.desc}
                </p>
              </div>
            ))}
          </div>
          
          {filteredCommands.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              No commands found in this category.
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}