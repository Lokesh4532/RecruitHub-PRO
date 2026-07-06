import './globals.css'

export const metadata = {
  title: 'RecruitPro - Campus Recruitment Platform',
  description: 'AI-Powered Campus Recruitment System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
