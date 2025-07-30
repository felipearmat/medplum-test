import { JSX, useEffect, useState } from 'react';
import { useMedplum } from '@medplum/react';
import { Patient, RelatedPerson } from '@medplum/fhirtypes';
import {
  Paper,
  Title,
  Table,
  Loader,
  List
} from '@mantine/core';

export function formatPatientValue(value: any): string | string[] {
  if (value == null) return '';

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    return formatPatientValue(value)
  }

  return String(value);
}

interface PatientDetailsTableProps {
  patient: Patient;
}

export function PatientDetailsTable({ patient }: PatientDetailsTableProps): JSX.Element {
  const id = patient.id;
  const medplum = useMedplum();
  const [caregivers, setCaregivers] = useState<RelatedPerson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);

      try {
        const caregivers = await medplum.searchResources('RelatedPerson', {
          patient: `Patient/${id}`,
          'relationship:code': 'CAREGIVER',
        });

        setCaregivers(caregivers);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, medplum]);

  if (loading || !patient) {
    return <Loader />;
  }

  const rows = [
    ['ID', id],
    ['Identifier', patient.identifier?.[0]?.value ?? ''],
    ['Active', patient.active ? 'Yes' : 'No'],
    ['Name', patient.name?.[0]?.text ?? ''],
    ['Telecom', patient.telecom?.[0]?.value ?? ''],
    ['Gender', patient.gender ?? ''],
    ['Birth Date', patient.birthDate ?? ''],
    ['Deceased', patient.deceasedBoolean ? 'Yes' : 'No'],
    ['Address', patient.address?.[0]?.text ?? ''],
    ['Marital Status', patient.maritalStatus?.text ?? ''],
    ['Multiple Birth', patient.multipleBirthBoolean ? 'Yes' : 'No'],
    ['Photo', patient.photo?.[0] ?? ''],
    ['Contact', patient.contact?.[0]?.name?.text ?? ''],
    ['Communication', patient.communication?.[0]?.language?.text ?? ''],
    ['General Practitioner', patient.generalPractitioner?.[0]?.reference ?? ''],
    ['Managing Organization', patient.managingOrganization?.reference ?? ''],
    ['Link', patient.link?.[0]?.other?.reference ?? '']
  ];

  return (
    <Paper shadow="sm" radius="md" p="md" withBorder>
      <Title order={4} mb="sm">Patient Details</Title>
      <Table highlightOnHover striped>
        <tbody>
          {rows.map(([label, value]) => {
            label = String(label);
            return (
              <tr key={label}>
                <td style={{ fontWeight: 500, width: 250 }}>{label}</td>
                <td>{formatPatientValue(value)}</td>
              </tr>
            )
          })}
          {caregivers.length > 0 && (
            <tr>
              <td style={{ fontWeight: 500 }}>Caregivers</td>
              <td>
                <List size="sm" spacing={4} withPadding>
                  {caregivers.map((cg) => (
                    <List.Item key={cg.id}>
                      <span>{cg.name?.[0]?.text ?? 'Unnamed'}</span>{' '}
                      – {cg.telecom?.find((t) => t.system === 'email')?.value ?? 'No email'}
                    </List.Item>
                  ))}
                </List>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Paper>
  );
}
