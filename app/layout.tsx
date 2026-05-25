import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Office Layout Planner',
  description: 'Design your perfect office setup with 2D drag-and-drop and 3D preview',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
