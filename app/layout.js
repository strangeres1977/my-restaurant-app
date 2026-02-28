import './globals.css';
import Header from '../components/layout/Header';

export const metadata = {
  title: 'My Restaurant App',
  description: 'Multi-tenant restaurant platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Header />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
