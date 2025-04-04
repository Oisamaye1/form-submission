'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function FormPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [documentFiles, setDocumentFiles] = useState<File[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append('name', formData.name)
      formDataObj.append('email', formData.email)
      formDataObj.append('phone', formData.phone)
      
      documentFiles.forEach(file => formDataObj.append('documents', file))
      imageFiles.forEach(file => formDataObj.append('images', file))

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formDataObj
      })

      if (!response.ok) {
        throw new Error('Submission failed')
      }

      setSuccess(true)
      setFormData({ name: '', email: '', phone: '' })
      setDocumentFiles([])
      setImageFiles([])
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'documents' | 'images') => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      if (type === 'documents') {
        setDocumentFiles(files)
      } else {
        setImageFiles(files)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h1 className="text-2xl font-bold animate-slideIn">
              Personal Details Form
            </h1>
            <p className="mt-1 text-blue-100 animate-slideIn" style={{ animationDelay: '0.1s' }}>
              Please fill in your information
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {success && (
              <div className="success-message bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4 overflow-hidden">
                <p>Form submitted successfully!</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="animate-slideIn" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>

              <div className="animate-slideIn" style={{ animationDelay: '0.3s' }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>

              <div className="animate-slideIn" style={{ animationDelay: '0.4s' }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>

              <div className="animate-slideIn" style={{ animationDelay: '0.5s' }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documents
                </label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileChange(e, 'documents')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="documents"
                  />
                  <label 
                    htmlFor="documents"
                    className="block w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-all duration-200 cursor-pointer"
                  >
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <span className="mt-2 block text-sm font-medium text-gray-700">
                      {documentFiles.length > 0 
                        ? `${documentFiles.length} file(s) selected` 
                        : 'Click to upload documents'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="animate-slideIn" style={{ animationDelay: '0.6s' }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images
                </label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'images')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="images"
                  />
                  <label 
                    htmlFor="images"
                    className="block w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-purple-400 transition-all duration-200 cursor-pointer"
                  >
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span className="mt-2 block text-sm font-medium text-gray-700">
                      {imageFiles.length > 0 
                        ? `${imageFiles.length} image(s) selected` 
                        : 'Click to upload images'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-2 animate-slideIn" style={{ animationDelay: '0.7s' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                    isSubmitting 
                      ? 'bg-blue-400' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Submit Form'
                  )}
                </button>
              </div>

              <div className="text-center animate-slideIn" style={{ animationDelay: '0.8s' }}>
                <Link 
                  href="/admin" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  View Admin Dashboard →
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
