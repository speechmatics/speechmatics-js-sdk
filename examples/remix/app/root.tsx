import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';

import '@picocss/pico';
import './globals.css';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ScrollRestoration />
        <Scripts />
        <header className="container">
          <nav>
            <ul>
              <li>
                <h6>Speechmatics ❤️ Remix</h6>
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

export default function App() {
  return <Outlet />;
}
