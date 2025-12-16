'use client'
import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { UsersIcon, TrendingUpIcon } from 'lucide-react'
import Image from 'next/image'

const destinations = [
  {
    name: 'Bali, Indonesia',
    image:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop',
    tours: 42,
    trending: true,
  },
  {
    name: 'Tokyo, Japan',
    image:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop',
    tours: 38,
    trending: true,
  },
  {
    name: 'Barcelona, Spain',
    image:
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop',
    tours: 35,
    trending: false,
  },
  {
    name: 'Santorini, Greece',
    image:
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&h=400&fit=crop',
    tours: 29,
    trending: true,
  },
  {
    name: 'Machu Picchu, Peru',
    image:
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600&h=400&fit=crop',
    tours: 24,
    trending: false,
  },
  {
    name: 'Cape Town, South Africa',
    image:
      'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&h=400&fit=crop',
    tours: 31,
    trending: false,
  },
]

export function Destinations() {
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
            Popular Destinations
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore Amazing Places
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover trending destinations with expert-hosted tours from around the world
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="aspect-[4/3] relative">
                <Image
                  width={600}
                  height={400}
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {destination.trending && (
                  <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-medium shadow-lg">
                    <TrendingUpIcon className="w-3 h-3" />
                    Trending
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {destination.name}
                  </h3>
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <UsersIcon className="w-4 h-4" />
                    <span>
                      {destination.tours} tours available
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl">
            Explore All Destinations
          </button>
        </motion.div>
      </div>
    </section>
  )
}