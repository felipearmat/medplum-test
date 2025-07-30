import { useMedplum } from '@medplum/react';
import { Patient } from '@medplum/fhirtypes';
import { JSX, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Loader, Stack } from '@mantine/core';
import { PatientDetailsTable } from './PatientDetailsTable';

export function PatientOverview(): JSX.Element {
  const { id } = useParams();
  const medplum = useMedplum();
  const [patient, setPatient] = useState<Patient | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);

      try {
        const p = await medplum.readResource('Patient', id);
        setPatient(p);

        const related = await medplum.searchResources('RelatedPerson', {
          patient: `Patient/${id}`,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, medplum]);


  if (loading || !patient) {
    return <Loader />;
  }

  return (
    <Stack><PatientDetailsTable patient={patient} /></Stack>
  );
}
