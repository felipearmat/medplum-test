import { AppShell, ErrorBoundary, Loading, Logo, useMedplum, useMedplumProfile } from '@medplum/react';
import { IconUser, IconPencil } from '@tabler/icons-react';
import { JSX, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { PatientHistory } from './components/PatientHistory';
import { PatientOverview } from './components/PatientOverview';
import { Timeline } from './components/Timeline';
import { HomePage } from './pages/HomePage';
import { NewPatientPage } from './pages/NewPatientPage';
import { LandingPage } from './pages/LandingPage';
import { PatientPage } from './pages/PatientPage';
import { ResourcePage } from './pages/ResourcePage';
import { SignInPage } from './pages/SignInPage';

export function App(): JSX.Element | null {
  const medplum = useMedplum();
  const profile = useMedplumProfile();

  if (medplum.isLoading()) {
    return null;
  }

  const isPractitioner = profile?.resourceType === 'Practitioner'

  return (
    <AppShell
      logo={<Logo size={24} />}
      menus={[
        {
          title: 'My Links',
          links: [{ icon: <IconUser />, label: 'Patients', href: '/' }],
        },
        ...(isPractitioner
          ? [
              {
                title: 'New Patient',
                links: [{ icon: <IconPencil />, label: 'New Patient', href: '/new-patient' }],
              },
            ]
          : []),
      ]}
    >
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={profile ? <HomePage /> : <LandingPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/Patient/:id" element={<PatientPage />}>
              <Route index element={<PatientOverview />} />
              <Route path="overview" element={<PatientOverview />} />
              <Route path="timeline" element={<Timeline />} />
              <Route path="history" element={<PatientHistory />} />
            </Route>
            { isPractitioner
              ? <Route path={"/new-patient"} element={<NewPatientPage />} />
              : null
            }
            <Route path="/:resourceType/:id" element={<ResourcePage />} />
            <Route path="/:resourceType/:id/_history/:versionId" element={<ResourcePage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
}
