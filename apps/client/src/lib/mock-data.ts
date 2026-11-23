/**
 * GABINETE 360° — CONJUNTO DE DADOS DE DEMONSTRAÇÃO
 * 
 * ATENÇÃO: Todos os dados neste arquivo são estritamente fictícios para fins
 * de homologação, testes e demonstração do sistema.
 * Mandato demonstrativo: Vereadora Mariana Costa — Câmara Municipal de Santos / SP.
 */

import type {
  PreferredChannel,
  CitizenStatus,
  DemandStatus,
  DemandPriority,
  AgendaEventType,
  AgendaStatus,
} from "@gabinete360/types";

// ============================================================================
// CONSTANTES DO MANDATO DEMO
// ============================================================================
export const DEMO_ORGANIZATION_ID = "org-gabinete-mariana";
export const DEMO_WORKSPACE_ID = "wks-santos-01";
export const DEMO_MANDATE_TITLE = "Vereadora Mariana Costa";
export const DEMO_MANDATE_CITY = "Santos · SP";

// ============================================================================
// 1. CIDADÃOS DEMONSTRAÇÃO (CRM)
// ============================================================================
export interface DemoCitizen {
  id: string;
  organization_id: string;
  name: string;
  display_name: string;
  cpf?: string | null;
  email?: string | null;
  phone: string;
  preferred_channel: PreferredChannel;
  neighborhood: string;
  city: string;
  state: string;
  address_line?: string | null;
  tags: string[];
  notes?: string | null;
  status: CitizenStatus;
  demands_count: number;
  created_at: string;
  updated_at: string;
}

export const DEMO_CITIZENS: DemoCitizen[] = [
  {
    id: "cit-s2-01",
    organization_id: DEMO_ORGANIZATION_ID,
    name: "Dona Maria de Lourdes",
    display_name: "Dona Maria de Lourdes",
    cpf: "123.456.789-00",
    email: "maria.lourdes@exemplo.com.br",
    phone: "+55 11 98877-6655",
    preferred_channel: "whatsapp",
    neighborhood: "Jardim das Flores",
    city: "Santos",
    state: "SP",
    address_line: "Rua das Flores, 142",
    tags: ["Liderança Comunitária", "Terceira Idade", "Comunitário"],
    notes: "Liderança de moradores do Jardim das Flores há mais de 15 anos. Contato chave para demandas de zeladoria.",
    status: "active",
    demands_count: 2,
    created_at: "2026-08-10T14:20:00Z",
    updated_at: "2026-11-20T10:15:00Z",
  },
  {
    id: "cit-101",
    organization_id: DEMO_ORGANIZATION_ID,
    name: "João Pereira da Silva",
    display_name: "João Pereira da Silva",
    cpf: "234.567.890-11",
    email: "joao.pereira@gmail.com",
    phone: "+55 11 98765-4321",
    preferred_channel: "whatsapp",
    neighborhood: "Vila Mariana",
    city: "Santos",
    state: "SP",
    address_line: "Av. Conselheiro Nébias, 500",
    tags: ["Comerciante", "CDL", "Zeladoria"],
    notes: "Presidente da Associação Comercial de Bairro. Solicita reparos de iluminação e segurança noturna.",
    status: "active",
    demands_count: 3,
    created_at: "2026-09-01T09:30:00Z",
    updated_at: "2026-11-18T16:45:00Z",
  },
  {
    id: "cit-102",
    organization_id: DEMO_ORGANIZATION_ID,
    name: "Carlos Alberto Silva",
    display_name: "Carlos Alberto Silva",
    cpf: "345.678.901-22",
    email: "carlos.silva@educacao.sp.gov.br",
    phone: "+55 13 99781-2233",
    preferred_channel: "email",
    neighborhood: "Ponta da Praia",
    city: "Santos",
    state: "SP",
    address_line: "Rua Trabulsi, 88",
    tags: ["Educação", "Professor", "Acessibilidade"],
    notes: "Diretor escolar da rede municipal. Pede apoio para reforma de quadra e acessibilidade de UBS.",
    status: "active",
    demands_count: 1,
    created_at: "2026-09-15T11:00:00Z",
    updated_at: "2026-11-19T14:20:00Z",
  },
  {
    id: "cit-103",
    organization_id: DEMO_ORGANIZATION_ID,
    name: "Dra. Helena Guimarães",
    display_name: "Dra. Helena Guimarães",
    cpf: "456.789.012-33",
    email: "helena.guimaraes@crmsp.org.br",
    phone: "+55 13 99712-3456",
    preferred_channel: "phone",
    neighborhood: "Gonzaga",
    city: "Santos",
    state: "SP",
    address_line: "Av. Ana Costa, 320",
    tags: ["Saúde", "Médica", "Conselho de Saúde"],
    notes: "Membro do Conselho Municipal de Saúde. Traz informações sobre escalas médicas nas UPAs.",
    status: "active",
    demands_count: 2,
    created_at: "2026-10-02T16:10:00Z",
    updated_at: "2026-11-21T08:50:00Z",
  },
  {
    id: "cit-104",
    organization_id: DEMO_ORGANIZATION_ID,
    name: "Marcos Vinícius Pires",
    display_name: "Marcos Vinícius Pires",
    cpf: "567.890.123-44",
    email: "marcos.pires.santos@gmail.com",
    phone: "+55 13 98123-4567",
    preferred_channel: "in_person",
    neighborhood: "Zona Noroeste",
    city: "Santos",
    state: "SP",
    address_line: "Rua Nossa Senhora de Fátima, 1200",
    tags: ["Juventude", "Esporte Comunitário"],
    notes: "Organizador de torneios de várzea e projetos sociais esportivos na Zona Noroeste.",
    status: "active",
    demands_count: 2,
    created_at: "2026-10-14T10:00:00Z",
    updated_at: "2026-11-15T17:30:00Z",
  },
  {
    id: "cit-105",
    organization_id: DEMO_ORGANIZATION_ID,
    name: "Maria de Fátima Ramos",
    display_name: "Maria de Fátima Ramos",
    cpf: "678.901.234-55",
    email: "fatima.ramos72@yahoo.com.br",
    phone: "+55 13 99234-5678",
    preferred_channel: "whatsapp",
    neighborhood: "Embaré",
    city: "Santos",
    state: "SP",
    address_line: "Rua Epitácio Pessoa, 45",
    tags: ["Morador", "Zeladoria"],
    notes: "Munícipe assídua nos canais de comunicação do gabinete sobre arborização urbana.",
    status: "active",
    demands_count: 1,
    created_at: "2026-11-01T15:30:00Z",
    updated_at: "2026-11-17T12:00:00Z",
  },
];

// ============================================================================
// 2. ATENDIMENTOS E DEMANDAS DEMONSTRAÇÃO
// ============================================================================
export interface DemoDemandEvent {
  id: string;
  demand_id: string;
  event_type: "created" | "assigned" | "status_changed" | "forwarded" | "responded" | "closed";
  actor_name: string;
  note: string;
  created_at: string;
}

export interface DemoDemand {
  id: string;
  organization_id: string;
  workspace_id: string;
  protocol: string;
  citizen_id?: string | null;
  citizen_name: string;
  citizen_phone?: string;
  preferred_channel: PreferredChannel;
  title: string;
  description: string;
  category: "iluminacao" | "saude" | "educacao" | "zeladoria" | "seguranca" | "saneamento" | "transporte" | "outros";
  priority: "low" | "normal" | "medium" | "high" | "urgent";
  status: DemandStatus;
  classification: "public" | "internal" | "confidential";
  neighborhood: string;
  location_text: string;
  assigned_to: string;
  assigned_name: string;
  due_at: string;
  created_at: string;
  updated_at: string;
  events: DemoDemandEvent[];
}

export const DEMO_DEMANDS: DemoDemand[] = [
  {
    id: "dem-s2-01",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    protocol: "#AT-0841",
    citizen_id: "cit-s2-01",
    citizen_name: "Dona Maria de Lourdes",
    citizen_phone: "+55 11 98877-6655",
    preferred_channel: "whatsapp",
    title: "Iluminação pública na Rua das Flores",
    description: "Postes de iluminação apagados há 3 semanas na extensão entre os números 100 e 250 da Rua das Flores, causando insegurança.",
    category: "iluminacao",
    priority: "urgent",
    status: "in_progress",
    classification: "public",
    neighborhood: "Jardim das Flores",
    location_text: "Rua das Flores, alt. 142 - Jardim das Flores",
    assigned_to: "usr-adv-ana",
    assigned_name: "Ana Souza",
    due_at: "2026-11-24T18:00:00Z",
    created_at: "2026-11-20T10:30:00Z",
    updated_at: "2026-11-22T09:15:00Z",
    events: [
      {
        id: "evt-dem-1",
        demand_id: "dem-s2-01",
        event_type: "created",
        actor_name: "Beatriz Rocha (Atendente)",
        note: "Atendimento registrado no gabinete via WhatsApp com relato fotográfico.",
        created_at: "2026-11-20T10:30:00Z",
      },
      {
        id: "evt-dem-2",
        demand_id: "dem-s2-01",
        event_type: "assigned",
        actor_name: "Carlos Mendes (Chefe de Gabinete)",
        note: "Atribuído a Ana Souza para contato com a CPFL e elaboração de ofício.",
        created_at: "2026-11-20T11:00:00Z",
      },
      {
        id: "evt-dem-3",
        demand_id: "dem-s2-01",
        event_type: "forwarded",
        actor_name: "Ana Souza (Assessora)",
        note: "Ofício #2026/041 protocolado na Secretaria de Serviços Públicos de Santos.",
        created_at: "2026-11-21T14:20:00Z",
      },
      {
        id: "evt-dem-4",
        demand_id: "dem-s2-01",
        event_type: "status_changed",
        actor_name: "Ana Souza (Assessora)",
        note: "Status alterado de 'Recebido' para 'Em Andamento'. Protocolo municipal #55412.",
        created_at: "2026-11-22T09:15:00Z",
      },
    ],
  },
  {
    id: "dem-202",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    protocol: "#AT-0840",
    citizen_id: "cit-102",
    citizen_name: "Carlos Alberto Silva",
    citizen_phone: "+55 13 99781-2233",
    preferred_channel: "email",
    title: "Reforma e acessibilidade na UBS Ponta da Praia",
    description: "Rampa de acesso com inclinação irregular para cadeirantes e falta de corrimão na entrada principal da UBS.",
    category: "saude",
    priority: "high",
    status: "waiting",
    classification: "public",
    neighborhood: "Ponta da Praia",
    location_text: "UBS Dr. Arthur Neiva - Praça Guadalajara",
    assigned_to: "usr-adv-rafael",
    assigned_name: "Rafael Lima",
    due_at: "2026-11-28T17:00:00Z",
    created_at: "2026-11-19T14:00:00Z",
    updated_at: "2026-11-21T16:00:00Z",
    events: [
      {
        id: "evt-dem-5",
        demand_id: "dem-202",
        event_type: "created",
        actor_name: "Rafael Lima",
        note: "Demanda recebida via canal de e-mail institucional.",
        created_at: "2026-11-19T14:00:00Z",
      },
      {
        id: "evt-dem-6",
        demand_id: "dem-202",
        event_type: "forwarded",
        actor_name: "Rafael Lima",
        note: "Indicação nº 812/2026 apresentada na Sessão da Câmara Municipal para a Secretaria de Saúde.",
        created_at: "2026-11-21T16:00:00Z",
      },
    ],
  },
  {
    id: "dem-203",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    protocol: "#AT-0839",
    citizen_id: "cit-103",
    citizen_name: "Dra. Helena Guimarães",
    citizen_phone: "+55 13 99712-3456",
    preferred_channel: "phone",
    title: "Manutenção de praça e brinquedos infantis no Gonzaga",
    description: "Balanços danificados e piso irregular no parquinho da Praça da Independência gerando risco a crianças.",
    category: "zeladoria",
    priority: "normal",
    status: "in_progress",
    classification: "public",
    neighborhood: "Gonzaga",
    location_text: "Praça da Independência - Gonzaga",
    assigned_to: "usr-adv-ana",
    assigned_name: "Ana Souza",
    due_at: "2026-11-25T18:00:00Z",
    created_at: "2026-11-18T10:15:00Z",
    updated_at: "2026-11-20T11:40:00Z",
    events: [
      {
        id: "evt-dem-7",
        demand_id: "dem-203",
        event_type: "created",
        actor_name: "Beatriz Rocha",
        note: "Atendimento telefônico com fotos recebidas posteriormente.",
        created_at: "2026-11-18T10:15:00Z",
      },
    ],
  },
  {
    id: "dem-204",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    protocol: "#AT-0838",
    citizen_id: "cit-105",
    citizen_name: "Maria de Fátima Ramos",
    citizen_phone: "+55 13 99234-5678",
    preferred_channel: "whatsapp",
    title: "Poda de árvores e recapeamento na Av. Ana Costa",
    description: "Galhos encostando na fiação de alta tensão e buraco na pista sentido praia.",
    category: "zeladoria",
    priority: "low",
    status: "resolved",
    classification: "public",
    neighborhood: "Gonzaga",
    location_text: "Av. Ana Costa, cruzamento com Rua Tolentino Filgueiras",
    assigned_to: "usr-att-beatriz",
    assigned_name: "Beatriz Rocha",
    due_at: "2026-11-19T18:00:00Z",
    created_at: "2026-11-15T09:00:00Z",
    updated_at: "2026-11-19T17:00:00Z",
    events: [
      {
        id: "evt-dem-8",
        demand_id: "dem-204",
        event_type: "closed",
        actor_name: "Beatriz Rocha",
        note: "Poda realizada pela CPFL e serviço de tapa-buraco executado pela Prodesan.",
        created_at: "2026-11-19T17:00:00Z",
      },
    ],
  },
  {
    id: "dem-205",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    protocol: "#AT-0837",
    citizen_id: "cit-104",
    citizen_name: "Marcos Vinícius Pires",
    citizen_phone: "+55 13 98123-4567",
    preferred_channel: "in_person",
    title: "Ronda ostensiva no entorno de escola estadual",
    description: "Munícipes solicitam reforço da Guarda Civil Municipal nos horários de entrada e saída da escola.",
    category: "seguranca",
    priority: "urgent",
    status: "waiting",
    classification: "public",
    neighborhood: "Zona Noroeste",
    location_text: "EE Deputado Donato Romano - Castelo",
    assigned_to: "usr-adm-carlos",
    assigned_name: "Carlos Mendes",
    due_at: "2026-11-23T12:00:00Z",
    created_at: "2026-11-17T11:20:00Z",
    updated_at: "2026-11-21T09:00:00Z",
    events: [],
  },
  {
    id: "dem-206",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    protocol: "#AT-0836",
    citizen_id: "cit-104",
    citizen_name: "Marcos Vinícius Pires",
    citizen_phone: "+55 13 98123-4567",
    preferred_channel: "in_person",
    title: "Sinalização e faixa de pedestres na Zona Noroeste",
    description: "Falta de pintura de solo e sinalização vertical em cruzamento com intenso tráfego escolar.",
    category: "transporte",
    priority: "normal",
    status: "received",
    classification: "public",
    neighborhood: "Zona Noroeste",
    location_text: "Av. Afonso Schmidt com Rua Particular",
    assigned_to: "usr-att-beatriz",
    assigned_name: "Beatriz Rocha",
    due_at: "2026-11-26T18:00:00Z",
    created_at: "2026-11-21T14:40:00Z",
    updated_at: "2026-11-21T14:40:00Z",
    events: [],
  },
  {
    id: "dem-207",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    protocol: "#AT-0835",
    citizen_id: "cit-101",
    citizen_name: "João Pereira da Silva",
    citizen_phone: "+55 11 98765-4321",
    preferred_channel: "whatsapp",
    title: "Desobstrução de galeria de águas pluviais",
    description: "Boca de lobo entupida com acúmulo de sedimentos causando alagamento na calçada do comércio em dias de chuva.",
    category: "saneamento",
    priority: "high",
    status: "in_progress",
    classification: "public",
    neighborhood: "Vila Mariana",
    location_text: "Rua Oswaldo Cruz, 180",
    assigned_to: "usr-adv-rafael",
    assigned_name: "Rafael Lima",
    due_at: "2026-11-24T12:00:00Z",
    created_at: "2026-11-16T15:00:00Z",
    updated_at: "2026-11-18T10:00:00Z",
    events: [],
  },
  {
    id: "dem-208",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    protocol: "#AT-0834",
    citizen_id: "cit-s2-01",
    citizen_name: "Dona Maria de Lourdes",
    citizen_phone: "+55 11 98877-6655",
    preferred_channel: "whatsapp",
    title: "Ampliação do atendimento odontológico no Centro",
    description: "Fila de espera para próteses e atendimento básico dental de idosos no Centro de Especialidades.",
    category: "saude",
    priority: "normal",
    status: "closed",
    classification: "public",
    neighborhood: "Gonzaga",
    location_text: "Policlínica do Centro Histórico",
    assigned_to: "usr-adv-ana",
    assigned_name: "Ana Souza",
    due_at: "2026-11-14T18:00:00Z",
    created_at: "2026-11-05T09:00:00Z",
    updated_at: "2026-11-14T16:30:00Z",
    events: [],
  },
];

// ============================================================================
// 3. AGENDA PARLAMENTAR DEMONSTRAÇÃO
// ============================================================================
export interface DemoAgendaEvent {
  id: string;
  organization_id: string;
  workspace_id: string;
  title: string;
  description?: string;
  starts_at: string;
  ends_at: string;
  location: string;
  event_type: AgendaEventType;
  visibility: "public" | "internal" | "confidential" | "private";
  status: AgendaStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const DEMO_AGENDA_EVENTS: DemoAgendaEvent[] = [
  {
    id: "evt-s2-01",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    title: "Atendimento presencial — Dona Maria de Lourdes",
    description: "Reunião no gabinete para tratar da demanda de iluminação da Rua das Flores e demandas comunitárias.",
    starts_at: "2026-11-23T10:30:00Z",
    ends_at: "2026-11-23T11:00:00Z",
    location: "Gabinete Parlamentar - Sala 3",
    event_type: "meeting",
    visibility: "private",
    status: "confirmed",
    created_by: "usr-adv-ana",
    created_at: "2026-11-20T11:15:00Z",
    updated_at: "2026-11-20T11:15:00Z",
  },
  {
    id: "evt-301",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    title: "Audiência Pública sobre Mobilidade Urbana",
    description: "Debate sobre integração do VLT com as linhas municipais de Santos e bilhetagem eletrônica metropolitana.",
    starts_at: "2026-11-23T14:00:00Z",
    ends_at: "2026-11-23T16:00:00Z",
    location: "Plenário da Câmara Municipal de Santos",
    event_type: "hearing",
    visibility: "public",
    status: "confirmed",
    created_by: "usr-adm-carlos",
    created_at: "2026-11-15T09:00:00Z",
    updated_at: "2026-11-15T09:00:00Z",
  },
  {
    id: "evt-302",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    title: "Reunião de Alinhamento da Equipe do Gabinete",
    description: "Alinhamento semanal com chefia, assessores jurídicos e de comunicação para pauta legislativa da semana.",
    starts_at: "2026-11-23T09:00:00Z",
    ends_at: "2026-11-23T09:45:00Z",
    location: "Gabinete da Vereadora Mariana Costa",
    event_type: "meeting",
    visibility: "internal",
    status: "confirmed",
    created_by: "mem-1",
    created_at: "2026-11-18T10:00:00Z",
    updated_at: "2026-11-18T10:00:00Z",
  },
  {
    id: "evt-303",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    title: "Visita Técnica e Fiscalização à UPA Zona Noroeste",
    description: "Inspeção in loco de medicamentos, tempo de espera na triagem e quadro de médicos plantonistas.",
    starts_at: "2026-11-24T10:00:00Z",
    ends_at: "2026-11-24T12:00:00Z",
    location: "UPA Zona Noroeste - Av. Jovino de Melo",
    event_type: "visit",
    visibility: "public",
    status: "scheduled",
    created_by: "usr-adv-rafael",
    created_at: "2026-11-19T14:30:00Z",
    updated_at: "2026-11-19T14:30:00Z",
  },
  {
    id: "evt-304",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    title: "Sessão Plenária Ordinária da Câmara Municipal",
    description: "Votação de projetos de lei, moções e requerimentos da ordem do dia.",
    starts_at: "2026-11-25T15:00:00Z",
    ends_at: "2026-11-25T18:00:00Z",
    location: "Plenário Dr. Oswaldo De Rosis",
    event_type: "session",
    visibility: "public",
    status: "scheduled",
    created_by: "usr-adm-carlos",
    created_at: "2026-11-10T11:00:00Z",
    updated_at: "2026-11-10T11:00:00Z",
  },
  {
    id: "evt-305",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    title: "Encontro com Lideranças Comunitárias do Embaré",
    description: "Roda de conversa com moradores sobre iluminação e segurança nas imediações da orla.",
    starts_at: "2026-11-26T19:00:00Z",
    ends_at: "2026-11-26T20:30:00Z",
    location: "Centro Comunitário do Embaré",
    event_type: "event",
    visibility: "public",
    status: "scheduled",
    created_by: "usr-adv-ana",
    created_at: "2026-11-18T16:00:00Z",
    updated_at: "2026-11-18T16:00:00Z",
  },
];

// ============================================================================
// 4. MEMBROS DA EQUIPE DEMONSTRAÇÃO (RBAC)
// ============================================================================
export interface DemoTeamMember {
  id: string;
  organization_id: string;
  name: string;
  role: "owner" | "admin" | "advisor" | "assistant" | "attendant" | "intern";
  role_title: string;
  email: string;
  phone: string;
  avatar_initials: string;
  status: "active" | "invited" | "suspended" | "revoked";
  active_demands: number;
  active_tasks: number;
  joined_at: string;
}

export const DEMO_TEAM_MEMBERS: DemoTeamMember[] = [
  {
    id: "mem-1",
    organization_id: DEMO_ORGANIZATION_ID,
    name: "Mariana Costa",
    role: "owner",
    role_title: "Vereadora Titular do Mandato",
    email: "mariana.costa@camarasantos.sp.gov.br",
    phone: "+55 13 99700-1122",
    avatar_initials: "MC",
    status: "active",
    active_demands: 0,
    active_tasks: 2,
    joined_at: "2025-01-01",
  },
  {
    id: "mem-2",
    organization_id: DEMO_ORGANIZATION_ID,
    name: "Carlos Mendes",
    role: "admin",
    role_title: "Chefe de Gabinete & Coordenação Geral",
    email: "carlos.mendes@gabinete360.com.br",
    phone: "+55 13 99711-2233",
    avatar_initials: "CM",
    status: "active",
    active_demands: 2,
    active_tasks: 4,
    joined_at: "2025-01-05",
  },
  {
    id: "usr-adv-ana",
    organization_id: DEMO_ORGANIZATION_ID,
    name: "Ana Souza",
    role: "advisor",
    role_title: "Assessora Parlamentar — Saúde & Políticas Sociais",
    email: "ana.souza@gabinete360.com.br",
    phone: "+55 13 99722-3344",
    avatar_initials: "AS",
    status: "active",
    active_demands: 3,
    active_tasks: 3,
    joined_at: "2025-02-01",
  },
  {
    id: "usr-adv-rafael",
    organization_id: DEMO_ORGANIZATION_ID,
    name: "Rafael Lima",
    role: "advisor",
    role_title: "Assessor Parlamentar — Infraestrutura & Legislação",
    email: "rafael.lima@gabinete360.com.br",
    phone: "+55 13 99733-4455",
    avatar_initials: "RL",
    status: "active",
    active_demands: 2,
    active_tasks: 2,
    joined_at: "2025-02-15",
  },
  {
    id: "usr-att-beatriz",
    organization_id: DEMO_ORGANIZATION_ID,
    name: "Beatriz Rocha",
    role: "attendant",
    role_title: "Atendente de Recepção & Triagem de Munícipes",
    email: "beatriz.rocha@gabinete360.com.br",
    phone: "+55 13 99744-5566",
    avatar_initials: "BR",
    status: "active",
    active_demands: 1,
    active_tasks: 3,
    joined_at: "2025-03-01",
  },
  {
    id: "mem-6",
    organization_id: DEMO_ORGANIZATION_ID,
    name: "Lucas Martins",
    role: "intern",
    role_title: "Estagiário de Comunicação & Atendimento",
    email: "lucas.martins@gabinete360.com.br",
    phone: "+55 13 99755-6677",
    avatar_initials: "LM",
    status: "active",
    active_demands: 0,
    active_tasks: 1,
    joined_at: "2026-06-01",
  },
];

// ============================================================================
// 5. TAREFAS DA EQUIPE DEMONSTRAÇÃO
// ============================================================================
export interface DemoTask {
  id: string;
  organization_id: string;
  workspace_id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "review" | "completed" | "cancelled";
  priority: "low" | "normal" | "medium" | "high" | "urgent";
  assigned_to: string;
  assigned_name: string;
  due_at: string;
  demand_id?: string | null;
  demand_protocol?: string | null;
  created_at: string;
  updated_at: string;
}

export const DEMO_TASKS: DemoTask[] = [
  {
    id: "tsk-401",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    title: "Elaborar minuta de resposta ao Ministério Público",
    description: "Minuta informativa sobre ações de fiscalização das creches municipais da Zona Noroeste.",
    status: "pending",
    priority: "urgent",
    assigned_to: "mem-2",
    assigned_name: "Carlos Mendes",
    due_at: "2026-11-23T18:00:00Z",
    created_at: "2026-11-20T10:00:00Z",
    updated_at: "2026-11-20T10:00:00Z",
  },
  {
    id: "tsk-402",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    title: "Encaminhar ofício à Secretaria sobre iluminação da Rua das Flores",
    description: "Cobrança formal com base na demanda #AT-0841 protocolada por munícipes.",
    status: "in_progress",
    priority: "urgent",
    assigned_to: "usr-adv-ana",
    assigned_name: "Ana Souza",
    due_at: "2026-11-23T12:00:00Z",
    demand_id: "dem-s2-01",
    demand_protocol: "#AT-0841",
    created_at: "2026-11-21T09:00:00Z",
    updated_at: "2026-11-22T08:30:00Z",
  },
  {
    id: "tsk-403",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    title: "Preparar relatório fotográfico da UBS Ponta da Praia",
    description: "Compilar evidências da fiscalização e falta de rampa adequada para instruir indicação legislativa.",
    status: "in_progress",
    priority: "high",
    assigned_to: "usr-adv-rafael",
    assigned_name: "Rafael Lima",
    due_at: "2026-11-24T17:00:00Z",
    demand_id: "dem-202",
    demand_protocol: "#AT-0840",
    created_at: "2026-11-20T14:00:00Z",
    updated_at: "2026-11-21T11:00:00Z",
  },
  {
    id: "tsk-404",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    title: "Realizar triagem das solicitações recebidas no WhatsApp",
    description: "Classificar as 18 mensagens pendentes e associar aos cadastros de munícipes existentes.",
    status: "completed",
    priority: "normal",
    assigned_to: "usr-att-beatriz",
    assigned_name: "Beatriz Rocha",
    due_at: "2026-11-22T17:00:00Z",
    created_at: "2026-11-22T08:00:00Z",
    updated_at: "2026-11-22T16:30:00Z",
  },
  {
    id: "tsk-405",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    title: "Revisar requerimento de informação sobre transporte escolar",
    description: "Checagem jurídica e adequação regimental para apresentação na sessão plenária de quarta-feira.",
    status: "review",
    priority: "normal",
    assigned_to: "mem-2",
    assigned_name: "Carlos Mendes",
    due_at: "2026-11-24T12:00:00Z",
    created_at: "2026-11-19T16:00:00Z",
    updated_at: "2026-11-22T10:00:00Z",
  },
  {
    id: "tsk-406",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    title: "Agendar retorno telefônico para munícipes com demandas resolvidas",
    description: "Informar conclusão dos serviços de poda na Av. Ana Costa e limpeza no Centro.",
    status: "pending",
    priority: "low",
    assigned_to: "usr-att-beatriz",
    assigned_name: "Beatriz Rocha",
    due_at: "2026-11-25T16:00:00Z",
    created_at: "2026-11-21T15:00:00Z",
    updated_at: "2026-11-21T15:00:00Z",
  },
  {
    id: "tsk-407",
    organization_id: DEMO_ORGANIZATION_ID,
    workspace_id: DEMO_WORKSPACE_ID,
    title: "Montar clipping de notícias e redes sociais da semana",
    description: "Resumo das menções ao mandato na imprensa local e redes institucionais.",
    status: "in_progress",
    priority: "low",
    assigned_to: "mem-6",
    assigned_name: "Lucas Martins",
    due_at: "2026-11-24T18:00:00Z",
    created_at: "2026-11-22T09:00:00Z",
    updated_at: "2026-11-22T14:00:00Z",
  },
];

// ============================================================================
// 6. ESTATÍSTICAS TERRITORIAIS DEMONSTRAÇÃO
// ============================================================================
export interface DemoTerritorialStat {
  neighborhood: string;
  count: number;
  percentage: number;
  highlightColor: string;
}

export const DEMO_TERRITORIAL_STATS: DemoTerritorialStat[] = [
  { neighborhood: "Ponta da Praia", count: 48, percentage: 34, highlightColor: "#176B52" },
  { neighborhood: "Gonzaga / Centro", count: 40, percentage: 28, highlightColor: "#557A98" },
  { neighborhood: "Zona Noroeste", count: 31, percentage: 22, highlightColor: "#C78C38" },
  { neighborhood: "Vila Mariana / Outros", count: 23, percentage: 16, highlightColor: "#BB5D51" },
];

// ============================================================================
// FUNÇÃO UTILITÁRIA DE PROTOCOLOS DEMO
// ============================================================================
let nextProtocolNumber = 842;
export function generateNextProtocol(): string {
  const code = String(nextProtocolNumber++).padStart(4, "0");
  return `#AT-${code}`;
}
