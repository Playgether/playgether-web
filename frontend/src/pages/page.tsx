import Image from 'next/image'
import { Inter } from 'next/font/google'
import '../app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function Page() {
  return (
    <div>
        <p className="text-purple-700 text-opacity-100 ...">The quick brown fox ...</p>
    </div>
  )
}
