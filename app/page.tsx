import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Platforms from "@/components/Platforms";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-bunny-black selection:bg-bunny-gold selection:text-black">
      <Navbar />
      <Hero />
      <Platforms />
      {/* Feature Grid (Simplified version of Lunabot's grid to maintain structure) */}
      <section id="features" className="py-24 bg-bunny-dark/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Why <span className="text-bunny-gold">Bunny?</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Unlock the full potential of your Discord server with our premium features.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
             {[
               { title: "24/7 Support", desc: "Our support team is always available to help you with any issues." },
               { title: "Audio Effects", desc: "Enhance your listening experience with bass boost, nightcore, and more." },
               { title: "Global Volume", desc: "Control the volume of the music for everyone in the voice channel." },
               { title: "Saved Playlists", desc: "Save your favorite queues and playlists to play them later." },
               { title: "Autoplay", desc: "Let the bot choose the next song for you based on your listening history." },
               { title: "Custom Playlists", desc: "Import playlists from Spotify, Apple Music, and more." },
             ].map((feature, i) => (
               <div key={i} className="bg-bunny-card p-8 rounded-3xl border border-white/5 hover:border-bunny-gold/30 transition-colors group">
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-bunny-gold transition-colors">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
