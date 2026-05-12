import { redirect } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Card, CardBody } from '@/components/ui/Card';
import { getSession } from '@/lib/auth/getSession';
import { routes } from '@/config/routes';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const session = await getSession();
  // Middleware also guards this, but defense in depth never hurts.
  if (!session) redirect(routes.login);

  const firstName =
    session.profile?.full_name?.split(' ')[0] ?? session.user.email?.split('@')[0] ?? 'there';

  return (
    <>
      <header className="border-b border-g200 bg-ink px-6 py-16 sm:px-8 lg:px-12">
        <Container className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-paper/10 font-serif text-3xl italic text-paper">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <Eyebrow className="mb-1 text-paper/40">Member dashboard</Eyebrow>
            <h1 className="font-serif text-display-xl text-paper">
              Hello, <em className="italic text-paper/40">{firstName}</em>
            </h1>
          </div>
        </Container>
      </header>

      <Container className="grid gap-4 py-12 md:grid-cols-3">
        <Card>
          <CardBody>
            <Eyebrow className="mb-2">Role</Eyebrow>
            <p className="font-serif text-xl">{session.profile?.role ?? 'member'}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Eyebrow className="mb-2">Email</Eyebrow>
            <p className="break-all text-sm">{session.user.email}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Eyebrow className="mb-2">Member since</Eyebrow>
            <p className="text-sm">
              {session.profile?.created_at
                ? new Date(session.profile.created_at).toLocaleDateString()
                : '—'}
            </p>
          </CardBody>
        </Card>
      </Container>
    </>
  );
}
