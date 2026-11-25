import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { whatsappClient } from "@/lib/whatsapp/client";

const SendMessageSchema = z.object({
  instanceName: z.string().min(1),
  instanceToken: z.string().min(1),
  number: z.string().min(8),
  text: z.string().min(1).max(4096),
});

/**
 * Envia mensagem aplicando delay randômico anti-ban (2.5s a 5.5s) e presença "composing".
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { instanceName, instanceToken, number, text } = parsed.data;
    const antiBanDelayMs = Math.floor(2500 + Math.random() * 3000);

    const result = await whatsappClient.sendText(instanceName, instanceToken, {
      number,
      text,
      delayMs: antiBanDelayMs,
    });

    return NextResponse.json({
      ok: true,
      messageId: result.key?.id ?? null,
      appliedDelayMs: antiBanDelayMs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao enviar mensagem";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
