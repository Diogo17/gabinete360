/**
 * Gera visualização oficial pronta para impressão / salvar como PDF
 * respeitando a identidade institucional do mandato.
 */
export function openOfficialDocumentPrintView(params: {
  title: string;
  number: string;
  kindLabel: string;
  content: string;
  legislatorName: string;
  institutionName: string;
  logoUrl?: string | null;
}) {
  if (typeof window === "undefined") return;

  const win = window.open("", "_blank", "width=850,height=950");
  if (!win) return;

  const logoHtml = params.logoUrl
    ? `<img src="${params.logoUrl}" alt="Brasão" style="height:64px;object-fit:contain;margin-bottom:8px;" />`
    : "";

  win.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>${params.kindLabel} ${params.number}</title>
        <style>
          body { font-family: Georgia, serif; margin: 48px; color: #172B27; line-height: 1.6; }
          header { text-align: center; border-bottom: 2px solid #176B52; padding-bottom: 16px; margin-bottom: 32px; }
          h1 { font-size: 18px; margin: 4px 0; text-transform: uppercase; }
          h2 { font-size: 15px; margin: 16px 0 8px; }
          .meta { font-size: 12px; color: #555; }
          .content { white-space: pre-wrap; font-size: 14px; text-align: justify; }
          footer { margin-top: 64px; text-align: center; font-size: 13px; }
          .sig-line { border-top: 1px solid #172B27; width: 280px; margin: 40px auto 6px; }
        </style>
      </head>
      <body>
        <header>
          ${logoHtml}
          <h1>${params.institutionName}</h1>
          <div class="meta">Gabinete Parlamentar · ${params.legislatorName}</div>
        </header>
        <h2>${params.kindLabel} nº ${params.number}</h2>
        <p><strong>Assunto:</strong> ${params.title}</p>
        <div class="content">${params.content}</div>
        <footer>
          <div class="sig-line"></div>
          <div><strong>${params.legislatorName}</strong></div>
          <div class="meta">Documento gerado via Gabinete Digital 360°</div>
        </footer>
        <script>window.onload = () => window.print();</script>
      </body>
    </html>
  `);
  win.document.close();
}
