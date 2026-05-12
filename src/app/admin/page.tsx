import { redirect } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { getSession } from '@/lib/auth/getSession';
import { routes } from '@/config/routes';

export const metadata = { title: 'Admin' };

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect(routes.login);
  if (session.profile?.role !== 'admin') redirect(routes.dashboard);

  return (
    <Container className="py-16">
      <Eyebrow className="mb-3">Admin</Eyebrow>
      <h1 className="font-serif text-display-xl text-ink">
        Admin <em className="italic text-g400">console</em>
      </h1>
      <p className="mt-4 max-w-prose text-sm text-g600">
        Manage stylists, review reports and suggestions, change user roles. Sections render here
        as they ship.
      </p>
    </Container>
  );
}
