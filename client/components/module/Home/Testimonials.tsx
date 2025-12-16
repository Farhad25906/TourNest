'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { StarIcon, QuoteIcon } from 'lucide-react'
import Image from 'next/image'

const testimonials = [
  {
    name: 'Sarah Thompson',
    location: 'New York, USA',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    trip: 'Bali Cultural Tour',
    quote:
      'The host was incredibly knowledgeable and made our Bali experience truly authentic. Every detail was perfectly planned, and we got to explore hidden gems we would never have found on our own.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    location: 'Singapore',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    trip: 'Japan Adventure',
    quote:
      'TourNest connected us with an amazing host who brought Japan to life. From traditional tea ceremonies to modern Tokyo, every moment was memorable. Best tour experience ever!',
    rating: 5,
  },
  {
    name: 'Emma Rodriguez',
    location: 'Barcelona, Spain',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    trip: 'Peru Expedition',
    quote:
      'As a solo traveler, I felt completely safe and welcomed. The host took care of everything and the small group size made it feel personal. Already planning my next TourNest adventure!',
    rating: 5,
  },
]

export function Testimonials() {
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
            Traveler Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our Travelers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real experiences from travelers who explored the world with our expert hosts
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="bg-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 relative border border-blue-100"
            >
              <QuoteIcon className="absolute top-6 right-6 w-8 h-8 text-blue-200" />

              <div className="flex items-center gap-4 mb-6">
                <Image
                  width={56}
                  height={56}
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover ring-4 ring-blue-200"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {testimonial.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className="w-4 h-4 fill-blue-600 text-blue-600"
                  />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed mb-4">
                {testimonial.quote}
              </p>

              <div className="pt-4 border-t border-blue-200">
                <span className="text-sm font-medium text-blue-600">
                  {testimonial.trip}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}