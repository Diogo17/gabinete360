# 🏛️ Gabinete Digital 360° by DM IA Studio

> Plataforma integrada de gestão parlamentar, atendimento cidadão, transparência, fiscalização e inteligência assistiva para mandatos de vereadores e Câmaras Municipais.

---

## 🏗️ Arquitetura do Sistema (Dois Planos Independentes)

O Gabinete Digital 360° foi construído sobre uma arquitetura estrita de **dois planos isolados**, garantindo que dados institucionais, contratos e configurações globais nunca se misturem com a privacidade e o banco operacional dos gabinetes parlamentares.

```
gabinete-360/
├── apps/
│   ├── master/                # Control Plane UI (DM IA Studio — Porta 3001)
│   └── client/                # Operational Plane UI (Gabinetes & Câmaras — Porta 3000)
├── packages/
│   ├── ui/                    # Design System institucional compartilhado (sem auth)
│   ├── types/                 # Contratos TypeScript compartilhados
│   └── config/                # Configurações de Tailwind, ESLint e TypeScript
├── supabase/
│   ├── control-plane/         # Migrations e segurança do Control Plane (26 tabelas)
│   └── operational-plane/     # Migrations, RLS e chaves compostas do Operational Plane
└── tests/
    └── e2e/                   # 102 testes E2E com 620 assertivas (Tiers 1 a 4)
```

---

## 🚀 Módulos Implementados

### A. Control Plane — Painel Master (`apps/master` · Porta 3001)
Ambiente exclusivo da **DM IA Studio** para governança técnica e comercial da plataforma:
1. **Dashboard Geral**: Indicadores consolidados, gabinetes ativos, Câmaras, saúde dos serviços e incidentes.
2. **Gestão de Clientes**: Cadastro, edição, ativação/suspensão e histórico administrativo.
3. **Gestão de Organizações**: Hierarquia de Gabinetes Individuais e Câmaras Municipais.
4. **Gestão de Planos & Módulos**: Catálogo comercial, limites operacionais e ativação/desativação de módulos por tenant.
5. **Gestão de Administradores**: Perfis de acesso, permissões e política de MFA (TOTP) obrigatório.
6. **Provisionamento de Ambientes**: Stepper visual de criação de workspaces e histórico de jobs.
7. **Monitoramento & Saúde**: Latência dos serviços, uptime e alertas técnicos.
8. **Auditoria Administrativa**: Trilha imutável de ações executadas pelos administradores da plataforma.
9. **Suporte com Acesso JIT**: Concessão temporária de acesso com escopo definido, prazo de expiração e justificativa obrigatória.

---

### B. Operational Plane — Painel do Cliente (`apps/client` · Porta 3000)
Ambiente de trabalho diário dos vereadores, assessores e equipes de atendimento:
1. **Dashboard Parlamentar**: Resumo de atendimentos, compromissos do dia, prazos urgentes e métricas territoriais.
2. **Atendimentos & Demandas**: CRM de demandas com protocolo auditável (`#AT-0248`), status, prioridade, responsável e histórico.
3. **CRM de Cidadãos**: Cadastro comunitário, tags de lideranças, canais preferenciais (WhatsApp) e histórico de solicitações.
4. **Agenda Parlamentar**: Gestão de sessões plenárias, visitas comunitárias, audiências e reuniões internas.
5. **Tarefas da Equipe**: Distribuição de tarefas, controle de prazos e acompanhamento de ofícios.
6. **Equipe do Mandato**: Controle de membros com papéis de acesso RBAC (`owner`, `admin`, `advisor`).
7. **Gestão Legislativa**: Acompanhamento de Projetos de Lei (PL), Requerimentos, Indicações, Moções e Emendas.
8. **Fiscalização Parlamentar**: Registro de visitas fiscalizatórias a obras, postos de saúde, achados e providências.
9. **Participação Popular**: Ideias da comunidade, consultas públicas e propostas comunitárias convertíveis em PL.
10. **Canal Restrito de Denúncias**: Domínio seguro isolado, com acesso condicionado a justificativa formalizada e auditoria (LGPD).
11. **WhatsApp Inbox Integrado**: Caixa de entrada unificada de atendimento ao munícipe com conversão em protocolo.
12. **Inteligência Artificial Assistiva**: Triagem de mensagens, classificação de urgência, resumos e minutas de respostas com supervisão humana.

---

## 🎨 Identidade Visual (Design System)

Baseada no protótipo original aprovado, priorizando sobriedade institucional, contraste acessível (WCAG AA) e leitura rápida:
- **Cor Primária**: Verde Profundo Institucional (`#176B52`)
- **Fundo**: Cinza-esverdeado suave (`#F6F8F5`)
- **Superfície**: Branco (`#FFFFFF`) com bordas sutis (`#E8EEEA`)
- **Tipografia**: **Manrope** (títulos e indicadores) + **DM Sans** (interface e leitura)
- **Marca d'água**: Identificação clara de dados fictícios em ambiente de demonstração.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: Next.js 15 (App Router, React Server Components)
- **Linguagem**: TypeScript 5 (Strict Mode)
- **Estilização**: Tailwind CSS 4 + `@gabinete360/ui`
- **Validação de Formulários**: Zod + React Hook Form
- **Ícones**: Lucide React
- **Banco de Dados**: Supabase (PostgreSQL com RLS e chaves compostas)
- **Autenticação**: Supabase Auth com MFA TOTP para o plano Master
- **Build / Monorepo**: Turborepo + pnpm workspaces

---

## ⚙️ Configuração e Execução Local

### 1. Pré-requisitos
- Node.js 20+
- pnpm instalado globalmente (`npm install -g pnpm`)

### 2. Instalação das dependências
```bash
pnpm install
```

### 3. Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env.local` na raiz e dentro de cada app (`apps/master` e `apps/client`):

```bash
cp .env.example .env.local
```

Configurações necessárias:
```env
NEXT_PUBLIC_SUPABASE_URL=https://efughosfkbirbjaqwyya.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ftto26963Xzb_0loxD0p2w_9PPeleUz
GEMINI_API_KEY=sua_chave_aqui
```

### 4. Executar os Projetos em Desenvolvimento
```bash
# Executa todos os apps simultaneamente via Turborepo
pnpm dev

# Ou individualmente:
pnpm --filter @gabinete360/client dev   # Porta 3000
pnpm --filter @gabinete360/master dev   # Porta 3001
```

### 5. Compilação de Produção (Build)
```bash
pnpm build
```

---

## ☁️ Deploy na Vercel

O projeto foi desenhado para deploy em **dois projetos independentes na Vercel**:
1. **Projeto 1 (Painel Master)**: Root Directory configurado como `apps/master`. Domínio sugerido: `master.gabinete360.com.br`
2. **Projeto 2 (Painel do Cliente)**: Root Directory configurado como `apps/client`. Domínio sugerido: `app.gabinete360.com.br`

---

## 🔒 Segurança e Privacidade (LGPD)

1. **Zero Segredos no Frontend**: As chaves `service_role` nunca são expostas aos navegadores. Apenas a publishable key é pública.
2. **Isolamento Multi-tenant**: Todas as tabelas operacionais utilizam chaves compostas `(organization_id, id)` e políticas estritas de Row Level Security (RLS).
3. **Supervisão de IA**: A IA assistiva sugere minutas e triagens, mas **nunca toma decisões oficiais, arquiva denúncias ou publica atos sem intervenção humana**.

---

**DM IA Studio** · Desenvolvimento de Soluções Inteligentes para a Gestão Pública.
