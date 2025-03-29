import { useState, useEffect } from 'react'
import Image from 'next/image'
import Head from 'next/head'
import { Geist } from 'next/font/google'
import PocketBase from 'pocketbase'

// Get the PocketBase URL from environment variable with fallback
const pocketbaseUrl =
  process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090'
const pb = new PocketBase(pocketbaseUrl)

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export default function Home() {
  const [formData, setFormData] = useState({
    full_name: '',
    adypu_email: '',
    game_title: '',
    screenshot: null,
    hosted_link: '',
    github_link: '',
  })

  const [screenshotPreview, setScreenshotPreview] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch records on component mount
  useEffect(() => {
    getRecords()
  }, [])

  // Get all records from PocketBase
  const getRecords = async () => {
    try {
      setLoading(true)
      const records = await pb.collection('wap_games').getList(1, 500, {
        sort: '-created',
      })
      setSubmissions(records.items)
    } catch (err) {
      console.error('Error fetching records:', err)
      setError('Failed to load submissions. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      // Create form data for file upload
      const formDataToSubmit = new FormData()

      // Add text fields
      formDataToSubmit.append('full_name', formData.full_name)
      formDataToSubmit.append('adypu_email', formData.adypu_email)
      formDataToSubmit.append('game_title', formData.game_title)
      formDataToSubmit.append('hosted_link', formData.hosted_link)
      formDataToSubmit.append('github_link', formData.github_link)

      // Add screenshot file
      if (formData.screenshot) {
        formDataToSubmit.append('screenshot', formData.screenshot)
      }

      // Submit to PocketBase
      await pb.collection('wap_games').create(formDataToSubmit)

      // Reset form
      setFormData({
        full_name: '',
        adypu_email: '',
        game_title: '',
        screenshot: null,
        hosted_link: '',
        github_link: '',
      })
      setScreenshotPreview(null)

      // Refresh records
      getRecords()
    } catch (err) {
      console.error('Error submitting form:', err)
      setError(err.message || 'Failed to submit game. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        screenshot: file,
      }))

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setScreenshotPreview(previewUrl)
    }
  }

  return (
    <>
      <Head>
        <title>NST WAP Game Submission Portal</title>
        <meta
          name="description"
          content="Submit and explore games created by ADYPU students"
        />
      </Head>
      <div
        className={`min-h-screen p-4 sm:p-8 bg-base-200 ${geist.variable} font-sans`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              NST WAP Game Submissions
            </h1>
            <p className="text-base-content/70">
              Submit your game project details below
            </p>
          </div>

          {error && (
            <div className="alert alert-error mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">Full Name</span>
                    <span className="label-text-alt text-error">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="input input-bordered focus:input-primary w-full"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">ADYPU Email</span>
                    <span className="label-text-alt text-error">*</span>
                  </label>
                  <input
                    type="email"
                    name="adypu_email"
                    value={formData.adypu_email}
                    onChange={handleChange}
                    className="input input-bordered focus:input-primary w-full"
                    placeholder="your.email@adypu.edu.in"
                    pattern=".*@adypu\.edu\.in$"
                    title="Please enter a valid ADYPU email address (ending with @adypu.edu.in)"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">Game Title</span>
                    <span className="label-text-alt text-error">*</span>
                  </label>
                  <input
                    type="text"
                    name="game_title"
                    value={formData.game_title}
                    onChange={handleChange}
                    className="input input-bordered focus:input-primary w-full"
                    placeholder="Enter your game title"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">
                      Game Screenshot
                    </span>
                    <span className="label-text-alt text-error">*</span>
                  </label>
                  <input
                    type="file"
                    name="screenshot"
                    onChange={handleFileChange}
                    className="file-input file-input-bordered w-full"
                    accept="image/*"
                    required={!formData.screenshot}
                  />
                  {screenshotPreview && (
                    <div className="mt-2">
                      <Image
                        src={screenshotPreview}
                        alt="Game Screenshot Preview"
                        className="rounded-lg object-cover max-h-40"
                        width={400}
                        height={200}
                      />
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">
                      Game Hosted Link
                    </span>
                    <span className="label-text-alt text-error">*</span>
                  </label>
                  <input
                    type="url"
                    name="hosted_link"
                    value={formData.hosted_link}
                    onChange={handleChange}
                    className="input input-bordered focus:input-primary w-full"
                    placeholder="https://your-game-url.com"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text font-medium">
                      Game Github URL
                    </span>
                    <span className="label-text-alt text-error">*</span>
                  </label>
                  <input
                    type="url"
                    name="github_link"
                    value={formData.github_link}
                    onChange={handleChange}
                    className="input input-bordered focus:input-primary w-full"
                    placeholder="https://github.com/username/repo"
                    pattern="https://github\.com/.*"
                    title="Please enter a valid GitHub URL (starting with https://github.com/)"
                    required
                  />
                </div>
              </div>

              <div className="form-control mt-8">
                <button
                  type="submit"
                  className={`btn btn-primary btn-lg ${
                    loading ? 'loading' : ''
                  }`}
                  disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Game'}
                </button>
              </div>
            </div>
          </form>

          {submissions.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">
                Submitted Games ({submissions.length})
              </h2>
              <div className="overflow-x-auto bg-base-100 rounded-box shadow-xl">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Game Title</th>
                      <th>Screenshot</th>
                      <th>Links</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td>{submission.full_name}</td>
                        <td>{submission.adypu_email}</td>
                        <td>{submission.game_title}</td>
                        <td>
                          {submission.screenshot ? (
                            <a
                              href={pb.files.getURL(
                                submission,
                                submission.screenshot
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center"
                              title="View Screenshot">
                              <div className="w-12 h-12 overflow-hidden rounded-md">
                                <Image
                                  src={`${pb.files.getURL(
                                    submission,
                                    submission.screenshot
                                  )}`}
                                  alt={`${submission.game_title} Screenshot`}
                                  className="object-cover w-full h-full"
                                  width={400}
                                  height={200}
                                />
                              </div>
                            </a>
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-md">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="flex gap-2">
                          <a
                            href={submission.hosted_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                            title="View Live Demo">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                              />
                            </svg>
                          </a>
                          <a
                            href={submission.github_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                            title="View Source Code">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                              />
                            </svg>
                          </a>
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
      <footer className="footer footer-center p-4 bg-base-300 text-base-content">
        <p>
          &copy; {new Date().getFullYear()} Newton School of Technology. All
          rights reserved. Created by Krushn Dayshmookh with ❤️.
        </p>
      </footer>
    </>
  )
}
