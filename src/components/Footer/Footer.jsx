import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import logoImg from '../../assets/textbg.png'
import '../Header/Header.css'
import './Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Product: [
      { label: 'Features', href: '#features' },
      { label: 'Templates', href: '#templates' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'FAQ', href: '#faq' },
    ],
    Company: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  }

  return (
    <footer className="footer" id="footer">
      <div className="footer__inner container">
        <div className="footer__top">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              {/* <div className="footer__logo-icon">
                <FileText size={16} strokeWidth={2} />
              </div>
              <span>AI CV Generator</span> */}
              <img src={logoImg} alt="Logo" className="header__logo-img" />
            </Link>
            <p className="footer__tagline">
              Your experience, perfectly formatted. AI-powered content with professional templates.
            </p>
          </div>

          {/* Link columns */}
          <div className="footer__links">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="footer__col">
                <h4 className="footer__col-title">{category}</h4>
                <ul className="footer__col-list">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="footer__link">{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {currentYear} AI CV Generator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
