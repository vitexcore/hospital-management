import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-blue-950 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <span className="text-white font-bold text-lg leading-none">Medicare</span>
                <span className="block text-teal-400 text-xs font-medium leading-none">Hospital</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Providing world-class healthcare with compassion and excellence since 1985. Your health is our highest priority.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-blue-900 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[['/', 'Home'], ['/about', 'About Us'], ['/services', 'Services'], ['/doctors', 'Doctors'], ['/departments', 'Departments'], ['/contact', 'Contact']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-white transition-colors hover:pl-1 duration-200">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {['Emergency Care', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Laboratory', 'Radiology', 'Surgery'].map(s => (
                <li key={s}>
                  <Link to="/services" className="text-sm text-gray-400 hover:text-white transition-colors hover:pl-1 duration-200">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm">
                <MapPin size={16} className="text-teal-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">123 Medical Center Drive, New York, NY 10001</span>
              </li>
              <li className="flex gap-3 text-sm">
                <Phone size={16} className="text-teal-400 flex-shrink-0" />
                <div>
                  <a href="tel:+15551234567" className="text-gray-400 hover:text-white transition-colors block">+1 (555) 123-4567</a>
                  <a href="tel:+15559110000" className="text-red-400 hover:text-red-300 transition-colors block font-medium">Emergency: +1 (555) 911-0000</a>
                </div>
              </li>
              <li className="flex gap-3 text-sm">
                <Mail size={16} className="text-teal-400 flex-shrink-0" />
                <a href="mailto:info@medicarehospital.com" className="text-gray-400 hover:text-white transition-colors">info@medicarehospital.com</a>
              </li>
              <li className="flex gap-3 text-sm">
                <Clock size={16} className="text-teal-400 flex-shrink-0 mt-0.5" />
                <div className="text-gray-400">
                  <p>Mon–Fri: 8:00am – 8:00pm</p>
                  <p>Sat: 9:00am – 5:00pm</p>
                  <p className="text-teal-400">Emergency: 24/7</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Medicare Hospital. All rights reserved.</p>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service', 'HIPAA Notice'].map(item => (
              <a key={item} href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
