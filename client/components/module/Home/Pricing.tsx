'use client'
import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { CheckIcon, StarIcon } from 'lucide-react'

const plans = [
  {
    name: 'Basic',
    price: 'Free',
    period: '/year',
    description: 'Perfect for getting started as a tour host',
    features: [
      'Create up to 4 tours per year',
      'Basic tour listing',
      'Standard support',
      'Payment processing',
      'Tour calendar management',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Standard',
    price: '$99',
    period: '/year',
    description: 'Great for active tour hosts',
    features: [
      'Create up to 8 tours per year',
      'Featured tour listings',
      'Priority support',
      'Advanced analytics',
      'Payment processing',
      'Tour calendar management',
      'Custom branding options',
      'Photo gallery (up to 20 images)',
    ],
    cta: 'Start Now',
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '$199',
    period: '/year',
    description: 'For professional tour hosts',
    features: [
      'Create up to 12 tours per year',
      'Premium featured listings',
      'Dedicated support manager',
      'Advanced analytics & insights',
      'Payment processing',
      'Tour calendar management',
      'Full custom branding',
      'Unlimited photo gallery',
      'Video tour previews',
      'Multi-language support',
      'API access',
    ],
    cta: 'Go Premium',
    highlighted: false,
  },
]

export function Pricing() {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,
    margin: '-100px',
  })

  return (
    <section ref={ref} className="py-24 bg-blue-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-white text-blue-600 text-sm font-medium mb-4 shadow-sm">
            Host Pricing Plans
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start hosting tours with flexible annual plans designed for your needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-2xl scale-105 border-4 border-blue-400'
                  : 'bg-white shadow-lg border border-blue-100'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-4 py-1 rounded-full bg-blue-500 text-white text-sm font-medium shadow-lg">
                  <StarIcon className="w-4 h-4" />
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    plan.highlighted ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-bold ${
                      plan.highlighted ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={
                      plan.highlighted ? 'text-white/80' : 'text-gray-600'
                    }
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className={`mt-2 text-sm ${
                    plan.highlighted ? 'text-white/90' : 'text-gray-600'
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckIcon
                      className={`w-5 h-5 shrink-0 ${
                        plan.highlighted ? 'text-blue-200' : 'text-blue-600'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        plan.highlighted ? 'text-white/95' : 'text-gray-700'
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 rounded-full font-semibold transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-8 text-gray-600"
        >
          All plans are billed annually. Upgrade or downgrade anytime.
        </motion.p>
      </div>
    </section>
  )
}