import Link from "next/link";

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-ink">
      <div className="mb-8 flex items-center justify-between border-b border-line pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Governança e Transparência
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-ink">
            Política de Privacidade e Proteção de Dados (LGPD)
          </h1>
        </div>
        <Link
          href="/portal"
          className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink hover:bg-paper"
        >
          Voltar ao Portal
        </Link>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-ink/90">
        <section>
          <h2 className="font-heading text-base font-semibold text-ink">
            1. Finalidade e Base Legal (Lei nº 13.709/2018)
          </h2>
          <p className="mt-2 text-muted">
            Os dados pessoais coletados pelo Gabinete Digital 360° têm como finalidade exclusiva o
            atendimento ao cidadão, o registro e acompanhamento de demandas comunitárias, a
            participação popular e o exercício regular das atribuições parlamentares e de
            fiscalização, em conformidade com a Lei Geral de Proteção de Dados (LGPD) e o Marco
            Civil da Internet (Lei nº 12.965/2014).
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-ink">
            2. Dados Coletados e Minimização
          </h2>
          <p className="mt-2 text-muted">
            São solicitados apenas os dados estritamente necessários para identificação do
            atendimento e retorno ao cidadão (como nome, telefone/WhatsApp, bairro e descrição da
            solicitação). Denúncias anônimas não vinculam dados pessoais de identificação ao
            registro sigiloso.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-ink">
            3. Segurança, Isolamento e Retenção
          </h2>
          <p className="mt-2 text-muted">
            As informações são armazenadas em ambiente com isolamento multi-tenant (Row Level
            Security), controle de acesso por perfil e trilha de auditoria. Os dados são mantidos
            pelo período necessário ao cumprimento da finalidade pública e obrigações legais de
            registro administrativo.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-base font-semibold text-ink">
            4. Direitos do Titular (Art. 18 da LGPD)
          </h2>
          <p className="mt-2 text-muted">
            O titular dos dados pode solicitar a confirmação da existência de tratamento, o acesso,
            a correção de dados incompletos ou desatualizados, bem como a anonimização ou eliminação
            quando aplicável, diretamente pelos canais oficiais de atendimento do gabinete
            controlador.
          </p>
        </section>
      </div>
    </main>
  );
}
