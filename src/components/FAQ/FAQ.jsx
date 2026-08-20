import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import './FAQ.css'

const faqs = [
  {
    question: 'Do I need to create an account?',
    answer: 'No. You can submit your CV request, chat with the team, and receive your completed document. All without creating an account. Simply provide your email so we can reach you.',
  },
  {
    question: 'What file formats can I download?',
    answer: 'Your completed CV can be downloaded as PDF, Microsoft Word (.docx), or LaTeX (.tex). All formats maintain the same professional layout and content.',
  },
  {
    question: 'How does the AI generate my CV?',
    answer: 'Your submitted details (experience, skills, education, target role) are processed by OpenAI using a fixed professional prompt. The AI generates structured content and not the layout. A fixed template then formats it consistently every time.',
  },
  {
    question: 'Can I communicate with the team?',
    answer: 'Yes! A conversation is automatically created with every submission. You can chat directly with the admin or assigned team member to provide additional context, ask questions, or request changes.',
  },
  {
    question: 'How long does it take?',
    answer: 'The AI generates structured content in seconds. However, every CV goes through human review and quality assurance before delivery. Typical turnaround is within 24–48 hours.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Your data is stored securely in our database and is only accessible by authorized admin and assigned staff. Your information is never shared with third parties or used beyond CV generation.',
  },
  {
    question: 'Can I request changes after receiving my CV?',
    answer: 'Absolutely. Use the built-in chat to request corrections or adjustments. The admin can regenerate content and re-export your document as many times as needed.',
  },
]

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className={`faq__item ${isOpen ? 'faq__item--open' : ''}`}>
      <button
        className="faq__question"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>{faq.question}</span>
        <ChevronDown size={18} className="faq__chevron" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="faq__answer-wrapper"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="faq__answer">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="faq" id="faq">
      <div className="faq__inner container">
        <motion.div
          className="faq__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="faq__label">FAQ</span>
          <h2 className="faq__title">Frequently asked questions</h2>
          <p className="faq__subtitle">
            Everything you need to know about the AI CV Generator.
          </p>
        </motion.div>

        <motion.div
          className="faq__list"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
