'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { SearchIcon, CalendarCheckIcon, MapPinIcon, PlaneIcon } from 'lucide-react'

const steps = [
  {
    icon: SearchIcon,
    title: 'Browse Tours',
    description:
      'Explore hundreds of curated tours created by experienced hosts from around the world.',
    color: '#2563eb',
  },
  {
    icon: CalendarCheckIcon,
    title: 'Book Your Adventure',
    description:
      'Select your preferred dates, review itinerary details, and securely book your spot on the tour.',
    color: '#3b82f6',
  },
  {
    icon: MapPinIcon,
    title: 'Meet Your Host',
    description:
      'Connect with your expert tour host who will guide you through an unforgettable journey.',
    color: '#60a5fa',
  },
  {
    icon: PlaneIcon,
    title: 'Travel & Explore',
    description:
      'Embark on your adventure with confidence, knowing every detail has been carefully planned.',
    color: '#93c5fd',
  },
]

export function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,
    margin: '-100px',
  })

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From browsing to booking in four simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-200 to-transparent" />
              )}

              <div className="bg-white rounded-2xl p-8 h-full shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-100">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${step.color}15` }}
                >
                  <step.icon
                    className="w-8 h-8"
                    style={{ color: step.color }}
                  />
                </div>

                <div className="text-sm font-medium text-gray-400 mb-2">
                  Step {index + 1}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}