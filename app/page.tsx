'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Users, Award, BookOpen, MapPin, CalendarPlus } from 'lucide-react';
import { getLatestBlogs, getUpcomingEvents } from '@/lib/db';

function AnimatedCounter({ endValue, duration = 2000, suffix = "" }: { endValue: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeProgress * endValue));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [endValue, duration, isInView]);

  // Format with commas if over 999
  const formatted = count >= 1000 ? count.toLocaleString() : count.toString();
  return <span ref={ref}>{formatted}{suffix}</span>;
}

function TypewriterHeading() {
  const [text, setText] = React.useState('');
  const fullText = "WE GROW DREAMS NOT HOUSES.";

  React.useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const timer = setInterval(() => {
        i++;
        setText(fullText.slice(0, i));
        if (i >= fullText.length) clearInterval(timer);
      }, 65);
    }, 150);
    return () => clearTimeout(timeout);
  }, []);

  const renderText = (t: string) => {
    const showDreams = t.length >= 8;
    const showLine2 = t.length >= 15;
    return (
      <>
        {t.slice(0, 7)}
        {showDreams && <br />}
        {showDreams && (
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-info-light to-blue-400">
            {t.slice(8, 14)}
          </span>
        )}
        {showLine2 && <br />}
        {showLine2 && t.slice(15)}
      </>
    );
  };

  return (
    <div className="text-[15vw] xs:text-[14vw] sm:text-6xl md:text-7xl lg:text-[80px] leading-[1.18] sm:leading-[1.12] tracking-tight font-bold pt-10 pb-6 sm:py-0 mt-3 mb-4 sm:my-0 sm:-mt-6 md:-mt-20 lg:-mt-22 relative w-full text-left">
      <div className="opacity-0 pointer-events-none select-none text-left" aria-hidden="true">
        {renderText(fullText)}
      </div>
      <div className="absolute top-0 left-0 w-full h-full pt-10 sm:pt-4 md:pt-0 text-left">
        {renderText(text)}
        <span className="animate-pulse border-r-4 border-info-light ml-1 sm:ml-2 inline-block h-[0.8em] align-middle" />
      </div>
    </div>
  );
}

export default function Home() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const b = await getLatestBlogs(3);
      const e = await getUpcomingEvents(3);
      setBlogs(b);
      setUpcomingEvents(e);
    }
    loadData();
  }, []);
  return (
    <div className="flex flex-col gap-24 pb-12">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center pt-8">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-5 max-w-2xl relative z-10">
              <TypewriterHeading />
              
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg md:text-xl text-primary-light/70 dark:text-primary/70 max-w-lg leading-relaxed"
              >
                Empowering the next generation of visionaries, builders, and leaders through an active community and extensive resources.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Link href="/content/gallery" className="btn-primary group">
                  Explore Gallery
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/contact" className="btn-secondary">
                  Contact Us
                </Link>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateX: 10, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-[500px] lg:h-[700px] w-full"
              style={{ perspective: 1000 }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-info-light/20 to-transparent rounded-[40px] transform rotate-3" />
              <div className="absolute inset-0 glass-card overflow-hidden">
                <Image 
                  src="/heroimg2.png"
                  alt="Club activities"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="container mx-auto px-6 max-w-7xl">
        <div className="glass rounded-[36px] p-8 md:p-12 border-white/40 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-black/5 dark:divide-white/10">
            {[
              { label: 'Active Members', endValue: 250, suffix: '+' , icon: Users },
              { label: 'Years Established', endValue: 11, suffix: '', icon: Calendar },
              { label: 'Alumni Network', endValue: 600, suffix: '+', icon: Award },
              { label: 'Resources', endValue: 350, suffix: '+', icon: BookOpen },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="flex flex-col items-center justify-center text-center gap-3 px-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-info-light/10 text-info-light flex items-center justify-center mb-2 group hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                </div>
                <div className="text-4xl md:text-5xl font-bold font-numbers tracking-tight">
                  <AnimatedCounter endValue={stat.endValue} suffix={stat.suffix} />
                </div>
                <div className="text-sm font-medium text-secondary-light uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Overview */}
      <section className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[400px] lg:h-[600px] w-full rounded-[36px] overflow-hidden group shadow-2xl"
          >
            <Image
              src="/home2.png"
              alt="About our club"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <div className="glass px-6 py-4 rounded-2xl border-white/20 backdrop-blur-md hover:bg-white/70 transition-colors">
                <p className="text-primary-light dark:text-primary font-medium">&quot;Building leaders since 2015&quot;</p>
              </div>
            </div>
          </motion.div>
          
          <div className="flex flex-col gap-6">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold"
            >
              More Than Just A <span className="text-info-light">Club</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-primary-light/70 dark:text-primary/70 leading-relaxed"
            >
              We believe in fostering an environment where ideas flourish and potential is realized. Our platform serves as a bridge between academic learning and real-world application, offering members unique opportunities to lead, innovate, and grow.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-primary-light/70 dark:text-primary/70 leading-relaxed"
            >
              Through hands-on projects, mentorship programs, and extensive networking events, we empower individuals to shape their futures and make lasting impacts in their respective fields.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-4"
            >
              <Link href="/about/history" className="btn-secondary w-fit group">
                Read Our History
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Split Section: Blog & Upcoming Events */}
      <section className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Blog Strip (Left 8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="flex items-end justify-between">
              <h2 className="text-3xl md:text-4xl font-bold">Latest Stories</h2>
              <Link href="/content/blog" className="text-info-light font-medium hover:underline flex items-center gap-1 group">
                View All <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6" style={{ perspective: 1000 }}>
              {blogs.map((item, idx) => (
                <motion.div 
                  key={item.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card group flex flex-col h-full overflow-hidden hover:border-info-light/50 transition-colors"
                >
                  <Link href={`/content/blog/${item.slug || item.id}`} className="flex flex-col h-full">
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image 
                        src={item.coverImageUrl || item.imageUrl || `https://picsum.photos/seed/blog${idx}/600/400`}
                        alt={item.title || "Blog cover"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        unoptimized={true}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="text-xs font-bold text-info-light mb-2">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase() : "RECENT POST"}
                      </div>
                      <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-info-light transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-primary-light/70 dark:text-primary/70 text-sm line-clamp-3 mb-4 flex-grow">
                        {item.excerpt || (item.contentMarkdown ? item.contentMarkdown.replace(/<[^>]+>/g, '').substring(0, 150) : "Explore the latest article...")}
                      </p>

                      {/* Author Info */}
                      <div className="flex items-center gap-2.5 pt-3 border-t border-black/5 dark:border-white/10 mb-3">
                        {item.authorImageUrl ? (
                          <img 
                            src={item.authorImageUrl} 
                            alt={item.authorName || item.author || 'Author'} 
                            className="w-7 h-7 rounded-full object-cover border border-white/20"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {(item.authorName || item.author || "CE").slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {item.authorName || item.author || "CE Club HSTU"}
                          </p>
                          {item.authorRole && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.authorRole}</p>
                          )}
                        </div>
                      </div>

                      <span className="inline-flex items-center text-xs font-bold text-info-light group-hover:underline mt-auto">
                        Read Story <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
              {blogs.length === 0 && (
                <div className="col-span-full py-8 text-center text-primary-light/50 dark:text-primary/50">
                  No blogs available yet.
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events (Right 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="flex items-end justify-between">
              <h2 className="text-3xl md:text-4xl font-bold">Upcoming</h2>
              <Link href="/events/upcoming" className="text-info-light font-medium hover:underline flex items-center gap-1 group">
                More <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="glass rounded-[32px] p-2 flex flex-col gap-2">
              {upcomingEvents.length === 0 && (
                <div className="p-8 text-center text-primary-light/50 dark:text-primary/50">
                  No upcoming events scheduled.
                </div>
              )}
              {upcomingEvents.map((item, idx) => {
                const eventDate = item.eventDate ? new Date(item.eventDate) : new Date();
                const month = eventDate.toLocaleString('default', { month: 'short' });
                const day = eventDate.getDate().toString();
                // Simple start/end format for google calendar (very rudimentary)
                const startStr = item.eventDate ? item.eventDate.replace(/-/g, '') + 'T' + (item.time ? item.time.replace(':', '') + '00Z' : '090000Z') : '20261114T090000Z';
                const endStr = item.eventDate ? item.eventDate.replace(/-/g, '') + 'T' + '235900Z' : '20261114T170000Z';

                return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-4 p-4 rounded-[24px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors group relative"
                >
                  <div className="w-16 h-16 shrink-0 rounded-2xl glass flex flex-col items-center justify-center border-info-light/20 text-info-light">
                    <span className="text-xs font-bold uppercase">{month}</span>
                    <span className="text-xl font-numbers font-bold leading-none">{day}</span>
                  </div>
                  <div className="flex flex-col justify-center flex-grow">
                    <h4 className="font-bold text-base group-hover:text-info-light transition-colors line-clamp-1">{item.title}</h4>
                    <p className="text-sm text-primary-light/60 dark:text-primary/60 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {(item.location || "TBA")}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.title)}&dates=${startStr}/${endStr}&details=Join+us+for+${encodeURIComponent(item.title)}&location=${encodeURIComponent((item.location || "TBA"))}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    title="Add to Google Calendar"
                    className="shrink-0 flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full glass border-info-light/20 text-info-light hover:bg-info-light hover:text-white transition-all z-[20] cursor-pointer"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add to Calendar</span>
                  </button>
                </motion.div>
              ); })}
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors/Partners */}
      <section className="container mx-auto px-6 max-w-7xl text-center flex flex-col gap-10">
        <h3 className="text-sm font-bold text-secondary-light uppercase tracking-widest">Supported By Industry Leaders</h3>
        <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center justify-center font-bold text-2xl tracking-tighter hover:text-info-light transition-colors cursor-pointer">
              PARTNER <span className="font-numbers ml-1">0{i}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
