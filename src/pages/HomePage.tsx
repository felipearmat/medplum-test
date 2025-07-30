import { JSX, useEffect, useState } from 'react';
import { Title } from '@mantine/core';
import { SearchRequest } from '@medplum/core';
import { Practitioner } from '@medplum/fhirtypes';
import {
  Document,
  ResourceName,
  useMedplumProfile,
  useMedplum,
  SearchControl,
} from '@medplum/react';

export function HomePage(): JSX.Element {
  const profile = useMedplumProfile() as Practitioner;
  const medplum = useMedplum();
  const [search, setSearch] = useState<SearchRequest>({
    resourceType: 'Patient',
    fields: ['name', 'birthDate', 'gender', 'generalPractitioner']
  });
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);

  useEffect(() => {
    async function fetchPractitioners() {
      const results = await medplum.searchResources('Practitioner');
      setPractitioners(results);
    }

    fetchPractitioners();
  }, [medplum]);

  return (
    <Document>
      <Title mb="md">
        Welcome <ResourceName value={profile} link />
      </Title>

      <SearchControl search={search} hideToolbar={true} onChange={e => setSearch(e.definition)} />
    </Document>
  );
}
