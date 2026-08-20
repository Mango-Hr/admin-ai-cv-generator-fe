import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Menu, X } from 'lucide-react'
import logoImg from '../../assets/textbg.png'
import './Header.css'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Features', href: 'features' },
    { label: 'Templates', href: 'templates' },
    { label: 'How it works', href: 'how-it-works' },
    { label: 'FAQ', href: 'faq' },
  ]

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId.replace('#', ''));
    if (element) {
      const headerOffset = 64; // approximate header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`} id="header">
      <div className="header__inner container">
        {/* Logo */}
        <Link to="/" className="header__logo" aria-label="AI CV Generator Home">
          <img src={logoImg} alt="Logo" className="header__logo-img" />
        </Link>

        {/* Desktop Nav */}
        <nav className="header__nav" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className="header__nav-link"
              onClick={(e) => handleNavClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="header__actions">
          <a href="#chat" className="header__chat-btn" onClick={(e) => handleNavClick(e, '#chat')}>
            <MessageCircle size={16} />
            <span>Chat</span>
          </a>
          <Link to="/submit" className="header__cta-btn">
            Build your Resume
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="header__mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`header__mobile-menu ${mobileMenuOpen ? 'header__mobile-menu--open' : ''}`}>
        <nav className="header__mobile-nav">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="header__mobile-link"
              onClick={(e) => {
                handleNavClick(e, link.href);
                setMobileMenuOpen(false);
              }}
            >
              {link.label}
            </a>
          ))}
          <div className="header__mobile-actions">
            <a href="#chat" className="header__mobile-chat" onClick={(e) => { handleNavClick(e, '#chat'); setMobileMenuOpen(false); }}>
              <MessageCircle size={18} />
              Chat
            </a>
            <Link to="/submit" className="header__mobile-cta" onClick={() => setMobileMenuOpen(false)}>
              Build your CV
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="header__overlay" onClick={() => setMobileMenuOpen(false)} />
      )}
    </header>
  )
}
