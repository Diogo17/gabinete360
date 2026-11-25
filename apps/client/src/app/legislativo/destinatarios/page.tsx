'use client';

import { useState } from 'react';

interface RecipientDraft {
  name: string;
  roleTitle: string;
  institution: string;
  protocolChannel: string;
  acceptedSignatureLevel: string;
  officialSourceUrl: string;
}

export default function DestinatariosPage() {
  const [recipients, setRecipients] = useState<RecipientDraft[]>([]);
  const [form, setForm] = useState<RecipientDraft>({
    name: '',
    roleTitle: '',
    institution: '',
    protocolChannel: 'protocolo_eletronico',
    acceptedSignatureLevel: 'advanced_native',
    officialSourceUrl: '',
  });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.institution) return;
    setRecipients((prev) => [form, ...prev]);
    setForm({
      name: '',
      roleTitle: '',
      institution: '',
      protocolChannel: 'protocolo_eletronico',
      acceptedSignatureLevel: 'advanced_native',
      officialSourceUrl: '',
    });
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-bold">Smart Recipient Directory</h1>
      <p className="mt-1 text-sm text-gray-600">
        Cadastro de destinatários oficiais com canal de protocolo, nível de assinatura aceito e fonte oficial.
      </p>

      <form onSubmit={handleAdd} className="mt-6 grid grid-cols-1 gap-4 rounded-lg border p-5 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Nome do destinatário"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-md border px-3 py-2 text-sm"
          required
        />
        <input
          type="text"
          placeholder="Cargo / Função"
          value={form.roleTitle}
          onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
          className="rounded-md border px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Órgão / Instituição"
          value={form.institution}
          onChange={(e) => setForm({ ...form, institution: e.target.value })}
          className="rounded-md border px-3 py-2 text-sm"
          required
        />
        <select
          value={form.acceptedSignatureLevel}
          onChange={(e) => setForm({ ...form, acceptedSignatureLevel: e.target.value })}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="simple">Assinatura Simples</option>
          <option value="advanced_native">Assinatura Avançada Nativa</option>
          <option value="qualified_icp_brasil">Qualificada (ICP-Brasil)</option>
          <option value="govbr_advanced">Gov.br Avançada</option>
        </select>
        <input
          type="url"
          placeholder="URL da fonte oficial (regra de aceitação)"
          value={form.officialSourceUrl}
          onChange={(e) => setForm({ ...form, officialSourceUrl: e.target.value })}
          className="rounded-md border px-3 py-2 text-sm sm:col-span-2"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:col-span-2"
        >
          Adicionar Destinatário
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {recipients.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum destinatário cadastrado nesta sessão.</p>
        ) : (
          recipients.map((r, idx) => (
            <div key={idx} className="rounded-md border p-4 text-sm">
              <div className="font-semibold">{r.name} — {r.roleTitle}</div>
              <div className="text-gray-600">{r.institution} · Nível aceito: {r.acceptedSignatureLevel}</div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
