'use client'

import { useEffect, useState } from 'react'
import JSZip from 'jszip'

interface Submission {
  id: number
  name: string
  email: string
  phone: string
  documents: string[]
  images: string[]
  createdAt: string
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState<number | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleDownload = async (submission: Submission) => {
    setDownloading(submission.id)
    setSuccess(null)
    
    try {
      const zip = new JSZip()
      const folder = zip.folder(submission.name.replace(/[^a-z0-9]/gi, '_') || 'submission')

      const addFileToZip = async (filename: string, path: string) => {
        const response = await fetch(`/uploads/${filename}`)
        if (!response.ok) throw new Error(`Failed to fetch ${filename}`)
        return await response.blob()
      }

      // Add documents to zip
      await Promise.all(
        submission.documents.map(async doc => {
          const blob = await addFileToZip(doc, `documents/${doc}`)
          folder?.file(`documents/${doc}`, blob)
        })
      )

      // Add images to zip
      await Promise.all(
        submission.images.map(async img => {
          const blob = await addFileToZip(img, `images/${img}`)
          folder?.file(`images/${img}`, blob)
        })
      )

      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `${submission.name}_submission.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setSuccess(`Downloaded ${submission.name}'s files successfully!`)
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (err) {
      console.error('Download failed:', err)
      setError(`Download failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setTimeout(() => setError(''), 3000)
    } finally {
      setDownloading(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/submissions')
        if (!res.ok) throw new Error('Failed to fetch submissions')
        const data = await res.json()
        if (!Array.isArray(data)) throw new Error('Invalid data format')
        setSubmissions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setTimeout(() => setError(''), 3000)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Form Submissions Dashboard
          </h1>
          <div className="mt-4 md:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {submissions.length} submissions
            </span>
          </div>
        </div>

        {/* Status Messages */}
        <div className="mb-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded animate-fadeIn">
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded animate-fadeIn">
              <p>{success}</p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && submissions.length === 0 && (
          <div className="text-center py-12 animate-fadeIn">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No submissions yet</h3>
            <p className="mt-1 text-sm text-gray-500">Submitted forms will appear here</p>
          </div>
        )}

        {/* Submissions Table */}
        {!loading && submissions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fadeIn">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{sub.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {sub.documents.map((doc, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {doc}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {sub.images.map((img, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {img}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sub.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDownload(sub)}
                          disabled={downloading === sub.id}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white ${
                            downloading === sub.id 
                              ? 'bg-gray-400' 
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200`}
                        >
                          {downloading === sub.id ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Preparing
                            </>
                          ) : (
                            <>
                              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                              </svg>
                              Download
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
