// app/admin/layout.tsx
export const dynamic = 'force-dynamic'; // disable SSG/ISR for admin
export const revalidate = 0;            // no caching
export const runtime = 'nodejs';        // don't use Edge runtime here

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
