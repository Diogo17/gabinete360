# Scripts de Desenvolvimento e Demonstração (NÃO EXECUTAR EM PRODUÇÃO)

Esta pasta contém scripts SQL históricos de piloto, demonstração e reset global.
**ATENÇÃO:** Nunca execute estes scripts no banco de produção do Gabinete Digital 360°, pois eles contêm dados fictícios ou comandos destrutivos (`TRUNCATE` / `DELETE` em `auth.users`) que podem apagar os dados oficiais do **Vereador Bill do Barreiro (Januária-MG)**.

Para a base oficial autorizada, utilize apenas `supabase/SEED_VEREADOR_BILL_JANUARIA.sql`.
