'use client';

import { useState } from 'react';

interface VerificationResult {
  verified: boolean;
  message: string;
  legalNotice?: string;
}

export default function ValidarAssinaturaPage() {
  const [code, setCode] = useState('');
  const [documentHash, setDocumentHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/signature/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, documentHash }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao verificar assinatura.');
      } else {
        setResult(data);
      }
    } catch {
      setError('Erro de conexão ao consultar o serviço de verificação.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">
        Portal de Validação — Assinatura 360°
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Consulte a integridade e os metadados autorizados de um documento assinado no Gabinete Digital 360°.
        Documentos restritos não são expostos publicamente.
      </p>

      <form onSubmit={handleVerify} className="mt-8 space-y-4 rounded-lg border p-6">
        <div>
          <label className="block text-sm font-medium">Código de Verificação (QR / Opaco)</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ex: A9F3K2..."
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="text-center text-xs text-gray-400">ou</div>

        <div>
          <label className="block text-sm font-medium">Hash SHA-256 do Arquivo</label>
          <input
            type="text"
            value={documentHash}
            onChange={(e) => setDocumentHash(e.target.value)}
            placeholder="64 caracteres hexadecimais"
            className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Verificar Assinatura'}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-md border bg-gray-50 p-4 text-sm">
          <p className="font-medium">{result.message}</p>
          {result.legalNotice && (
            <p className="mt-2 text-xs text-gray-500">{result.legalNotice}</p>
          )}
        </div>
      )}
    </main>
  );
}
