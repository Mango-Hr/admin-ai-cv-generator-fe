import { ArrowRight, FileText, Sparkles,  CheckCircle2, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import HeroIllustration from './HeroIllustration'
import './Hero.css'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero__inner container">
        {/* Headline */}
        <motion.div
          className="hero__content"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          <motion.h1 className="hero__title" variants={fadeUp} custom={0}>
            Your{' '}
            <span className="hero__title-icon hero__title-icon--blue">
              <FileText size={30} strokeWidth={1.8} />
            </span>{' '}
            experience,{' '}
            <span className="hero__title-icon hero__title-icon--orange">
              <Sparkles size={30} strokeWidth={1.8} />
            </span>{' '}
            skills,
            <br />
            &amp;{' '}
            <span className="hero__title-icon hero__title-icon--pink">
              <BookOpen  size={30} strokeWidth={1.8} />
            </span>{' '}
            story. Perfectly formatted.
          </motion.h1>

          <motion.p className="hero__subtitle" variants={fadeUp} custom={1}>
            Submit your details, let us craft the content, and a fixed professional template
            formats it exactly right every time. No account needed.
          </motion.p>

          {/* CTAs */}
          <motion.div className="hero__ctas" variants={fadeUp} custom={2}>
            <Link to="/submit" className="hero__cta-primary" id="hero-build-cv">
              Build your Resume
              <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="hero__cta-secondary" id="hero-see-how">
              See how it works
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div className="hero__badges" variants={fadeUp} custom={3}>
            <div className="hero__badge">
              {/* <CheckCircle2 size={16} className="hero__badge-icon" />
               */}
            </div>
            <div className="hero__badge">
              <CheckCircle2 size={16} className="hero__badge-icon" />
              No signup required
            </div>
            <div className="hero__badge">
              {/* <CheckCircle2 size={16} className="hero__badge-icon" />
              PDF, Word & LaTeX export */}
            </div>
          </motion.div>
          
          {/* Line Art Illustration underneath badges */}
          <motion.div 
            className="hero__illustration-container"
            variants={fadeUp} 
            custom={4}
            style={{ width: '100%', maxWidth: '800px', margin: '2rem auto 1rem' }}
          >
            <HeroIllustration />
          </motion.div>
        </motion.div>

        {/* Hero Visual — CV builder mockup */}
        <motion.div
          className="hero__visual"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="hero__mockup">
            {/* Browser chrome */}
            <div className="hero__mockup-chrome">
              <div className="hero__mockup-dots">
                <span className="hero__dot hero__dot--red"></span>
                <span className="hero__dot hero__dot--yellow"></span>
                <span className="hero__dot hero__dot--green"></span>
              </div>
              <div className="hero__mockup-url">
                <span>aicvgenerator.app/build</span>
              </div>
            </div>

            {/* Mockup content */}
            <div className="hero__mockup-body">
              {/* Left panel — form preview */}
              <div className="hero__mockup-panel hero__mockup-panel--left">
                <div className="hero__mock-field">
                  <div className="hero__mock-label"></div>
                  <div className="hero__mock-input"></div>
                </div>
                <div className="hero__mock-field">
                  <div className="hero__mock-label" style={{ width: '50%' }}></div>
                  <div className="hero__mock-input"></div>
                </div>
                <div className="hero__mock-field">
                  <div className="hero__mock-label" style={{ width: '65%' }}></div>
                  <div className="hero__mock-textarea"></div>
                </div>
                <div className="hero__mock-btn-row">
                  <div className="hero__mock-btn"></div>
                </div>

                {/* Floating sparkle decorations */}
                <div className="hero__sparkle hero__sparkle--1">
                  <Sparkles size={14} />
                </div>
                <div className="hero__sparkle hero__sparkle--2">
                  <Sparkles size={10} />
                </div>
              </div>

              {/* Center panel — CV preview */}
              <div className="hero__mockup-panel hero__mockup-panel--center">
                <div className="hero__mock-cv">
                  <div className="hero__mock-cv-header">
                    <div className="hero__mock-cv-name"></div>
                    <div className="hero__mock-cv-role"></div>
                  </div>
                  <div className="hero__mock-cv-section">
                    <div className="hero__mock-cv-line" style={{ width: '100%' }}></div>
                    <div className="hero__mock-cv-line" style={{ width: '85%' }}></div>
                    <div className="hero__mock-cv-line" style={{ width: '92%' }}></div>
                  </div>
                  <div className="hero__mock-cv-section">
                    <div className="hero__mock-cv-line" style={{ width: '100%' }}></div>
                    <div className="hero__mock-cv-line" style={{ width: '78%' }}></div>
                    <div className="hero__mock-cv-line" style={{ width: '65%' }}></div>
                    <div className="hero__mock-cv-line" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>

              {/* Right panel — output preview */}
              <div className="hero__mockup-panel hero__mockup-panel--right">
                <div className="hero__mock-output-circle"></div>
                <div className="hero__mock-output-lines">
                  <div className="hero__mock-cv-line" style={{ width: '80%' }}></div>
                  <div className="hero__mock-cv-line" style={{ width: '60%' }}></div>
                  <div className="hero__mock-cv-line" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="hero__bg-grid" aria-hidden="true"></div>
    </section>
  )
}
