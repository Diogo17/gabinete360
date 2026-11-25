import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada no ambiente." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { action, content, context } = body as {
      action: "triage" | "draft_legislative" | "daily_summary";
      content: string;
      context?: string;
    };

    if (!content || !action) {
      return NextResponse.json(
        { error: "Parâmetros 'action' e 'content' são obrigatórios." },
        { status: 400 }
      );
    }

    const systemPrompts: Record<string, string> = {
      triage:
        "Você é um assistente de triagem de um gabinete parlamentar brasileiro. Classifique a demanda em: Categoria (iluminacao, saude, educacao, zeladoria, seguranca, saneamento, transporte, outros), Urgência (low, normal, high, urgent) e sugira o próximo passo objetivo em português.",
      draft_legislative:
        "Você é um assessor legislativo sênior. Redija uma minuta formal de Indicação ou Ofício municipal em português do Brasil, com linguagem institucional, clara e respeitosa, pronta para revisão humana.",
      daily_summary:
        "Você é um chefe de gabinete digital. Resuma as prioridades do dia de forma objetiva em 3 a 5 tópicos acionáveis em português.",
    };

    const promptText = `${systemPrompts[action] || systemPrompts.triage}\n\nContexto adicional: ${context || "Nenhum"}\n\nSolicitação:\n${content}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Erro na API Gemini: ${response.status}`, details: errText },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Não foi possível gerar uma resposta.";

    return NextResponse.json({ success: true, result: text });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro interno ao processar solicitação de IA." },
      { status: 500 }
    );
  }
}
