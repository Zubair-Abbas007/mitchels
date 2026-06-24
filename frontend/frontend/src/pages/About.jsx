import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiPackage, FiUsers, FiGlobe, FiArrowLeft, FiMail, FiPhone, FiInstagram, FiFacebook } from 'react-icons/fi';
import Footer from '../components/Footer';
import emailjs from '@emailjs/browser';

const ContactModal = ({ onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await emailjs.send('service_mv6rkb5', 'template_wll9zyj', {
        to_name: 'Mitchells Admin',
        to_email: 'za314944@gmail.com',
        otp: `New Contact Message\n\nFrom: ${form.name}${form.company ? ` (${form.company})` : ''}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
      }, 'l5RxBKO4o7WNr5SFD');
      setSent(true);
    } catch { setSent(true); }
    finally { setSending(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      style={{ background: 'rgba(20,20,20,0.55)', backdropFilter: 'blur(14px)' }}
      onClick={onClose}>
      <AnimatePresence>
        {sent && (
          <motion.div initial={{ opacity: 0, rotate: -6, scale: 0.7, y: 60 }}
            animate={{ opacity: 1, rotate: -6, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="absolute bottom-12 right-6 sm:bottom-16 sm:right-14 z-30 cursor-pointer select-none"
            onClick={onClose}>
            <div className="relative px-8 py-6 shadow-2xl"
              style={{ background: '#d4f542', transform: 'rotate(-6deg)', minWidth: '210px', borderRadius: '4px' }}>
              <button className="absolute top-2 right-3 text-black/40 hover:text-black text-lg font-black leading-none">×</button>
              <p className="text-2xl font-black text-black leading-tight mb-1">Thank you!</p>
              <p className="text-sm text-black/70 font-medium">Your request was sent</p>
              <div className="absolute -bottom-3 right-5 text-2xl">🖤</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ scale: 0.94, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 24 }}
        className="relative w-full overflow-y-auto"
        style={{ maxWidth: '640px', maxHeight: '96vh', minHeight: '80vh', borderRadius: '20px', background: 'rgba(255,255,255,0.96)', boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-5 right-6 z-20 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-black transition-all text-xl font-light">×</button>

        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh]">
          <div className="p-8 sm:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100">
            <div>
              <h1 className="text-5xl sm:text-6xl font-black text-black mb-5 leading-none tracking-tight">Contact</h1>
              <p className="text-xs uppercase tracking-widest text-gray-500 leading-relaxed max-w-xs mb-8">
                Our team is here to help. Fill out the form and we will get back to you promptly.
              </p>
              <div className="space-y-4 mb-8">
                <a href="https://mail.google.com/mail/?view=cm&to=za314944@gmail.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-black flex items-center justify-center transition-all">
                    <FiMail size={15} className="text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm text-black font-medium group-hover:underline">za314944@gmail.com</span>
                </a>
                <a href="tel:+923262448200" className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-black flex items-center justify-center transition-all">
                    <FiPhone size={15} className="text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm text-black font-medium group-hover:underline">+92 326 2448200</span>
                </a>
              </div>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/mitchellspakistan" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all shadow-md"
                  style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
                  <FiInstagram size={17} />
                </a>
                <a href="https://www.facebook.com/MitchellsPakistan" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all shadow-md"
                  style={{ background: '#1877F2' }}>
                  <FiFacebook size={17} />
                </a>
                <a href="https://mail.google.com/mail/?view=cm&to=za314944@gmail.com" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all shadow-md bg-gray-800">
                  <FiMail size={17} />
                </a>
              </div>
            </div>
            <div className="mt-10 text-3xl select-none">🖤</div>
          </div>

          <div className="p-8 sm:p-12 flex flex-col justify-center">
            <h2 className="text-xl font-black text-black mb-6 tracking-tight">Send a message</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border-b-2 border-gray-200 focus:border-black pb-2 text-sm text-black outline-none transition-colors bg-transparent font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Company</label>
                  <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full border-b-2 border-gray-200 focus:border-black pb-2 text-sm text-black outline-none transition-colors bg-transparent font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Email</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border-b-2 border-gray-200 focus:border-black pb-2 text-sm text-black outline-none transition-colors bg-transparent font-medium" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Message</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Type something if you want..."
                  className="w-full border-b-2 border-gray-200 focus:border-black pb-2 text-sm text-black outline-none transition-colors bg-transparent resize-none font-medium placeholder-gray-300" />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={sending || sent}
                  className="px-10 py-3.5 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                  {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : sent ? '✓ Sent!' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const About = () => {
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);

  const stats = [
    { icon: <FiAward size={22} />, value: '90+', label: 'Years of Excellence' },
    { icon: <FiPackage size={22} />, value: '100+', label: 'Premium Products' },
    { icon: <FiUsers size={22} />, value: '1M+', label: 'Happy Customers' },
    { icon: <FiGlobe size={22} />, value: '20+', label: 'Countries Served' },
  ];

  const values = [
    { title: 'Quality First', desc: 'Every product is crafted from the finest farm-fresh ingredients, meeting the highest standards of taste and purity.' },
    { title: 'Heritage & Tradition', desc: 'Since 1933, we have preserved the authentic recipes and methods passed down through generations of the Mitchell family.' },
    { title: 'Sustainability', desc: 'We work directly with local farmers and orchards, supporting sustainable agriculture and reducing our environmental footprint.' },
    { title: 'Innovation', desc: 'While rooted in tradition, we continuously innovate to bring modern flavors and packaging to our loyal customers.' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-cream)]">
      <AnimatePresence>
        {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      </AnimatePresence>

      {/* Back button — same style as Login page */}
      <button onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 text-gray-400 hover:text-[var(--primary)] transition-colors text-xs font-black uppercase tracking-widest group">
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      {/* Hero */}
      <section className="relative">
      {/* Back button — inside hero, not fixed, so it doesn't clash with navbar */}
      <div className="relative bg-[#0d1117] text-white pt-24 sm:pt-32 pb-16 sm:pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #1a2a8f 0%, transparent 50%), radial-gradient(circle at 80% 20%, #cc1111 0%, transparent 40%)' }} />

        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-red-400 mb-4">Our Story</p>
            <h1 className="serif text-4xl sm:text-6xl md:text-7xl text-white leading-tight mb-4 sm:mb-6">
              Farm Fresh<br />
              <span className="text-[#cc1111]">Since 1933</span>
            </h1>
            <p className="text-white/60 text-sm sm:text-lg leading-relaxed max-w-2xl">
              Mitchell's Fruit Farms is Pakistan's most trusted name in premium food products — from handcrafted jams and chutneys to gourmet sauces and pickles, made with love and tradition.
            </p>
          </motion.div>
        </div>
      </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#1a2a8f]/8 text-[#1a2a8f] flex items-center justify-center mx-auto mb-3">
                  {s.icon}
                </div>
                <p className="text-3xl font-black text-[#0d1117] mb-1">{s.value}</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-[10px] uppercase font-black tracking-[0.3em] text-[#cc1111] mb-3">Who We Are</p>
              <h2 className="serif text-3xl sm:text-4xl text-[#0d1117] mb-5 leading-tight">A Legacy Built on Quality</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Founded in 1933 by the Mitchell family in the fertile orchards of Punjab, Mitchell's Fruit Farms began as a small family operation dedicated to preserving the natural goodness of fresh fruit.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Over nine decades, we have grown into Pakistan's leading producer of premium jams, jellies, sauces, chutneys, and pickles — exported to over 20 countries while staying true to our founding values of quality, purity, and taste.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="relative flex items-center justify-center">
              {/* Circle image */}
              <div className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl border-8 border-white bg-white flex items-center justify-center">
                <img
                  src="/mitchells-love.svg"
                  alt="Mitchell's — A Whole Lot of Love"
                  className="w-full h-full object-contain p-4"
                  onError={(e) => { e.target.onerror = null; }}
                />
              </div>
              {/* 1933 badge */}
              <div className="absolute -bottom-4 -left-4 bg-[#cc1111] text-white px-6 py-4 rounded-2xl shadow-xl">
                <p className="text-2xl font-black leading-none">1933</p>
                <p className="text-[10px] uppercase tracking-widest opacity-80">Est.</p>
              </div>
            </motion.div>
          </div>

          {/* Values */}
          <div>
            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-[#cc1111] mb-3 text-center">What Drives Us</p>
            <h2 className="serif text-3xl sm:text-4xl text-[#0d1117] mb-8 sm:mb-12 text-center">Our Core Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((v, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                  <div className="w-2 h-8 bg-[#1a2a8f] rounded-full mb-4" />
                  <h3 className="font-black text-[#0d1117] text-base mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-[#0d1117] rounded-[24px] sm:rounded-[32px] p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #1a2a8f, transparent 60%)' }} />
            <div className="relative z-10">
              <h2 className="serif text-3xl sm:text-4xl text-white mb-4">Taste the Tradition</h2>
              <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">Explore our full range of premium products and experience 90 years of gourmet craftsmanship.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button onClick={() => navigate('/products')}
                  className="px-10 py-4 bg-[#cc1111] text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl">
                  Explore Our Menu
                </button>
                <button onClick={() => setShowContact(true)}
                  className="px-10 py-4 bg-white/10 text-white border border-white/20 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
