import { describe, test } from '../harness/runner.ts';
import {
  assertEqual,
  assertTrue,
  assertFalse,
  assertThrows,
  assertMatches
} from '../harness/assertions.ts';

describe('Tier 2: Input Validation, Schema Boundaries & Constraints', { tier: 2 }, () => {
  // 1. Citizen Form Boundaries
  test('B1.1: Citizen name boundaries (min 2, max 150 chars)', () => {
    function validateCitizenName(name: string): boolean {
      if (!name || name.trim().length < 2) throw new Error('Nome deve ter pelo menos 2 caracteres');
      if (name.length > 150) throw new Error('Nome excede o limite de 150 caracteres');
      return true;
    }

    assertThrows(() => validateCitizenName(''), 'Nome deve ter pelo menos 2 caracteres');
    assertThrows(() => validateCitizenName('A'), 'Nome deve ter pelo menos 2 caracteres');
    assertThrows(() => validateCitizenName(' '.repeat(5)), 'Nome deve ter pelo menos 2 caracteres');
    assertThrows(() => validateCitizenName('A'.repeat(151)), 'Nome excede o limite de 150 caracteres');
    assertTrue(validateCitizenName('Ana'), 'Valid 3-char name passes');
    assertTrue(validateCitizenName('A'.repeat(150)), 'Max length 150-char name passes');
  });

  test('B1.2: Citizen email formatting boundary checks', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    function validateEmail(email: string): boolean {
      if (!emailRegex.test(email)) throw new Error('E-mail inválido');
      return true;
    }

    assertThrows(() => validateEmail('invalid'), 'E-mail inválido');
    assertThrows(() => validateEmail('user@'), 'E-mail inválido');
    assertThrows(() => validateEmail('@domain.com'), 'E-mail inválido');
    assertThrows(() => validateEmail('user@domain'), 'E-mail inválido');
    assertThrows(() => validateEmail('user name@domain.com'), 'E-mail inválido');
    assertTrue(validateEmail('cidadao@exemplo.com.br'), 'Standard email passes');
    assertTrue(validateEmail('a@b.co'), 'Shortest valid email passes');
  });

  test('B1.3: Citizen phone number international & local format regex', () => {
    const phoneRegex = /^\+?[0-9\s().-]{8,20}$/;
    function validatePhone(phone: string): boolean {
      if (!phoneRegex.test(phone)) throw new Error('Telefone inválido');
      return true;
    }

    assertThrows(() => validatePhone('123'), 'Telefone inválido');
    assertThrows(() => validatePhone('abc-def-ghij'), 'Telefone inválido');
    assertThrows(() => validatePhone('+55 (11) 98765-43210000000000'), 'Telefone inválido');
    assertTrue(validatePhone('11987654321'), 'Numeric phone passes');
    assertTrue(validatePhone('+55 11 98765-4321'), 'Formatted phone passes');
    assertTrue(validatePhone('(11) 3344-5566'), 'Landline phone passes');
  });

  // 2. Demand Form Boundaries
  test('B1.4: Demand subject boundaries (min 3, max 200 chars)', () => {
    function validateDemandSubject(subject: string): boolean {
      if (!subject || subject.trim().length < 3) throw new Error('Assunto deve ter pelo menos 3 caracteres');
      if (subject.length > 200) throw new Error('Assunto excede o limite de 200 caracteres');
      return true;
    }

    assertThrows(() => validateDemandSubject(''), 'Assunto deve ter pelo menos 3 caracteres');
    assertThrows(() => validateDemandSubject('Oi'), 'Assunto deve ter pelo menos 3 caracteres');
    assertThrows(() => validateDemandSubject('A'.repeat(201)), 'Assunto excede o limite de 200 caracteres');
    assertTrue(validateDemandSubject('Luz'), '3-char subject passes');
    assertTrue(validateDemandSubject('A'.repeat(200)), 'Max length 200-char subject passes');
  });

  test('B1.5: Demand priority enum boundary validation', () => {
    const validPriorities = ['low', 'normal', 'high', 'urgent'] as const;
    function validatePriority(p: string): boolean {
      if (!validPriorities.includes(p as any)) throw new Error(`Prioridade inválida: ${p}`);
      return true;
    }

    assertThrows(() => validatePriority('super-urgent'), 'Prioridade inválida');
    assertThrows(() => validatePriority('critical'), 'Prioridade inválida');
    assertThrows(() => validatePriority(''), 'Prioridade inválida');
    assertTrue(validatePriority('low'), 'low priority passes');
    assertTrue(validatePriority('normal'), 'normal priority passes');
    assertTrue(validatePriority('high'), 'high priority passes');
    assertTrue(validatePriority('urgent'), 'urgent priority passes');
  });

  test('B1.6: Demand status transition validation', () => {
    const validStatuses = ['received', 'triage', 'in_progress', 'waiting', 'resolved', 'closed'] as const;
    function validateStatus(s: string): boolean {
      if (!validStatuses.includes(s as any)) throw new Error(`Status inválido: ${s}`);
      return true;
    }

    assertThrows(() => validateStatus('deleted'), 'Status inválido');
    assertThrows(() => validateStatus('archived'), 'Status inválido');
    assertThrows(() => validateStatus('unknown'), 'Status inválido');
    assertTrue(validateStatus('received'), 'received passes');
    assertTrue(validateStatus('in_progress'), 'in_progress passes');
    assertTrue(validateStatus('resolved'), 'resolved passes');
    assertTrue(validateStatus('closed'), 'closed passes');
  });

  // 3. Event / Agenda Date Boundaries
  test('B1.7: Event date range order constraint (ends_at > starts_at)', () => {
    function validateDateRange(startsAt: string, endsAt: string): boolean {
      const start = new Date(startsAt).getTime();
      const end = new Date(endsAt).getTime();
      if (isNaN(start) || isNaN(end)) throw new Error('Data/hora inválida');
      if (end <= start) throw new Error('Data final deve ser posterior à data inicial');
      return true;
    }

    // Inverted range
    assertThrows(
      () => validateDateRange('2026-11-23T14:00:00Z', '2026-11-23T13:00:00Z'),
      'Data final deve ser posterior à data inicial'
    );
    // Identical start and end
    assertThrows(
      () => validateDateRange('2026-11-23T14:00:00Z', '2026-11-23T14:00:00Z'),
      'Data final deve ser posterior à data inicial'
    );
    // Malformed date string
    assertThrows(() => validateDateRange('invalid-date', '2026-11-23T14:00:00Z'), 'Data/hora inválida');
    // Valid chronological order
    assertTrue(validateDateRange('2026-11-23T14:00:00Z', '2026-11-23T15:00:00Z'), 'Valid order passes');
  });

  // 4. Tenant Slug Boundaries
  test('B1.8: Master tenant slug formatting regex and length boundaries', () => {
    const slugRegex = /^[a-z0-9-]+$/;
    function validateTenantSlug(slug: string): boolean {
      if (!slug || slug.length < 3) throw new Error('Slug deve conter pelo menos 3 caracteres');
      if (slug.length > 50) throw new Error('Slug excede 50 caracteres');
      if (!slugRegex.test(slug)) throw new Error('Slug deve conter apenas letras minúsculas, números e hífens');
      return true;
    }

    assertThrows(() => validateTenantSlug('AB'), 'Slug deve conter pelo menos 3 caracteres');
    assertThrows(() => validateTenantSlug('Meu Gabinete'), 'Slug deve conter apenas letras minúsculas');
    assertThrows(() => validateTenantSlug('gabinete_mariana'), 'Slug deve conter apenas letras minúsculas');
    assertThrows(() => validateTenantSlug('gabinete!'), 'Slug deve conter apenas letras minúsculas');
    assertThrows(() => validateTenantSlug('a'.repeat(51)), 'Slug excede 50 caracteres');
    assertTrue(validateTenantSlug('gabinete-mariana-costa'), 'Valid hyphenated slug passes');
    assertTrue(validateTenantSlug('camara-sp-2026'), 'Valid alphanumeric slug passes');
  });

  // 5. JIT Request Purpose & Scope Boundaries
  test('B1.9: JIT access request boundaries (purpose min 10 chars, forbidden scopes)', () => {
    const forbiddenScopes = ['reports', 'denuncias', 'citizen_pii', 'root_admin'];
    function validateJITRequest(req: { purpose: string; scope: string; duration_minutes: number }): boolean {
      if (!req.purpose || req.purpose.trim().length < 10) {
        throw new Error('Justificativa deve conter no mínimo 10 caracteres');
      }
      if (forbiddenScopes.includes(req.scope)) {
        throw new Error(`Escopo proibido para suporte: ${req.scope}`);
      }
      if (req.duration_minutes < 15 || req.duration_minutes > 240) {
        throw new Error('Duração deve estar entre 15 e 240 minutos');
      }
      return true;
    }

    assertThrows(
      () => validateJITRequest({ purpose: 'Curto', scope: 'read_diagnostics', duration_minutes: 60 }),
      'Justificativa deve conter no mínimo 10 caracteres'
    );
    assertThrows(
      () => validateJITRequest({ purpose: 'Acesso para ver denúncias de corrupção', scope: 'reports', duration_minutes: 60 }),
      'Escopo proibido para suporte: reports'
    );
    assertThrows(
      () => validateJITRequest({ purpose: 'Acesso para ver denúncias', scope: 'denuncias', duration_minutes: 60 }),
      'Escopo proibido para suporte: denuncias'
    );
    assertThrows(
      () => validateJITRequest({ purpose: 'Diagnóstico de sincronização de módulos', scope: 'read_diagnostics', duration_minutes: 10 }),
      'Duração deve estar entre 15 e 240 minutos'
    );
    assertThrows(
      () => validateJITRequest({ purpose: 'Diagnóstico de sincronização de módulos', scope: 'read_diagnostics', duration_minutes: 300 }),
      'Duração deve estar entre 15 e 240 minutos'
    );
    assertTrue(
      validateJITRequest({ purpose: 'Diagnóstico técnico de sincronização de módulos', scope: 'read_diagnostics', duration_minutes: 60 }),
      'Valid JIT request passes'
    );
  });

  // 6. Public Portal Participation Boundaries
  test('B1.10: Public portal participation intake form boundaries (LGPD, subject, description)', () => {
    function validatePortalParticipation(input: {
      name: string;
      email: string;
      neighborhood: string;
      category: string;
      subject: string;
      description: string;
      consent_lgpd: boolean;
    }): boolean {
      if (!input.consent_lgpd) throw new Error('É necessário aceitar os termos de privacidade (LGPD)');
      if (!input.name || input.name.trim().length < 2) throw new Error('Nome deve ter pelo menos 2 caracteres');
      if (!input.subject || input.subject.trim().length < 5) throw new Error('Assunto deve conter no mínimo 5 caracteres');
      if (!input.description || input.description.trim().length < 10) throw new Error('Descrição deve conter no mínimo 10 caracteres');
      if (!input.neighborhood || input.neighborhood.trim().length < 2) throw new Error('Bairro é obrigatório');
      if (!input.category || input.category.trim().length === 0) throw new Error('Categoria é obrigatória');
      return true;
    }

    const base = {
      name: 'João Cidadão',
      email: 'joao@email.com',
      neighborhood: 'Centro',
      category: 'saude',
      subject: 'Falta de médicos no posto',
      description: 'Estamos sem clínico geral há duas semanas.',
      consent_lgpd: true
    };

    assertThrows(() => validatePortalParticipation({ ...base, consent_lgpd: false }), 'É necessário aceitar os termos de privacidade');
    assertThrows(() => validatePortalParticipation({ ...base, name: 'A' }), 'Nome deve ter pelo menos 2 caracteres');
    assertThrows(() => validatePortalParticipation({ ...base, subject: 'Oi' }), 'Assunto deve conter no mínimo 5 caracteres');
    assertThrows(() => validatePortalParticipation({ ...base, description: 'Curto' }), 'Descrição deve conter no mínimo 10 caracteres');
    assertThrows(() => validatePortalParticipation({ ...base, neighborhood: '' }), 'Bairro é obrigatório');
    assertThrows(() => validatePortalParticipation({ ...base, category: '' }), 'Categoria é obrigatória');
    assertTrue(validatePortalParticipation(base), 'Valid portal participation passes');
  });

  // 7. Legislative & Inspection Boundaries
  test('B1.11: Legislative item type and proposition number boundaries', () => {
    const validLegTypes = ['projeto_de_lei', 'requerimento', 'indicacao', 'mocao', 'emenda'];
    function validateLegislativeItem(item: { item_type: string; number: string; title: string }): boolean {
      if (!validLegTypes.includes(item.item_type)) throw new Error(`Tipo de proposição inválido: ${item.item_type}`);
      if (!item.number || !item.number.includes('/')) throw new Error('Número deve estar no formato NUM/ANO');
      if (!item.title || item.title.trim().length < 5) throw new Error('Título deve ter pelo menos 5 caracteres');
      return true;
    }

    assertThrows(() => validateLegislativeItem({ item_type: 'decreto_real', number: '01/2026', title: 'Título válido' }), 'Tipo de proposição inválido');
    assertThrows(() => validateLegislativeItem({ item_type: 'projeto_de_lei', number: '012026', title: 'Título válido' }), 'Número deve estar no formato NUM/ANO');
    assertThrows(() => validateLegislativeItem({ item_type: 'projeto_de_lei', number: '01/2026', title: 'Abc' }), 'Título deve ter pelo menos 5 caracteres');
    assertTrue(validateLegislativeItem({ item_type: 'projeto_de_lei', number: '42/2026', title: 'Criação do programa de hortas' }), 'Valid PL passes');
    assertTrue(validateLegislativeItem({ item_type: 'requerimento', number: '108/2026', title: 'Pedido de informações sobre obras' }), 'Valid requerimento passes');
  });

  // 8. Inspection Case & Evidence Boundaries
  test('B1.12: Inspection case boundaries (case number format, non-negative evidence)', () => {
    function validateInspection(insp: { case_number: string; title: string; evidence_count: number }): boolean {
      if (!/^FISC-\d{4}-\d{3,}$/.test(insp.case_number)) throw new Error('Número de fiscalização deve seguir FISC-AAAA-NNN');
      if (!insp.title || insp.title.trim().length < 5) throw new Error('Título deve ter pelo menos 5 caracteres');
      if (insp.evidence_count < 0) throw new Error('Contador de evidências não pode ser negativo');
      return true;
    }

    assertThrows(() => validateInspection({ case_number: 'INVALID', title: 'Título válido', evidence_count: 0 }), 'Número de fiscalização deve seguir FISC-AAAA-NNN');
    assertThrows(() => validateInspection({ case_number: 'FISC-2026-001', title: 'Oi', evidence_count: 0 }), 'Título deve ter pelo menos 5 caracteres');
    assertThrows(() => validateInspection({ case_number: 'FISC-2026-001', title: 'Fiscalização de posto', evidence_count: -1 }), 'Contador de evidências não pode ser negativo');
    assertTrue(validateInspection({ case_number: 'FISC-2026-001', title: 'Fiscalização da UBS Central', evidence_count: 3 }), 'Valid inspection passes');
  });

  // 9. Citizen Communication Channel Boundaries
  test('B1.13: Citizen preferred channel enum validation', () => {
    const validChannels = ['whatsapp', 'email', 'phone', 'in_person'] as const;
    function validateChannel(ch: string): boolean {
      if (!validChannels.includes(ch as any)) throw new Error(`Canal de atendimento inválido: ${ch}`);
      return true;
    }

    assertThrows(() => validateChannel('telegram'), 'Canal de atendimento inválido');
    assertThrows(() => validateChannel('smoke_signal'), 'Canal de atendimento inválido');
    assertThrows(() => validateChannel(''), 'Canal de atendimento inválido');
    assertTrue(validateChannel('whatsapp'), 'whatsapp channel passes');
    assertTrue(validateChannel('email'), 'email channel passes');
    assertTrue(validateChannel('phone'), 'phone channel passes');
    assertTrue(validateChannel('in_person'), 'in_person channel passes');
  });

  // 10. Task Status and Priority Boundaries
  test('B1.14: Task status and priority enum boundaries', () => {
    const validTaskStatuses = ['pending', 'in_progress', 'completed', 'cancelled'] as const;
    function validateTaskStatus(st: string): boolean {
      if (!validTaskStatuses.includes(st as any)) throw new Error(`Status de tarefa inválido: ${st}`);
      return true;
    }

    assertThrows(() => validateTaskStatus('archived'), 'Status de tarefa inválido');
    assertThrows(() => validateTaskStatus('deleted'), 'Status de tarefa inválido');
    assertTrue(validateTaskStatus('pending'), 'pending passes');
    assertTrue(validateTaskStatus('in_progress'), 'in_progress passes');
    assertTrue(validateTaskStatus('completed'), 'completed passes');
    assertTrue(validateTaskStatus('cancelled'), 'cancelled passes');
  });

  // 11. Customer Type Boundaries
  test('B1.15: Platform tenant customer_type enum boundaries', () => {
    const validCustomerTypes = ['individual_cabinet', 'municipal_chamber'] as const;
    function validateCustomerType(type: string): boolean {
      if (!validCustomerTypes.includes(type as any)) throw new Error(`Tipo de cliente inválido: ${type}`);
      return true;
    }

    assertThrows(() => validateCustomerType('enterprise'), 'Tipo de cliente inválido');
    assertThrows(() => validateCustomerType('ngo'), 'Tipo de cliente inválido');
    assertThrows(() => validateCustomerType(''), 'Tipo de cliente inválido');
    assertTrue(validateCustomerType('individual_cabinet'), 'individual_cabinet passes');
    assertTrue(validateCustomerType('municipal_chamber'), 'municipal_chamber passes');
  });
});
