# Estratégia de Backup e Rollback — Gabinete Digital 360° (Fase 7)

## 1. Backup do Código (Git)
Todas as alterações de código da limpeza estão rastreadas no Git. Para criar um ponto de restauração antes de prosseguir para o banco remoto:

```powershell
git add -A
git commit -m "chore(cleanup): remove mocks, demo badges, pilot fallback and segregate dev seeds"
git tag pre-db-cleanup-2026-11-26
```

**Rollback do Código:**
```powershell
git reset --hard pre-db-cleanup-2026-11-26
```

---

## 2. Backup do Banco de Dados (Supabase Remoto)

Antes de executar qualquer `DELETE` no Supabase remoto:

### Opção A — Via Supabase Dashboard (Recomendado)
1. Acesse **Project Settings > Database > Backups** no painel do Supabase.
2. Gere/verifique um **Manual Backup** ou **Point-in-Time Recovery (PITR)** com timestamp registrado.

### Opção B — Via Supabase CLI (`pg_dump`)
```powershell
supabase db dump -f backup_gabinete360_pre_cleanup.sql
```

---

## 3. Verificação Pré-Limpeza dos Dados Oficiais (Bill do Barreiro)

Execute esta consulta **somente leitura** no SQL Editor do Supabase antes de qualquer exclusão para confirmar os registros que **devem ser preservados**:

```sql
-- 1. Organização Oficial
SELECT id, name, slug, status FROM public.organizations
WHERE id = '11111111-1111-4111-8111-111111110001' OR slug = 'bill-barreiro-januaria';

-- 2. Usuário Oficial
SELECT id, email, created_at FROM auth.users
WHERE id = 'e48c69ce-c99d-40f0-875f-13735a5fc235' OR email = 'bill.barreiro@gabinete360.app';

-- 3. Itens Legislativos Oficiais
SELECT count(*) AS total_itens_bill FROM public.legislative_items
WHERE organization_id = '11111111-1111-4111-8111-111111110001';
```

---

## 4. Rollback do Banco de Dados
Caso seja necessário restaurar o banco após a limpeza:
1. **Via Dashboard:** Restaurar o snapshot criado no passo 2.
2. **Via CLI:**
   ```powershell
   psql "$DATABASE_URL" -f backup_gabinete360_pre_cleanup.sql
   ```
3. **Reaplicação da Base Oficial:** Caso apenas os dados do Bill do Barreiro precisem ser restaurados, executar `supabase/SEED_VEREADOR_BILL_JANUARIA.sql`.
