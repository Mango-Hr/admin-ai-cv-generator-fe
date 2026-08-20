import { motion } from 'framer-motion'
import {
  Sparkles,
  FileOutput,
  LayoutTemplate,
  MessageCircle,
  Shield,
  Zap,
} from 'lucide-react'
import './Features.css'

const features = [
  {
    icon: <Sparkles size={24} />,
    title: 'AI-Powered Content',
    description: 'OpenAI crafts professional, tailored CV content from your raw experience and job description.',
    color: 'orange',
  },
  {
    icon: <LayoutTemplate size={24} />,
    title: 'Fixed Templates',
    description: 'Consistent, pixel-perfect formatting every time. No unpredictable AI layout generation.',
    color: 'blue',
  },
  {
    icon: <FileOutput size={24} />,
    title: 'Multi-Format Export',
    description: 'Download your CV as PDF, Word, or LaTeX, ready for any application portal.',
    color: 'purple',
  },
  {
    icon: <MessageCircle size={24} />,
    title: 'Built-in Chat',
    description: 'Communicate directly with the team processing your CV. Ask questions, provide context.',
    color: 'teal',
  },
  {
    icon: <Shield size={24} />,
    title: 'No Account Needed',
    description: 'Submit your CV request without creating an account. Your data stays secure throughout.',
    color: 'pink',
  },
  {
    icon: <Zap size={24} />,
    title: 'Fast Turnaround',
    description: 'AI generates structured content in seconds. Admin review ensures quality before delivery.',
    color: 'orange',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="features__inner container">
        <motion.div
          className="features__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="features__label">Features</span>
          <h2 className="features__title">Everything you need for the perfect CV</h2>
          <p className="features__subtitle">
            AI intelligence meets professional templates. Your experience, perfectly formatted.
          </p>
        </motion.div>

        <motion.div
          className="features__grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`features__card features__card--${feature.color}`}
              variants={cardVariants}
            >
              <div className="features__card-icon">
                {feature.icon}
              </div>
              <h3 className="features__card-title">{feature.title}</h3>
              <p className="features__card-desc">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
