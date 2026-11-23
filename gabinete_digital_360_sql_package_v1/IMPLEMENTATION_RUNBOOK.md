# Runbook de validação local (sem produção)

## Pré-requisitos

- Dois projetos locais Supabase independentes: um para `control_plane`, outro para `operational_plane`.
- Supabase CLI instalada e versão registrada.
- Docker ou runtime local compatível.
- Repositório Git com migrations e testes versionados.
- Nenhuma chave/URL de produção nos arquivos `.env` locais.

## Passos

1. Criar um diretório/repositório separado para cada plano.
2. Inicializar cada projeto com `supabase init`.
3. Conferir a versão instalada com `supabase --version`.
4. Conferir a sintaxe disponível com `supabase migration --help`, `supabase test --help` e `supabase start --help`.
5. Criar a migration com `supabase migration new control_plane_foundation` e copiar o conteúdo do arquivo correspondente para o arquivo gerado pela CLI. Repetir para `operational_plane_foundation` no outro projeto.
6. Iniciar o stack local com `supabase start`.
7. Aplicar migrations somente no banco local usando o fluxo local da CLI.
8. Copiar os testes para `supabase/tests/` em cada projeto.
9. Executar `supabase test db` localmente.
10. Executar testes comportamentais com usuários Auth de teste e fixtures para dois tenants.
11. Executar os cenários backend para autorização Master, MFA, JIT, idempotência e acesso entre projetos.
12. Revisar SQL, grants, policies, funções, views, Storage e logs.
13. Rodar Security/Performance/Health Advisors e resolver findings relevantes.
14. Registrar resultados, versões, commit e evidências de teste.

## Aviso CLI v3 (22/11/2026)

A CLI v3 usa o stack local como destino padrão para comandos de banco. Para qualquer operação remota, a CLI exige `--remote` e confirmação explícita; em CI também pode exigir `--yes`. Este runbook não inclui comandos remotos intencionalmente.

## Não fazer

- Não usar `service_role` no browser.
- Não apontar o ambiente local para projeto de produção.
- Não aplicar migrations em projeto remoto durante a fase de teste.
- Não usar dados reais de cidadãos ou denúncias em fixtures.
- Não tratar um teste estrutural de RLS como prova suficiente de isolamento comportamental.
- Não conceder acesso Master direto ao banco operacional.
