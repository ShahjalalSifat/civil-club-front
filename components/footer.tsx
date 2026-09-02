'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin, Youtube, Mail, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export function Footer() {
  return (
    <footer className="mt-24 pt-16 pb-8 border-t border-black/5 dark:border-white/10 glass rounded-t-[40px] relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 group">
              <div className="w-12 h-12 flex items-center justify-center relative rounded-xl overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="Civil Engineering Club Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-xl tracking-tight">Civil Engineering Club</span>
            </div>
            <p className="text-primary-light/70 dark:text-primary/70 max-w-xs">
              We grow dreams not houses. Empowering the next generation of leaders through community, resources, and action.
            </p>
            <div className="flex items-center gap-4">
              {[Facebook, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1, rotate: 12, y: -2 }}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center hover:text-info-light transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg mb-2">Quick Links</h4>
            {[
              { name: 'Home', href: '/' },
              { name: 'Executive Committee', href: '/about/leadership/executive' },
              { name: 'Alumni Network', href: '/about/leadership/alumni' },
              { name: 'Upcoming Events', href: '/events/upcoming' },
              { name: 'Notice Board', href: '/events/notice' },
              { name: 'Contact Us', href: '/contact' },
            ].map((item) => (
              <Link key={item.name} href={item.href} className="text-primary-light/70 dark:text-primary/70 hover:text-info-light transition-colors flex items-center gap-2 group">
                <span className="w-0 h-[2px] bg-info-light transition-all duration-300 group-hover:w-4"></span>
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg mb-2">Resources & Verification</h4>
            {[
              { name: 'Club Constitution', href: '/about/constitution' },
              { name: 'Our History', href: '/about/history' },
              { name: 'Membership ID Check', href: '/verification/membership' },
              { name: 'Certificate Verification', href: '/verification/certificate' },
              { name: 'Academic Resources', href: '/content/resources' },
              { name: 'Photo Gallery', href: '/content/gallery' },
            ].map((item) => (
              <Link key={item.name} href={item.href} className="text-primary-light/70 dark:text-primary/70 hover:text-info-light transition-colors flex items-center gap-2 group">
                <span className="w-0 h-[2px] bg-info-light transition-all duration-300 group-hover:w-4"></span>
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg mb-2">Contact Info</h4>
            <div className="flex items-start gap-3 text-primary-light/70 dark:text-primary/70">
              <MapPin className="w-5 h-5 shrink-0 mt-1 text-info-light" />
              <p>Dr. Muhammad Qudrat-I- Khuda Academic building, Level 2 <br />Dinajpur, Bangladesh</p>
            </div>
            <div className="flex items-center gap-3 text-primary-light/70 dark:text-primary/70 mt-2">
              <Mail className="w-5 h-5 shrink-0 text-info-light" />
              <p>contact@civilengineeringclub.edu</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 flex items-center justify-between px-6 py-4 glass rounded-2xl hover:bg-white/80 transition-colors"
            >
              <span className="font-semibold text-sm">Join our Newsletter</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-black/5 dark:border-white/10 gap-4 text-sm text-primary-light/60 dark:text-primary/60">
          <p>© {new Date().getFullYear()} Civil Engineering Club. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-info-light transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-info-light transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
