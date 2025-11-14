import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Health Queue
          </h1>
          <p className="text-gray-600 mb-8">
            ระบบจัดการคิวโรงพยาบาลออนไลน์
          </p>

          <Link
            href="/login"
            className="inline-block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  )
}
