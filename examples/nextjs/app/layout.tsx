import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FusionAuth MCP Next.js Example',
  description: 'Example Next.js app using FusionAuth MCP tools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}