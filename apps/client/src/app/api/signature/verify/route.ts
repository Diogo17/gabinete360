import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { SIGNATURE_LEGAL_DISCLAIMERS } from '@/lib/signature/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = typeof body?.code === 'string' ? body.code.trim() : '';
    const documentHash =
      typeof body?.documentHash === 'string' ? body.documentHash.trim().toLowerCase() : '';

    if (!code && !documentHash) {
      return NextResponse.json(
        { error: 'Informe o código de verificação ou o hash SHA-256 do documento.' },
        { status: 400 }
      );
    }

    if (documentHash && !/^[a-f0-9]{64}$/.test(documentHash)) {
      return NextResponse.json(
        { error: 'Hash SHA-256 inválido. Deve conter 64 caracteres hexadecimais.' },
        { status: 400 }
      );
    }

    const codeHash = code ? createHash('sha256').update(code.toUpperCase()).digest('hex') : null;
    const supabase = await createClient();

    if (codeHash) {
      const { data: verificationRow } = await supabase
        .from('signature_verification_codes')
        .select(
          'id, privacy_mode, revoked_at, expires_at, signature_artifacts(id, signed_file_hash, format, signature_validation_status, generated_at)'
        )
        .eq('public_code_hash', codeHash)
        .maybeSingle();

      if (verificationRow && verificationRow.privacy_mode !== 'disabled' && !verificationRow.revoked_at) {
        return NextResponse.json({
          verified: true,
          message: 'Assinatura localizada e íntegra. Metadados autorizados exibidos.',
          artifact: verificationRow.signature_artifacts,
          legalNotice: SIGNATURE_LEGAL_DISCLAIMERS.advanced_native,
        });
      }
    }

    if (documentHash) {
      const { data: artifact } = await supabase
        .from('signature_artifacts')
        .select('id, signed_file_hash, format, signature_validation_status, generated_at')
        .eq('signed_file_hash', documentHash)
        .maybeSingle();

      if (artifact) {
        return NextResponse.json({
          verified: true,
          message: 'Hash SHA-256 corresponde a um artefato assinado registrado.',
          artifact,
          legalNotice: SIGNATURE_LEGAL_DISCLAIMERS.advanced_native,
        });
      }
    }

    return NextResponse.json({
      verified: false,
      message:
        'Nenhum registro público encontrado para os parâmetros informados (ou consulta pública desativada para documento restrito).',
      legalNotice: SIGNATURE_LEGAL_DISCLAIMERS.advanced_native,
    });
  } catch {
    return NextResponse.json({ error: 'Falha ao processar verificação.' }, { status: 400 });
  }
}
