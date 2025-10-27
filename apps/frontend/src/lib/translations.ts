// Translations for DocumentType enum
export const documentTypeTranslations: Record<string, string> = {
  id_card: 'Carta d\'Identità',
  passport: 'Passaporto',
  driving_license: 'Patente',
  other: 'Altro',
};

export const translateDocumentType = (type: string): string => {
  return documentTypeTranslations[type] || type;
};

// Translations for VisitStatus enum
export const visitStatusTranslations: Record<string, string> = {
  pending: 'In Attesa',
  approved: 'Approvato',
  rejected: 'Rifiutato',
  checked_in: 'Presente',
  checked_out: 'Uscito',
  cancelled: 'Annullato',
  expired: 'Scaduto',
};

export const translateVisitStatus = (status: string): string => {
  return visitStatusTranslations[status] || status;
};

// Get color for status chips
export const getVisitStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'checked_in':
      return 'success';
    case 'checked_out':
      return 'info';
    case 'pending':
      return 'warning';
    case 'approved':
      return 'primary';
    case 'rejected':
    case 'cancelled':
      return 'error';
    case 'expired':
      return 'default';
    default:
      return 'default';
  }
};

// Translations for VisitType enum
export const visitTypeTranslations: Record<string, string> = {
  business: 'Business',
  personal: 'Personale',
  delivery: 'Consegna',
  maintenance: 'Manutenzione',
  interview: 'Colloquio',
  other: 'Altro',
};

export const translateVisitType = (type: string): string => {
  return visitTypeTranslations[type] || type;
};
