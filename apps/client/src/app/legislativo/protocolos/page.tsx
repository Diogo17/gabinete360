'use client';

import { useState } from 'react';

interface ProtocolItem {
  protocolNumber: string;
  channel: string;
  status: 'pending' | 'submitted' | 'confirmed' | 'returned';
  deadlineType: 'legal' | 'regimental' | 'administrative' | 'internal' | 'estimated';
  deadlineAt: string;
}

export default function ProtocolosPage() {
  const [items, setItems] = useState<ProtocolItem[]>([]);
  const [form, setForm] = useState<ProtocolItem>({
    protocolNumber: '',
    channel: 'Sistema Legislativo',
    status: 'submitted',
    deadlineType: 'regimental',
    deadlineAt: '',
  });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.protocolNumber) return;
    setItems((prev) => [form, ...prev]);
    setForm({ ...form, protocolNumber: '', deadlineAt: '' });
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-bold">Protocol & Delivery Intelligence</h1>
      <p className="mt-1 text-sm text-gray-600">
        Registro separado de protocolo, comprovantes e prazos (legal, regimental, administrativo, interno ou estimado).
      </p>

      <form onSubmit={handleAdd} className="mt-6 grid grid-cols-1 gap-4 rounded-lg border p-5 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Número do Protocolo"
          value={form.protocolNumber}
          onChange={(e) => setForm({ ...form, protocolNumber: e.target.value })}
          className="rounded-md border px-3 py-2 text-sm"
          required
        />
        <input
          type="text"
          placeholder="Canal de envio"
          value={form.channel}
          onChange={(e) => setForm({ ...form, channel: e.target.value })}
          className="rounded-md border px-3 py-2 text-sm"
        />
        <select
          value={form.deadlineType}
          onChange={(e) => setForm({ ...form, deadlineType: e.target.value as ProtocolItem['deadlineType'] })}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="legal">Prazo Legal</option>
          <option value="regimental">Prazo Regimental</option>
          <option value="administrative">Prazo Administrativo</option>
          <option value="internal">Prazo Interno</option>
          <option value="estimated">Prazo Estimado</option>
        </select>
        <input
          type="date"
          value={form.deadlineAt}
          onChange={(e) => setForm({ ...form, deadlineAt: e.target.value })}
          className="rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:col-span-2"
        >
          Registrar Protocolo
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum protocolo registrado nesta sessão.</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="rounded-md border p-4 text-sm">
              <div className="font-semibold">Protocolo #{item.protocolNumber} ({item.channel})</div>
              <div className="text-gray-600">
                Status: {item.status} · Tipo de prazo: {item.deadlineType}
                {item.deadlineAt ? ` · Vencimento: ${item.deadlineAt}` : ''}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
