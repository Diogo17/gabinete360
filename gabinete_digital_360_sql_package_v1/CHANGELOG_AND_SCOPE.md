# Escopo e relação com o DER v2.0

Este pacote é a primeira materialização SQL do DER v2.0. Mantém a divisão:
- Control Plane: identidade e RBAC de administradores da DM IA Studio, tenants comerciais, planos, módulos, subscriptions, provisionamento, auditoria, incidentes, métricas agregadas e suporte JIT.
- Operational Plane: organizations, workspaces, departments, memberships e conteúdo do cliente.

## Ajustes deliberados

- As tabelas comerciais `subscriptions`, `modules`, `domains` e entitlements têm fonte de verdade no Control Plane.
- `organizations.platform_tenant_id` liga os dois planos por identificador externo, sem FK cross-project.
- Papéis e permissões do Master não são reutilizados no plano operacional.
- Logs administrativos e operacionais permanecem separados.
- Denúncias não entram no CRM comum e não são acessíveis por membership genérico.
- O pacote implementa fundação inicial, não os 20 módulos completos.
