export interface DocumentPackInput {
  title: string;
  subject: string;
  recipientName: string;
  recipientInstitution: string;
  includeInspectionReport?: boolean;
  includeProtocolChecklist?: boolean;
}

export interface DocumentPackItem {
  documentType: 'oficio' | 'requerimento' | 'relatorio_fiscalizacao' | 'checklist_protocolo';
  title: string;
  subject: string;
  recipient: string;
  status: 'draft';
}

/**
 * Generates a coordinated Document Pack reusing shared context (Section 24.8).
 */
export function buildDocumentPack(input: DocumentPackInput): DocumentPackItem[] {
  const recipient = `${input.recipientName} (${input.recipientInstitution})`;
  const pack: DocumentPackItem[] = [
    {
      documentType: 'oficio',
      title: `Ofício — ${input.title}`,
      subject: input.subject,
      recipient,
      status: 'draft',
    },
    {
      documentType: 'requerimento',
      title: `Requerimento — ${input.title}`,
      subject: input.subject,
      recipient,
      status: 'draft',
    },
  ];

  if (input.includeInspectionReport) {
    pack.push({
      documentType: 'relatorio_fiscalizacao',
      title: `Relatório de Fiscalização — ${input.title}`,
      subject: input.subject,
      recipient,
      status: 'draft',
    });
  }

  if (input.includeProtocolChecklist) {
    pack.push({
      documentType: 'checklist_protocolo',
      title: `Checklist e Follow-up — ${input.title}`,
      subject: input.subject,
      recipient,
      status: 'draft',
    });
  }

  return pack;
}
