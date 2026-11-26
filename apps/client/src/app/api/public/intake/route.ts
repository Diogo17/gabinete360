import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "../../../../lib/supabase/server";

const PublicIntakeSchema = z.object({
  organization_id: z.string().uuid("organization_id inválido."),
  citizen_name: z.string().trim().min(2, "Nome é obrigatório.").max(120),
  citizen_phone: z.string().trim().max(30).optional(),
  neighborhood: z.string().trim().max(120).optional(),
  category: z.string().trim().max(60).optional(),
  title: z.string().trim().min(3, "Assunto é obrigatório.").max(200),
  description: z.string().trim().min(5, "Descrição é obrigatória.").max(4000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PublicIntakeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      organization_id,
      neighborhood,
      category,
      title,
      description,
    } = parsed.data;

    const supabase = await createClient();
    const protocol = `#AT-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await supabase
      .from("demands")
      .insert({
        organization_id,
        title,
        description,
        neighborhood: neighborhood || "Não informado",
        category_key: category || "outros",
        priority: "medium",
        status: "received",
        preferred_channel: "portal",
        protocol,
      })
      .select("id, protocol")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      protocol: data?.protocol || protocol,
      id: data?.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro ao registrar solicitação pública." },
      { status: 500 }
    );
  }
}
