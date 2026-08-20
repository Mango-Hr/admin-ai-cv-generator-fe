import { motion } from 'framer-motion'
import { Upload, Sparkles, FileCheck, Download, ArrowRight } from 'lucide-react'
import './HowItWorks.css'

const steps = [
  {
    number: '01',
    icon: <Upload size={28} />,
    title: 'Submit Your Details',
    description: 'Fill out the form with your experience, education, skills, and target position. Upload your existing CV if you have one.',
  },
  {
    number: '02',
    icon: <Sparkles size={28} />,
    title: 'AI Generates Content',
    description: 'Our AI processes your information with the admin\'s master prompt to create structured, professional CV content.',
  },
  {
    number: '03',
    icon: <FileCheck size={28} />,
    title: 'Admin Review & Polish',
    description: 'A real person reviews, refines, and approves your CV. Chat directly for any questions or adjustments.',
  },
  {
    number: '04',
    icon: <Download size={28} />,
    title: 'Download & Apply',
    description: 'Download your polished CV in PDF, Word, or LaTeX format. Ready to land your next role.',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
}

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-it-works__inner container">
        <motion.div
          className="how-it-works__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="how-it-works__label">How it works</span>
          <h2 className="how-it-works__title">Four steps to your perfect CV</h2>
          <p className="how-it-works__subtitle">
            From raw details to a polished, professional document in minutes.
          </p>
        </motion.div>

        <motion.div
          className="how-it-works__steps"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {steps.map((step, index) => (
            <motion.div key={index} className="how-it-works__step" variants={stepVariants}>
              <div className="how-it-works__step-number">{step.number}</div>
              <div className="how-it-works__step-icon">{step.icon}</div>
              <h3 className="how-it-works__step-title">{step.title}</h3>
              <p className="how-it-works__step-desc">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="how-it-works__connector" aria-hidden="true">
                  <ArrowRight size={18} />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
