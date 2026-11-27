import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const CaptionSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório.").max(200),
  details: z.string().trim().min(1, "Detalhes são obrigatórios.").max(5000),
  category: z.enum(["projeto_lei", "indicacao", "fiscalizacao", "agenda", "comunidade", "conquista"]).default("projeto_lei"),
  tone: z.enum(["oficial", "popular", "urgente", "comemorativo"]).default("popular"),
  parliamentaryName: z.string().trim().max(100).optional(),
  municipality: z.string().trim().max(100).optional(),
});

const PRIMARY_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const MODEL_CANDIDATES = Array.from(
  new Set([
    PRIMARY_GEMINI_MODEL,
    "gemini-2.5-flash",
    "gemini-1.5-flash",
  ])
);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login para usar o assistente de IA." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = CaptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parâmetros inválidos.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, details, category, tone, parliamentaryName, municipality } = parsed.data;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: true,
          mock: true,
          data: {
            instagram: `🏛️ TRABALHO POR ${municipality?.toUpperCase() || "NOSSA CIDADE"}!\n\n${title}\n\n${details}\n\n💬 O que você achou dessa iniciativa? Deixe sua opinião nos comentários!\n\n#MandatoAtivo #Gabinete360 #${municipality?.replace(/\s+/g, "") || "Trabalho"}`,
            whatsapp: `*Informativo Parlamentar - ${parliamentaryName || "Gabinete"}*\n\n📌 *${title}*\n\n${details}\n\n_Acompanhe nossas ações pelo portal oficial!_`,
            twitter: `Mais uma ação pelo município de ${municipality || "nossa cidade"}: ${title}. O mandato segue prestando contas com transparência e compromisso! #Gabinete360`,
          },
        },
        { status: 200 }
      );
    }

    const systemPrompt = `Você é o estrategista chefe de comunicação e marketing digital do parlamentar ${parliamentaryName || "Vereador"} em ${municipality || "nosso município"}.
Sua missão é redigir 3 formatos de legenda de alto engajamento a partir da ação parlamentar informada.
Retorne OBRIGATORIAMENTE um JSON válido (sem crases de markdown) com exatamente estes campos:
{
  "instagram": "Texto para Instagram/Facebook com gancho de atenção, corpo claro, emojis estratégicos, CTA comunitária convidando para comentar e 5 hashtags relevantes.",
  "whatsapp": "Texto formatado com negrito (*texto*) e itálico (_texto_) otimizado para listas de transmissão e mensagens aos cidadãos.",
  "twitter": "Texto dinâmico, conciso (máximo 280 caracteres), direto ao ponto com hashtags estratégicas."
}`;

    const userPrompt = `Título: ${title}\nCategoria: ${category}\nTom: ${tone}\nDetalhes da Ação:\n${details}`;

    let response: Response | null = null;
    for (const candidateModel of MODEL_CANDIDATES) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${candidateModel}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 1024,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.ok) {
        break;
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        {
          success: true,
          mock: true,
          data: {
            instagram: `🏛️ TRABALHO POR ${municipality?.toUpperCase() || "NOSSA CIDADE"}!\n\n${title}\n\n${details}\n\n💬 O que você achou dessa iniciativa? Deixe sua opinião nos comentários!\n\n#MandatoAtivo #Gabinete360 #${municipality?.replace(/\s+/g, "") || "Trabalho"}`,
            whatsapp: `*Informativo Parlamentar - ${parliamentaryName || "Gabinete"}*\n\n📌 *${title}*\n\n${details}\n\n_Acompanhe nossas ações pelo portal oficial!_`,
            twitter: `Mais uma ação pelo município de ${municipality || "nossa cidade"}: ${title}. O mandato segue prestando contas com transparência e compromisso! #Gabinete360`,
          },
        },
        { status: 200 }
      );
    }

    const result = await response.json();
    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    let output;
    try {
      output = JSON.parse(rawText);
    } catch {
      output = { raw: rawText };
    }

    return NextResponse.json({
      success: true,
      data: output,
    });
  } catch (error) {
    console.error("Erro na rota de legendas com IA:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar legendas.", details: String(error) },
      { status: 500 }
    );
  }
}
