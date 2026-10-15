import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            SKM Questionnaire
          </h1>
          <p className="text-xl text-gray-600">
            Survei Kepuasan Masyarakat - Citizen Satisfaction Survey
          </p>
        </div>

        <p className="text-lg text-gray-700 leading-relaxed">
          Help us improve our services by sharing your feedback. Your responses are valuable and
          will help us provide better service in the future.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
          <Link
            href="/form"
            className="px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Start Survey
          </Link>

          <Link
            href="/dashboard"
            className="px-8 py-4 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Admin Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold text-lg mb-2">Quick & Easy</h3>
            <p className="text-gray-600 text-sm">Complete the survey in just a few minutes</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold text-lg mb-2">Secure</h3>
            <p className="text-gray-600 text-sm">Your data is safe and confidential</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="text-3xl mb-2">💡</div>
            <h3 className="font-semibold text-lg mb-2">Impactful</h3>
            <p className="text-gray-600 text-sm">Your feedback drives real improvements</p>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-4 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} SKM Questionnaire. All rights reserved.</p>
      </footer>
    </main>
  )
}
