# GUIA PASSO A PASSO DE CONFIGURAÇÃO MANUAL
## Subida do Banco de Dados no Supabase e Homologação de Produção
**Projeto Supabase:** `https://supabase.com/dashboard/project/efughosfkbirbjaqwyya`  
**Referência do Projeto:** `efughosfkbirbjaqwyya`

---

### PASSO 1: Criar as Tabelas no Supabase (SQL Editor)

1. Acesse o console do seu projeto no Supabase:
   👉 **`https://supabase.com/dashboard/project/efughosfkbirbjaqwyya/sql`**
2. Clique no botão **"New query"** (Nova Consulta).
3. Abra o arquivo local:
   👉 `supabase/MIGRATION_UNIFICADA_OPERACIONAL.sql`
   (ou copie todo o conteúdo dele).
4. Cole o script completo no editor SQL do Supabase.
5. Clique no botão verde **"Run"** (ou pressione `Ctrl + Enter`).
6. **Resultado esperado:** O Supabase exibirá `Success. No rows returned`.
   Isso criará automaticamente:
   - Extensões `pgcrypto` e `citext`.
   - Tabelas de fundação: `organizations`, `workspaces`, `departments`, `memberships`.
   - Tabelas de negócio: `profiles`, `citizens`, `demands`, `demand_categories`, `demand_assignments`, `demand_events`, `demand_attachments`.
   - Módulos complementares: `agenda_events`, `legislative_items`, `inspection_cases`, `popular_participation`, `tasks`, `task_assignments`, `reports`.
   - Triggers de integridade e Políticas de Segurança Row Level Security (RLS) que blindam os dados entre gabinetes diferentes.

---

### PASSO 2: Inserir a Carga Inicial de Teste (Seed Piloto)

Para que o gabinete da Mariana Costa já inicie com estrutura pronta:
1. No mesmo **SQL Editor** do Supabase, clique em **"New query"**.
2. Abra o arquivo:
   👉 `supabase/SEED_INICIAL_PILOTO.sql`
3. Cole o conteúdo no editor e clique em **"Run"**.
4. **Resultado esperado:** Inserção do Gabinete Mariana Costa, do Workspace principal, dos 4 departamentos (Chefia, Jurídico, Atendimento, Comunicação) e das 5 categorias padrão de demandas cidadãs com seus respectivos SLAs.

---

### PASSO 3: Configurar Autenticação e Desativar Confirmação Obrigatória de E-mail

Para permitir que você e sua equipe façam login imediatamente com e-mails institucionais sem depender de servidor SMTP:

1. No menu lateral esquerdo do Supabase, clique em **"Authentication"** (ícone de cadeado/escudo).
2. Clique na aba **"Providers"** (Provedores) e selecione **"Email"**.
3. Localize a opção:
   - **Confirm email** (Confirmar e-mail) ➡️ **DESATIVE** (toggle para desligado).
   - *(Opcional)* Se desejar permitir login por OTP / Magic link, certifique-se de que o provedor Email está ativo.
4. Clique em **"Save"** no final da página.

---

### PASSO 4: Criar o Primeiro Usuário Institucional Real

Ainda na seção **"Authentication"**:
1. Clique na aba **"Users"** (no topo).
2. Clique no botão **"Add user"** ➡️ **"Create user"**.
3. Preencha:
   - **Email:** `mariana.costa@santos.sp.leg.br`
   - **Password:** Defina uma senha forte (ex: `Gabinete@2026` ou a senha de sua preferência).
   - Marque a opção: **"Auto Confirm User?"** ➡️ **SIM (Marcado)**.
4. Clique em **"Create user"**.
5. Copie o **User UID** gerado (um código no formato `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

---

### PASSO 5: Vincular o Usuário Criado à Organização no Banco

Para que o RLS reconheça o usuário autenticado como Parlamentar do Gabinete:
1. Volte ao **SQL Editor** (`/sql`).
2. Execute o seguinte comando, substituindo `'SEU_USER_UID_AQUI'` pelo UID copiado no Passo 4:

\`\`\`sql
-- Vincula o usuário autenticado como Parlamentar Titular do Gabinete Mariana Costa
insert into public.memberships (
  organization_id,
  user_id,
  role,
  status
) values (
  'a0000000-0000-0000-0000-000000000001',
  'SEU_USER_UID_AQUI', -- Cole o UID do usuário criado no Auth aqui
  'parliamentarian',
  'active'
) on conflict do nothing;

-- Cria o perfil público do usuário
insert into public.profiles (
  id,
  full_name,
  institutional_role
) values (
  'SEU_USER_UID_AQUI', -- Cole o mesmo UID aqui
  'Mariana Costa',
  'Vereadora Titular'
) on conflict (id) do nothing;
\`\`\`
3. Clique em **"Run"**.

---

### PASSO 6: (Opcional) Subir o Control Plane (Painel Master)

Caso deseje que o Painel Master (`/master`) também persista clientes e planos na mesma instância:
1. Abra `supabase/control-plane/migrations/001_control_plane_foundation.sql`.
2. Cole no SQL Editor do Supabase e clique em **"Run"**.
3. Isso criará o catálogo de planos, módulos, monitoramento e provisionamento de novos gabinetes.
