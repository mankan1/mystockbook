import '../../styles/globals.css'

export default function KeystaticLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Keystatic has its own full-page UI — no site nav/footer
  return (
    <html>
      <body style={{ margin: 0, padding: 0, background: '#fff' }}>
        {children}
      </body>
    </html>
  )
}
