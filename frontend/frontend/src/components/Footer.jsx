import { Link, useNavigate } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiMail, FiPhone, FiMapPin, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const BirdLogo = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="white" stroke="#1a2a8f" strokeWidth="3.5"/>
    <circle cx="50" cy="50" r="42" fill="white" stroke="#cc1111" strokeWidth="2"/>
    <path d="M48 58 Q42 52 40 44 Q44 40 50 42 Q56 44 56 52 Q54 58 48 58Z" fill="#1a2a8f"/>
    <path d="M48 58 Q45 54 44 48 Q46 46 49 48 Q51 52 50 58Z" fill="white" opacity="0.3"/>
    <path d="M44 46 Q32 30 22 24 Q28 32 34 40 Q38 44 42 46Z" fill="#1a2a8f"/>
    <path d="M44 46 Q34 32 26 27 Q30 34 36 41Z" fill="white" opacity="0.2"/>
    <path d="M54 44 Q66 28 76 22 Q70 30 64 38 Q60 42 56 44Z" fill="#1a2a8f"/>
    <path d="M54 44 Q64 30 72 25 Q68 32 62 39Z" fill="white" opacity="0.2"/>
    <ellipse cx="50" cy="40" rx="7" ry="6.5" fill="#1a2a8f"/>
    <path d="M43 40 L22 38 L43 42Z" fill="#1a2a8f"/>
    <circle cx="47" cy="39" r="2.5" fill="white"/>
    <circle cx="47" cy="39" r="1.2" fill="#1a2a8f"/>
    <circle cx="46.5" cy="38.5" r="0.4" fill="white"/>
    <path d="M44 60 Q40 68 36 74 Q42 68 46 62Z" fill="#1a2a8f"/>
    <path d="M46 62 Q44 72 42 78 Q46 70 48 64Z" fill="#1a2a8f"/>
    <path d="M48 63 Q48 74 48 80 Q50 72 50 65Z" fill="#1a2a8f"/>
    <path d="M50 63 Q52 74 54 80 Q52 72 51 65Z" fill="#1a2a8f"/>
    <path d="M52 62 Q56 72 58 78 Q55 70 53 64Z" fill="#1a2a8f"/>
    <path d="M54 60 Q60 68 64 74 Q58 68 55 62Z" fill="#1a2a8f"/>
    <path d="M44 60 L36 74" stroke="white" strokeWidth="0.6" opacity="0.4"/>
    <path d="M46 62 L42 78" stroke="white" strokeWidth="0.6" opacity="0.4"/>
    <path d="M48 63 L48 80" stroke="white" strokeWidth="0.6" opacity="0.4"/>
    <path d="M50 63 L54 80" stroke="white" strokeWidth="0.6" opacity="0.4"/>
    <path d="M52 62 L58 78" stroke="white" strokeWidth="0.6" opacity="0.4"/>
  </svg>
);

// Category name → URL-friendly key matching Products.jsx categoryMeta
const CATEGORY_MAP = {
  'Jams & Preserves': 'Jams',
  'Sauces':           'Sauces',
  'Chutneys':         'Chutneys',
  'Pickles':          'Pickles',
  'Sweets':           'Sweets',
  'Gourmet':          'Gourmet',
};

const Footer = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const goToCategory = (cat) => {
    // Navigate to products page and pass category as state
    navigate('/products', { state: { category: CATEGORY_MAP[cat] || cat } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToContact = () => {
    // Navigate to home page and trigger contact modal via hash
    navigate('/?contact=1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0d1117] text-white pt-16 pb-8">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-14">

          {/* Brand */}
          <div className="space-y-5">
            <Link to="/" className="flex items-center gap-3">
              <BirdLogo />
              <div>
                <p className="font-black text-white text-lg tracking-tight leading-none">MITCHELL'S</p>
                <p className="text-[8px] font-bold tracking-widest text-red-400 uppercase mt-0.5">Farm Fresh Since 1933</p>
              </div>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed">
              From orchard-fresh ingredients to your table — bringing you the finest gourmet experience since 1933.
            </p>
            <div className="flex gap-3 pt-1">
              <a href="https://www.facebook.com/MitchellsPakistan" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#1877F2] flex items-center justify-center transition-all">
                <FiFacebook size={16} />
              </a>
              <a href="https://www.instagram.com/mitchellspakistan" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-pink-600 flex items-center justify-center transition-all">
                <FiInstagram size={16} />
              </a>
              <a href="https://mail.google.com/mail/?view=cm&to=za314944@gmail.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#1a2a8f] flex items-center justify-center transition-all">
                <FiMail size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 pb-3 border-b border-white/10">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/products" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-white/65 hover:text-white text-sm transition-colors">Our Menu</Link>
              </li>
              <li>
                <Link to="/about" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-white/65 hover:text-white text-sm transition-colors">About Us</Link>
              </li>
              {isAuthenticated ? (
                <li>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors">
                    <FiLogOut size={14} /> Logout
                  </button>
                </li>
              ) : (
                <li>
                  <Link to="/login" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-white/65 hover:text-white text-sm transition-colors">Sign In</Link>
                </li>
              )}
            </ul>
          </div>

          {/* Products — each navigates to that category */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 pb-3 border-b border-white/10">Our Products</h4>
            <ul className="space-y-3">
              {Object.keys(CATEGORY_MAP).map(label => (
                <li key={label}>
                  <button onClick={() => goToCategory(label)}
                    className="text-white/65 hover:text-white text-sm transition-colors text-left">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 pb-3 border-b border-white/10">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FiMapPin size={15} className="text-white/50 mt-0.5 shrink-0" />
                <span className="text-white/70 text-sm leading-snug">17-Km Raiwind Road,<br />Lahore, Pakistan</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone size={15} className="text-white/50 shrink-0" />
                <a href="tel:+923262448200" className="text-white/70 hover:text-white text-sm transition-colors">+92 326 2448200</a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail size={15} className="text-white/50 shrink-0" />
                <a href="https://mail.google.com/mail/?view=cm&to=za314944@gmail.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white text-sm transition-colors">za314944@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-white/50 text-xs tracking-widest uppercase">
            © {new Date().getFullYear()} Mitchell's Fruit Farms. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
