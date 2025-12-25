import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-bunny-dark border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Bunny Logo"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="text-xl font-bold text-white">Bunny</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            The best Discord music bot for your server. High quality music, 24/7 support, and easy to use.
          </p>
        </div>
        
        <div>
          <h3 className="font-bold text-white mb-6">Product</h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link href="#" className="hover:text-bunny-gold transition">Premium</Link></li>
            <li><Link href="#" className="hover:text-bunny-gold transition">Commands</Link></li>
            <li><Link href="#" className="hover:text-bunny-gold transition">Partners</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-white mb-6">Resources</h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link href="#" className="hover:text-bunny-gold transition">Support Server</Link></li>
            <li><Link href="#" className="hover:text-bunny-gold transition">Status</Link></li>
            <li><Link href="#" className="hover:text-bunny-gold transition">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-white mb-6">Legal</h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link href="#" className="hover:text-bunny-gold transition">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-bunny-gold transition">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-bunny-gold transition">Refund Policy</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-sm">© 2024 Bunny Bot. All rights reserved.</p>
        <div className="flex gap-6">
            {/* Social Icons Placeholder */}
        </div>
      </div>
    </footer>
  );
}
