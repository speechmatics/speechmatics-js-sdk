import type { Metadata } from 'next';
import './globals.css';
import '@picocss/pico';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="container">
          <nav>
            <ul>
              <li>
                <h6>Speechmatics ❤️ NextJS</h6>
              </li>
            </ul>
            <ul>
              <li>
                <a href="/flow">Flow</a>
              </li>
              <li>
                <a href="/batch">Batch</a>
              </li>
              <li>
                <a href="/real-time">Real-time</a>
              </li>
            </ul>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
