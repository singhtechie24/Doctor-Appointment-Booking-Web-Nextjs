"use client"
import React, { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please complete all required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        toast.success('Thank you! Your inquiry has been received. Our clinic will respond shortly.');
      } else {
        toast.error(data.error || 'Unable to send message at the moment. Please try again or call our clinic directly.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Unable to connect right now. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='max-w-6xl mx-auto px-4 py-12'>
      {/* Header */}
      <div className='text-center mb-12'>
        <h1 className='text-4xl font-extrabold text-gray-900'>
          Contact <span className='text-primary'>Glowing Smiles Doctors</span>
        </h1>
        <p className='mt-3 text-lg text-gray-600 max-w-2xl mx-auto'>
          Have questions about appointments, consultations, or dental treatments? Our medical team is here to assist you.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
        {/* Contact Info Card */}
        <div className='bg-blue-50/70 border border-blue-100 rounded-2xl p-8 flex flex-col justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>Get in Touch Directly</h2>

            <div className='space-y-6'>
              <div className='flex items-start gap-4'>
                <div className='p-3 bg-white text-primary rounded-xl shadow-sm'>
                  <Phone className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>Phone</h3>
                  <p className='text-gray-600'>+1 (555) 234-5678</p>
                  <p className='text-xs text-gray-500 mt-1'>Mon - Fri: 8:00 AM - 6:00 PM</p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='p-3 bg-white text-primary rounded-xl shadow-sm'>
                  <Mail className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>Email</h3>
                  <p className='text-gray-600'>support@glowingsmiles.com</p>
                  <p className='text-xs text-gray-500 mt-1'>We respond within 24 hours</p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='p-3 bg-white text-primary rounded-xl shadow-sm'>
                  <MapPin className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>Clinic Location</h3>
                  <p className='text-gray-600'>108 West 42nd St, Suite 500<br />Manhattan, NY 10036</p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='p-3 bg-white text-primary rounded-xl shadow-sm'>
                  <Clock className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>Working Hours</h3>
                  <p className='text-gray-600'>Monday - Saturday: 8:00 AM - 6:30 PM</p>
                  <p className='text-gray-600'>Sunday: Emergency appointments only</p>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-8 pt-6 border-t border-blue-200/60'>
            <p className='text-sm text-gray-500'>
              🏥 Emergency patient care line available 24/7 for registered patients.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className='bg-white border rounded-2xl p-8 shadow-sm'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Send us a Message</h2>
          <p className='text-sm text-gray-500 mb-6'>
            Fill out the form below and a patient care specialist will contact you.
          </p>

          {submitted ? (
            <div className='py-12 flex flex-col items-center text-center'>
              <CheckCircle2 className='w-16 h-16 text-green-500 mb-4' />
              <h3 className='text-2xl font-bold text-gray-900'>Message Received!</h3>
              <p className='text-gray-600 mt-2 max-w-sm'>
                Thank you, <span className='font-semibold'>{formData.name}</span>. We will get back to you at {formData.email}.
              </p>
              <Button className='mt-6' onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', message: '' }); }}>
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name *</label>
                <Input 
                  placeholder='e.g. Jane Doe' 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Email Address *</label>
                  <Input 
                    type='email' 
                    placeholder='jane@example.com' 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Phone Number</label>
                  <Input 
                    type='tel' 
                    placeholder='+1 (555) 000-0000'
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Your Message *</label>
                <Textarea 
                  rows={4}
                  placeholder='Tell us how we can help you (appointment inquiry, dental treatment question, etc.)...'
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <Button type='submit' className='w-full mt-2'>
                <Send className='w-4 h-4 mr-2' />
                Submit Inquiry
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContactPage
