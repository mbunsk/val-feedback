import { CheckCircle } from "lucide-react";
import { SiX, SiLinkedin, SiYoutube, SiTiktok } from "react-icons/si";
import validatorIcon from "@assets/Validator AI Icon_1754233923589.png";

export default function Footer() {
  return (
    <footer id="about" className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/95 to-slate-900/95"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src={validatorIcon} 
                alt="ValidatorAI Logo" 
                className="w-12 h-12"
              />
              <span className="text-2xl font-black text-white">ValidatorAI</span>
            </div>
            <p className="text-white/80 mb-8 max-w-md text-lg leading-relaxed">
              Since 2022, we've helped several hundred thousand startup founders explore and validate their ideas. Some of our members are seasoned founders, some are corporate workers exploring ideas and some are just idea-curious. We're glad you're here. Follow along on socials below 👇
            </p>
            <div className="flex space-x-6">
              <a href="https://x.com/validatoraiapp" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-all duration-300 transform hover:scale-110">
                <span className="sr-only">X (Twitter)</span>
                <SiX className="w-7 h-7" />
              </a>
              <a href="https://www.linkedin.com/in/aronmeystedt/" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-all duration-300 transform hover:scale-110">
                <span className="sr-only">LinkedIn</span>
                <SiLinkedin className="w-7 h-7" />
              </a>
              <a href="https://www.youtube.com/channel/UCWlmPaoLVPQPT2xsAWfn3gg?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-all duration-300 transform hover:scale-110">
                <span className="sr-only">YouTube</span>
                <SiYoutube className="w-7 h-7" />
              </a>
              <a href="https://www.tiktok.com/@validatorai" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-all duration-300 transform hover:scale-110">
                <span className="sr-only">TikTok</span>
                <SiTiktok className="w-7 h-7" />
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-black text-white tracking-wider mb-6">🚀 Explore</h3>
            <ul className="space-y-4">
              <li><a href="/about" className="text-white/70 hover:text-white transition-all duration-300 transform hover:scale-105 hover:translate-x-2 text-lg">About</a></li>
              <li><a href="#testimonials" className="text-white/70 hover:text-white transition-all duration-300 transform hover:scale-105 hover:translate-x-2 text-lg">Success Stories</a></li>
              <li><a href="/about#contact" className="text-white/70 hover:text-white transition-all duration-300 transform hover:scale-105 hover:translate-x-2 text-lg">Get in Touch</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-black text-white tracking-wider mb-6">📋 Legal Stuff</h3>
            <ul className="space-y-4">
              <li><a href="/privacy" className="text-white/70 hover:text-white transition-all duration-300 transform hover:scale-105 hover:translate-x-2 text-lg">Privacy Policy</a></li>
              <li><a href="/terms" className="text-white/70 hover:text-white transition-all duration-300 transform hover:scale-105 hover:translate-x-2 text-lg">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="text-center">
            <p className="text-white/80 text-lg font-semibold mb-2">
              🎯 Ready to turn your wild idea into reality?
            </p>
            <p className="text-white/60 text-sm">
              © 2025 ValidatorAI. Made with ❤️ for dreamers and builders everywhere.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
