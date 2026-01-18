"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Trees,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Users,
  Wifi,
  Coffee,
  Star,
  CheckCircle2
} from "lucide-react";

// --- Strict Interface Definition (As requested) ---
import { HotelData, RoomData } from "@/types/room";

interface TemplateProps {
  hotel: HotelData;
  rooms: RoomData[];
  onBook: (room: RoomData) => void;
}

// --- Animation Components ---

const FadeIn = ({ children, delay = 0, direction = "up" }: { children: React.ReactNode, delay?: number, direction?: "up" | "down" | "left" | "right" }) => {
  const directionOffset = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionOffset[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

// --- Main Component ---

export default function ForestRetreatTemplate({ hotel, rooms, onBook }: TemplateProps) {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 600], [0, 300]);

  // Handle Scroll for Navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    if (typeof window !== 'undefined') window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dynamic Colors
  const primaryColor = hotel.config.colors.primary || "#2c4c3b"; // Default forest green
  const secondaryColor = hotel.config.colors.secondary || "#d4a373"; // Default earth tone

  return (
    <div className="min-h-screen bg-[#fafaf9] font-sans text-slate-800 selection:bg-green-100">

      {/* --- Navigation --- */}
      <motion.nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: primaryColor }}>
              <Trees className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${scrolled ? "text-slate-900" : "text-white"}`}>
              {hotel.name}
            </span>
          </div>

          <button
            className={`hidden md:block px-6 py-2.5 rounded-full font-medium text-sm transition-all transform hover:scale-105 active:scale-95`}
            style={{
              backgroundColor: scrolled ? primaryColor : "white",
              color: scrolled ? "white" : primaryColor
            }}
          >
            Book Your Stay
          </button>
        </div>
      </motion.nav>

      {/* --- Hero Section --- */}
      <section className="relative h-[90vh] overflow-hidden flex items-center justify-center">
        <motion.div style={{ y: heroParallax }} className="absolute inset-0 z-0">
          <div
            className="w-full h-[120%] -mt-20 bg-cover bg-center"
            style={{ backgroundImage: `url(${hotel.config.hero.backgroundImage || hotel.coverImage})` }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto text-white">
          <FadeIn delay={0.2}>
            <span className="inline-block px-4 py-1 mb-6 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-xs font-medium tracking-[0.2em] uppercase">
              Welcome to Nature
            </span>
          </FadeIn>
          <FadeIn delay={0.4}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {hotel.config.hero.title}
            </h1>
          </FadeIn>
          <FadeIn delay={0.6}>
            <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto mb-10">
              {hotel.config.hero.subtitle}
            </p>
          </FadeIn>
          <FadeIn delay={0.8}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full font-semibold text-white shadow-lg flex items-center gap-2 mx-auto"
              style={{ backgroundColor: secondaryColor }}
              onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Rooms <ArrowRight className="w-4 h-4" />
            </motion.button>
          </FadeIn>
        </div>
      </section>

      {/* --- About Section --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn direction="right">
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={hotel.config.gallery?.[0] || hotel.coverImage}
                  alt="About Hotel"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-white p-6 rounded-xl shadow-xl hidden md:flex flex-col justify-center items-center text-center">
                <Star className="w-8 h-8 text-yellow-500 mb-2 fill-yellow-500" />
                <span className="text-3xl font-bold text-slate-900">4.9</span>
                <span className="text-slate-500 text-xs uppercase tracking-wide mt-1">Guest Rating</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="left">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: secondaryColor }}>
                Our Story
              </h2>
              <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                {hotel.config.about.title}
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                {hotel.config.about.content}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {hotel.amenities.slice(0, 6).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                    <div className="p-2 rounded-full bg-slate-50">
                      <CheckCircle2 className="w-4 h-4" style={{ color: primaryColor }} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- Rooms Section --- */}
      <section id="rooms" className="py-24 bg-slate-100 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <FadeIn>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: secondaryColor }}>
                Accommodations
              </h2>
              <h3 className="text-4xl font-bold text-slate-900">
                Find Your Inner Peace
              </h3>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room, idx) => (
              <FadeIn key={room.id} delay={idx * 0.1}>
                <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={room.image || room.images?.[0]?.url || ""}
                      alt={room.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase">
                      Max {room.capacity.adults} Adults
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-xl font-bold text-slate-900 group-hover:text-[color:var(--hover-color)] transition-colors" style={{ '--hover-color': primaryColor } as any}>
                        {room.name}
                      </h4>
                    </div>

                    <p className="text-slate-500 text-sm mb-6 line-clamp-3 flex-grow">
                      {room.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {room.amenities.slice(0, 3).map((am, i) => (
                        <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-50 rounded text-slate-600">
                          {am}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-50 rounded text-slate-400">
                          +{room.amenities.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold" style={{ color: primaryColor }}>
                          ${room.price}
                        </span>
                        <span className="text-slate-400 text-xs"> / night</span>
                      </div>

                      <button
                        onClick={() => onBook(room)}
                        className="px-6 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* --- Footer / Contact --- */}
      <footer className="text-white pt-24 pb-12 px-6" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Trees className="w-8 h-8 text-white/80" />
              <span className="text-2xl font-bold">{hotel.name}</span>
            </div>
            <p className="text-white/70 max-w-sm mb-8 leading-relaxed">
              Experience the harmony of nature and luxury. We provide a sanctuary where you can unwind, recharge, and reconnect.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-lg mb-6">Contact</h5>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{hotel.config.contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 shrink-0" />
                <span>{hotel.config.contact.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 shrink-0" />
                <span>{hotel.config.contact.email}</span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-lg mb-6">Links</h5>
            <ul className="space-y-3 text-white/70">
              <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#rooms" className="hover:text-white transition-colors">Our Rooms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Amenities</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gallery</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/40">
          <p>&copy; {new Date().getFullYear()} {hotel.name}. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}