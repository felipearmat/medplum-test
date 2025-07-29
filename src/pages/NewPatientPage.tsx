import { useMedplum, useMedplumProfile } from '@medplum/react';
import { TextInput, Button, Paper, Title, Group, Select } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useEffect, useState } from 'react';
import { showNotification } from '@mantine/notifications';

export function NewPatientPage() {
  const medplum = useMedplum();
  const profile = useMedplumProfile();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    caregiverName: '',
    caregiverEmail: '',
    companyId: '',
    joinDate: null as any,
  });

  const [companies, setCompanies] = useState<any[]>([]);

  if (profile?.resourceType !== 'Practitioner') {
    return <div style={{ color: 'red', padding: '1rem' }}>Only practitioners can register patients.</div>;
  }

  useEffect(() => {
    medplum.search('Organization').then((res) => setCompanies(res.entry?.map((e) => e.resource) || []));
  }, [medplum]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const patient = await medplum.createResource({
        resourceType: 'Patient',
        name: [{ text: formData.name }],
        telecom: formData.email ? [{ system: 'email', value: formData.email }] : undefined,
        managingOrganization: formData.companyId
          ? { reference: `Organization/${formData.companyId}` }
          : undefined,
        extension: formData.joinDate
          ? [{
              url: 'http://example.org/fhir/StructureDefinition/patient-join-date',
              valueDate: formData.joinDate.toISOString().split('T')[0],
            }]
          : undefined,
      });

      if (formData.caregiverEmail) {
        const existing = await medplum.searchResources('RelatedPerson', {
          'telecom': formData.caregiverEmail,
        });

        if (existing.length <= 0) {
          const relatedPerson = await medplum.createResource({
            resourceType: 'RelatedPerson',
            name: [{ text: formData.caregiverName }],
            telecom: [{ system: 'email', value: formData.caregiverEmail }],
            relationship: [{
              coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
                code: 'CAREGIVER',
                display: 'Caregiver',
              }],
            }],
            patient: { reference: `Patient/${patient.id}` },
          });

          showNotification({
            title: 'Caregiver created',
            message: `Caregiver ${relatedPerson.name?.[0]?.text} registered successfully.`,
            color: 'green',
          });

        }
      }

      showNotification({
        title: 'Patient created',
        message: `Patient ${patient.name?.[0]?.text} registered successfully.`,
        color: 'green',
      });

      setFormData({
        name: '',
        email: '',
        caregiverName: '',
        caregiverEmail: '',
        companyId: '',
        joinDate: null,
      });
    } catch (err) {
      console.error(err);
      showNotification({
        title: 'Error',
        message: 'Failed to create patient. Check the data.',
        color: 'red',
      });
    }
  }

  return (
    <Paper shadow="sm" radius="md" p="md" withBorder>
      <Title order={4} mb="md">Register New Patient</Title>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Full Name"
          placeholder="e.g., John Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
          required
        />
        <TextInput
          label="Email (optional, for future login)"
          placeholder="e.g., user@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.currentTarget.value })}
        />

        <TextInput
          label="Caregiver Name"
          placeholder="e.g., Mary Johnson"
          value={formData.caregiverName}
          onChange={(e) => setFormData({ ...formData, caregiverName: e.currentTarget.value })}
        />

        <TextInput
          label="Caregiver Email"
          placeholder="e.g., mary@example.com"
          value={formData.caregiverEmail}
          onChange={(e) => setFormData({ ...formData, caregiverEmail: e.currentTarget.value })}
        />

        <Select
          label="Company (Organization)"
          placeholder="Select a company"
          data={companies.map((org) => ({
            value: org.id,
            label: org.name || org.id,
          }))}
          value={formData.companyId}
          onChange={(value) => setFormData({ ...formData, companyId: value ?? '' })}
        />

        <DatePickerInput
          label="Join Date"
          placeholder="Date the patient joined the company"
          value={formData.joinDate}
          onChange={(date) => setFormData({ ...formData, joinDate: date })}
        />

        <Group mt="md">
          <Button type="submit">Create Patient</Button>
        </Group>
      </form>
    </Paper>
  );
}
