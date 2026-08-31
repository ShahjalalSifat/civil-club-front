'use client';

import { PageHeader } from '@/components/page-header';
import { motion } from 'motion/react';
import { Send, MapPin, Mail, Phone } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct Google Mail URL
    const bodyText = `Name: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
    const mailToLink = `https://mail.google.com/mail/?view=cm&fs=1&to=contact@civilengineeringclub.edu&su=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(bodyText)}`;
    
    // Open Gmail in a new tab
    window.open(mailToLink, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-6 max-w-7xl pb-24">
      <PageHeader title="Contact Us" description="We'd love to hear from you. Get in touch with our team." />
      
      <div className="grid lg:grid-cols-5 gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2 flex flex-col gap-8"
        >
          <div className="glass p-8 rounded-[32px] flex flex-col gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <p className="text-primary-light/70 dark:text-primary/70 mb-8">
                Fill out the form and our team will get back to you within 24 hours.
              </p>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-info-light/10 text-info-light flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-secondary-light uppercase tracking-wide">Phone</p>
                  <p className="font-semibold">+88 XXXX </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-info-light/10 text-info-light flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-secondary-light uppercase tracking-wide">Email</p>
                  <p className="font-semibold">contact@civilengineeringclub.edu</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-info-light/10 text-info-light flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-secondary-light uppercase tracking-wide">Location</p>
                  <p className="font-semibold">Dr. Muhammad Qudrat-I- Khuda Academic building,Level 2</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-3"
        >
          {submitted ? (
            <div className="glass h-full p-12 rounded-[36px] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-6">
                <Send className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Redirecting to Gmail...</h3>
              <p className="text-primary-light/70 dark:text-primary/70 max-w-md mx-auto mb-6">
                We&apos;re opening your Gmail to send the message. If a popup blocker prevented it from opening, you can click the button below.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button 
                  onClick={() => {
                    const bodyText = `Name: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
                    const mailToLink = `https://mail.google.com/mail/?view=cm&fs=1&to=contact@civilengineeringclub.edu&su=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(bodyText)}`;
                    window.open(mailToLink, '_blank');
                  }}
                  className="btn-primary"
                >
                  Open Gmail Manually
                </button>
                <button onClick={() => setSubmitted(false)} className="btn-secondary">
                  Send Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass p-8 md:p-12 rounded-[36px] flex flex-col gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold ml-2">First Name</label>
                  <input type="text" required className="input-glass" placeholder="John" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold ml-2">Last Name</label>
                  <input type="text" required className="input-glass" placeholder="Doe" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold ml-2">Email Address</label>
                <input type="email" required className="input-glass" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold ml-2">Subject</label>
                <input type="text" required className="input-glass" placeholder="How can we help?" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold ml-2">Message</label>
                <textarea 
                  required 
                  rows={5} 
                  className="glass rounded-[18px] p-6 outline-none transition-all duration-300 w-full resize-none focus:ring-2 focus:ring-info-light dark:focus:ring-info focus:shadow-lg focus:bg-white/80 dark:focus:bg-black/50" 
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                />
              </div>
              
              <button type="submit" className="btn-primary mt-4">
                <Send className="w-5 h-5 mr-2" /> Send Message
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
