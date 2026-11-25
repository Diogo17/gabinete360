import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import {
  computeDocumentHash,
  createChainedAuditEvent,
  evaluateSignaturePolicy,
  generateOpaqueVerificationCode,
} from '@/lib/signature/orchestrator';
import type { SignatureLevel } from '@/lib/signature/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const documentId = typeof body?.documentId === 'string' ? body.documentId.trim() : '';
    const content = typeof body?.content === 'string' ? body.content : '';
    const requestedLevel = (body?.requestedLevel ?? 'simple') as SignatureLevel;

    if (!documentId || !content) {
      return NextResponse.json(
        { error: 'documentId e content são obrigatórios para iniciar a assinatura.' },
        { status: 400 }
      );
    }

    const documentHash = computeDocumentHash(content);
    const { rawCode, codeHash } = generateOpaqueVerificationCode();
    const policyEval = evaluateSignaturePolicy(null, requestedLevel);
    const requestId = randomUUID();

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
