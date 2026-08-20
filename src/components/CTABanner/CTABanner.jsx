import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import './CTABanner.css'

export default function CTABanner() {
  return (
    <section className="cta-banner" id="cta-banner">
      <div className="cta-banner__inner container">
        <motion.div
          className="cta-banner__card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="cta-banner__content">
            <h2 className="cta-banner__title">
              Ready to build your perfect CV?
            </h2>
            <p className="cta-banner__desc">
              No account required. Submit your details and let AI + professional templates do the rest.
            </p>
          </div>
          <div className="cta-banner__actions">
            <Link to="/submit" className="cta-banner__btn" id="cta-build-cv">
              Build your CV
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Decorative elements */}
          <div className="cta-banner__glow cta-banner__glow--1" aria-hidden="true"></div>
          <div className="cta-banner__glow cta-banner__glow--2" aria-hidden="true"></div>
        </motion.div>
      </div>
    </section>
  )
}
