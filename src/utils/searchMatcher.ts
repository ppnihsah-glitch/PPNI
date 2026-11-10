import { Participant } from '../types';

/**
 * Normalizes phone numbers by stripping non-numeric characters
 * E.g., "+60 14-2700 827" -> "0142700827"
 */
export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('60')) {
    cleaned = '0' + cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Performs fuzzy & partial matching for participant lookups
 * Handles:
 * 1. Partial name (e.g., "ayris", "mohamad", "danish")
 * 2. Partial parent name (e.g., "nor aliza", "jafferi")
 * 3. Partial phone (e.g. "01427", "2700827", "014-270")
 * 4. Participant ID direct search (e.g. "T001", "R005", "t-001")
 */
export function searchParticipants(
  participants: Participant[],
  query: string
): Participant[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const cleanedQueryPhone = cleanPhoneNumber(trimmed);
  // Also check if user entered ID with dash like "T-001"
  const normalizedIdQuery = trimmed.replace(/-/g, '').toUpperCase();

  return participants.filter((p) => {
    // 1. Participant ID match (e.g. T001, T-001)
    const pCleanId = p.id.replace(/-/g, '').toUpperCase();
    if (pCleanId.includes(normalizedIdQuery)) {
      return true;
    }

    // 2. Child Name partial match
    if (p.name.toLowerCase().includes(trimmed)) {
      return true;
    }

    // 3. Parent Name partial match
    if (p.parentName && p.parentName.toLowerCase().includes(trimmed)) {
      return true;
    }

    // 4. Phone Number partial match
    if (cleanedQueryPhone && cleanedQueryPhone.length >= 3) {
      const pCleanPhone = cleanPhoneNumber(p.phone);
      if (pCleanPhone.includes(cleanedQueryPhone)) {
        return true;
      }
    }

    // 5. School partial match
    if (p.school && p.school.toLowerCase().includes(trimmed)) {
      return true;
    }

    return false;
  });
}
