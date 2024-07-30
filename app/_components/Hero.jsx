import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'

function Hero() {
  return (
    <section>
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 lg:order-last lg:h-full">
          <Image
            alt=""
            src="/doc.jpg"
            width={800}
            height={800}
            className="absolute inset-0 h-full
            rounded-3xl
            w-full object-cover"
          />
        </div>
  
        <div className="lg:py-24">
          <h2 className="text-4xl font-bold sm:text-4xl">
            Welcome To  <span className='text-primary'>Glowing Smiles</span>  Doctors</h2>
  
          <p className="mt-4 text-gray-600">
          We're dedicated to providing high-quality, affordable dental
          care to Oakland and Macomb Counties.
          From root canals to Invisalign, we ensure your smile shines.
          Find us in your neighborhood for top-notch dental services.
          </p>
  
         <Button className="mt-10">Explore Now</Button>
        </div>
      </div>
    </div>
  </section>
  )
}

export default Hero