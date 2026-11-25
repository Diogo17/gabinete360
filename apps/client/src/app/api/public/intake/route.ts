import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      organization_id,
      citizen_name,
      citizen_phone,
      neighborhood,
      category,
      title,
      description,
    } = body;

    if (!title || !description || !citizen_name) {
      return NextResponse.json(
        { error: "Nome, assunto e descrição são obrigatórios." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const protocol = `#AT-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await supabase
      .from("demands")
      .insert({
        organization_id: organization_id || "a0000000-0000-0000-0000-000000000001",
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
