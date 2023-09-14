import './globals.css'
import { JetBrains_Mono } from 'next/font/google';

export const metadata = {
  title: 'BarPackApp',
  description: 'Generated by openAI',
}

const jetBrainsFont = JetBrains_Mono({ weight: ['400', '700'], subsets: ['latin'] });


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={jetBrainsFont.className}>
      <body>{children}</body>
    </html>
  )
}
