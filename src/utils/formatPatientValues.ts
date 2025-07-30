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
