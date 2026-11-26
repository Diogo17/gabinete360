import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const MeetingSchema = z.object({
  title: z.string().trim().min(3).max(200),
  notes: z.string().trim().min(10).max(12000),
});

/**
 * Meeting Assistant: gera resumo, decisões e ata preliminar a partir das notas da reunião.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { data: membership } = await supabase
      .from("memberships")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = MeetingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parâmetros inválidos.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, notes } = parsed.data;
    const apiKey = process.env.GEMINI_API_KEY;
    let draftMinutes = `Ata Preliminar — ${title}\n\nResumo:\n${notes.slice(0, 500)}`;

    if (apiKey) {
      const aiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: "Você é o Meeting Assistant do Gabinete Digital 360°. Gere uma ata preliminar objetiva com: 1) Resumo, 2) Decisões, 3) Próximos passos e responsáveis.",
                },
              ],
            },
            contents: [{ role: "user", parts: [{ text: `Título: ${title}\n\nNotas:\n${notes}` }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 900 },
          }),
        }
      );

      if (aiRes.ok) {
        const aiJson = await aiRes.json();
        draftMinutes = aiJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? draftMinutes;
      }
    }

    return NextResponse.json({
      success: true,
      organizationId: membership.organization_id,
      title,
      draftMinutes,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro ao processar Meeting Assistant." },
      { status: 500 }
    );
  }
}
