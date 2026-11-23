# Gabinete Digital 360° — Pacote SQL v1 (pré-implementação)

**Versão:** 1.0  
**Base:** DER v2.0 — Painel Master / Control Plane  
**Status:** pacote inicial de referência para revisão e testes locais.  
**Não aplicado:** nenhum projeto Supabase foi conectado, alterado ou migrado.

## 1. Objetivo e limites

Este pacote materializa a fundação de dois projetos Supabase independentes:

- `control_plane`: administração da DM IA Studio, clientes SaaS, planos, módulos, provisionamento, auditoria e suporte temporário.
- `operational_plane`: dados dos gabinetes/Câmaras, memberships e conteúdo operacional multi-tenant.

Não existe FK entre projetos. `platform_tenant_id` é um identificador externo opaco, sincronizado por API backend autenticada, com idempotência e assinatura. O Control Plane não consulta diretamente conteúdo operacional.

## 2. Conteúdo

- `control_plane/migrations/001_control_plane_foundation.sql`: tabelas centrais do Painel Master.
- `operational_plane/migrations/001_operational_foundation.sql`: núcleo multi-tenant e exemplos iniciais de demandas e denúncias segregadas.
- `tests/control_plane/001_control_plane_security_test.sql`: testes estruturais de RLS e grants.
- `tests/operational_plane/001_operational_security_structure_test.sql`: testes estruturais de RLS, FKs e índices.
- `tests/operational_plane/002_rls_behavior_test_template.sql`: roteiro pgTAP para teste comportamental com usuários de teste provisionados no Auth local.
- `TEST_MATRIX.md`: matriz de cenários positivos e negativos obrigatórios.
- `IMPLEMENTATION_RUNBOOK.md`: sequência segura de validação local.

## 3. Decisões de segurança incorporadas

1. RLS habilitado em todas as tabelas criadas neste pacote.
2. No Control Plane, `anon` e `authenticated` não recebem acesso direto às tabelas. O backend privado valida identidade Master, MFA, papel, permissão, escopo e motivo; só então executa a operação administrativa com credencial privilegiada mantida exclusivamente no servidor.
3. No Plano Operacional, as tabelas de tenant têm políticas específicas iniciais. A fundação não representa todas as permissões funcionais do produto.
4. Denúncias e concessões de acesso a denúncias ficam segregadas. Não há leitura ampla por membership simples.
5. O portal público não recebe INSERT direto nas tabelas. Intake público será feito por endpoint server-side com validação, rate limit, CAPTCHA/antibot quando aplicável, idempotência e minimização de dados.
6. Não há `is_master`, `super_admin` ou papel da DM IA Studio no banco operacional.
7. `service_role`/secret key nunca vai para navegador, app móvel, repositório ou variável `NEXT_PUBLIC_`.
8. Logs não devem conter tokens, senhas, segredos, conteúdo integral de denúncia ou payloads pessoais desnecessários.

## 4. O que ainda não está coberto

Este é o primeiro corte SQL, não o banco integral de todos os 20 módulos. Antes de produção ainda serão necessárias migrations específicas para CRM completo, anexos/Storage, mensagens e WhatsApp, legislativo, agenda, tarefas, retenção, privacidade, integrações, billing, domínio personalizado, filas, observabilidade e políticas granulares por permissão/workspace/departamento.

O schema de denúncias aqui é deliberadamente mínimo e restritivo. A política definitiva depende da definição de papéis de triagem, apuração, corregedoria/controle e regras legais de cada órgão.

## 5. Como usar

Não executar em projeto remoto. Primeiro criar dois projetos locais independentes com Supabase CLI, revisar os SQL, ajustar a configuração de schemas e executar os testes locais. Ver `IMPLEMENTATION_RUNBOOK.md`.

A CLI Supabase v3 mudou os padrões de destino: comandos de banco usam o stack local por padrão; operações remotas exigem `--remote` e confirmação. O runbook evita comandos remotos.
