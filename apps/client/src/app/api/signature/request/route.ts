import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  computeDocumentHash,
  createChainedAuditEvent,
  evaluateSignaturePolicy,
  generateOpaqueVerificationCode,
} from '@/lib/signature/orchestrator';
import type { SignatureLevel } from '@/lib/signature/types';

const SignatureRequestSchema = z.object({
  organizationId: z.string().uuid('organizationId inválido.'),
  documentId: z.string().trim().min(1, 'documentId é obrigatório.'),
  content: z.string().min(1, 'content é obrigatório.'),
  requestedLevel: z.enum(['simple', 'advanced_native', 'qualified']).default('simple'),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado. Autentique-se para solicitar assinatura.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = SignatureRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { organizationId, documentId, content, requestedLevel } = parsed.data;

    const { data: membership } = await supabase
      .from('memberships')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!membership) {
      return NextResponse.json(
        { error: 'Acesso negado a este gabinete.' },
        { status: 403 }
      );
    }

    const documentHash = computeDocumentHash(content);
    const { rawCode, codeHash } = generateOpaqueVerificationCode();
    const policyEval = evaluateSignaturePolicy(null, requestedLevel as SignatureLevel);
    const requestId = randomUUID();

    const { error: insertError } = await supabase.from('signature_requests').insert({
      id: requestId,
      organization_id: organizationId,
      document_id: documentId,
      requested_by: user.id,
      requested_level: requestedLevel,
      document_hash: documentHash,
      status: 'pending',
    });

    if (insertError) {
      return NextResponse.json(
        { error: 'Falha ao persistir solicitação de assinatura.', details: insertError.message },
        { status: 500 }
      );
    }

    const auditEvent = createChainedAuditEvent({
      id: randomUUID(),
      signatureRequestId: requestId,
      eventType: 'signature_request_created',
      metadataMinimized: {
        documentId,
        requestedLevel,
        documentHash,
      },
      previousEventHash: null,
    });

    return NextResponse.json({
      signatureRequestId: requestId,
      documentId,
      documentHash,
      requestedLevel,
      verificationCode: rawCode,
      verificationCodeHash: codeHash,
      disclaimer: policyEval.disclaimer,
      warnings: policyEval.warnings,
      auditEvent,
    });
  } catch {
    return NextResponse.json(
      { error: 'Falha ao criar solicitação de assinatura.' },
      { status: 400 }
    );
  }
}
