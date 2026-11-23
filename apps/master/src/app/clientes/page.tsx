"use client";

import React, { useState } from "react";
import type { PlatformTenant, CustomerType, TenantStatus } from "@gabinete360/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  Badge,
  DemoWatermark,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  NoticeBanner,
} from "@gabinete360/ui";
import {
  Users,
  Search,
  Plus,
  Power,
  Edit2,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { MasterShell } from "../../components/master-shell";

const INITIAL_CLIENTS: PlatformTenant[] = [
  {
    id: "ten-001",
    name: "Câmara Municipal de Santos",
    slug: "camara-santos",
    customer_type: "municipal_chamber",
    status: "active",
    lifecycle_state: "active",
    legal_name: "Câmara Municipal de Santos - SP",
    cnpj: "48.245.981/0001-30",
    city: "Santos",
    state: "SP",
    plan_key: "chamber",
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-11-20T14:30:00Z",
    contacts: [
      {
        id: "c-101",
        tenant_id: "ten-001",
        contact_type: "primary",
        name: "Carlos Eduardo Silveira",
        email: "carlos.silveira@camarasantos.sp.gov.br",
        phone: "(13) 3211-5000",
        created_at: "2026-01-15T10:00:00Z",
      },
      {
        id: "c-102",
        tenant_id: "ten-001",
        contact_type: "technical",
        name: "Tiago Rodrigues (DTI)",
        email: "tiago.dti@camarasantos.sp.gov.br",
        phone: "(13) 99871-4433",
        created_at: "2026-01-15T10:00:00Z",
      },
    ],
  },
  {
    id: "ten-002",
    name: "Gabinete Ver. Mariana Costa",
    slug: "mariana-costa",
    customer_type: "individual_cabinet",
    status: "active",
    lifecycle_state: "active",
    legal_name: "Mariana Ferreira Costa",
    cnpj: "31.455.901/0001-12",
    city: "Belo Horizonte",
    state: "MG",
    plan_key: "pro",
    created_at: "2026-02-01T12:00:00Z",
    updated_at: "2026-11-18T10:00:00Z",
    contacts: [
      {
        id: "c-201",
        tenant_id: "ten-002",
        contact_type: "primary",
        name: "Luciana Paiva (Chefe de Gabinete)",
        email: "chefe@marianacosta.com.br",
        phone: "(31) 98452-1122",
        created_at: "2026-02-01T12:00:00Z",
      },
    ],
  },
  {
    id: "ten-003",
    name: "Câmara Municipal de Campinas",
    slug: "camara-campinas",
    customer_type: "municipal_chamber",
    status: "pending",
    lifecycle_state: "provisioning",
    legal_name: "Câmara Municipal de Campinas - SP",
    cnpj: "51.884.219/0001-44",
    city: "Campinas",
    state: "SP",
    plan_key: "chamber",
    created_at: "2026-11-20T08:00:00Z",
    updated_at: "2026-11-22T21:00:00Z",
    contacts: [
      {
        id: "c-301",
        tenant_id: "ten-003",
        contact_type: "primary",
        name: "Fernando Dias (Diretoria Geral)",
        email: "fernando.dias@campinas.sp.leg.br",
        phone: "(19) 3788-0100",
        created_at: "2026-11-20T08:00:00Z",
      },
    ],
  },
  {
    id: "ten-004",
    name: "Gabinete Dep. Roberto Silveira",
    slug: "roberto-silveira",
    customer_type: "individual_cabinet",
    status: "active",
    lifecycle_state: "active",
    legal_name: "Roberto de Souza Silveira",
    cnpj: "18.332.991/0001-88",
    city: "Curitiba",
    state: "PR",
    plan_key: "basic",
    created_at: "2026-03-10T11:00:00Z",
    updated_at: "2026-11-15T09:00:00Z",
    contacts: [
      {
        id: "c-401",
        tenant_id: "ten-004",
        contact_type: "primary",
        name: "Amanda Lins (Assessora)",
        email: "contato@robertosilveira.com.br",
        phone: "(41) 99123-9988",
        created_at: "2026-03-10T11:00:00Z",
      },
    ],
  },
  {
    id: "ten-005",
    name: "Gabinete Ver. Lucas Mendes",
    slug: "lucas-mendes",
    customer_type: "individual_cabinet",
    status: "suspended",
    lifecycle_state: "active",
    legal_name: "Lucas Mendes da Rocha",
    cnpj: "26.781.045/0001-55",
    city: "Porto Alegre",
    state: "RS",
    plan_key: "basic",
    created_at: "2026-04-05T15:00:00Z",
    updated_at: "2026-11-10T16:00:00Z",
    contacts: [
      {
        id: "c-501",
        tenant_id: "ten-005",
        contact_type: "billing",
        name: "Financeiro Gabinete",
        email: "financeiro@lucasmendes.com.br",
        phone: "(51) 98765-4321",
        created_at: "2026-04-05T15:00:00Z",
      },
    ],
  },
  {
    id: "ten-006",
    name: "Câmara Municipal de Niterói",
    slug: "camara-niteroi",
    customer_type: "municipal_chamber",
    status: "active",
    lifecycle_state: "active",
    legal_name: "Câmara Municipal de Niterói - RJ",
    cnpj: "29.987.112/0001-09",
    city: "Niterói",
    state: "RJ",
    plan_key: "chamber",
    created_at: "2026-05-12T09:30:00Z",
    updated_at: "2026-11-21T18:00:00Z",
    contacts: [
      {
        id: "c-601",
        tenant_id: "ten-006",
        contact_type: "primary",
        name: "Beatriz Gusmão",
        email: "beatriz@cmn.rj.gov.br",
        phone: "(21) 2717-0099",
        created_at: "2026-05-12T09:30:00Z",
      },
    ],
  },
];

export default function ClientsManagementPage() {
  const [clients, setClients] = useState<PlatformTenant[]>(INITIAL_CLIENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<PlatformTenant | null>(null);
  const [viewContactsClient, setViewContactsClient] = useState<PlatformTenant | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    customer_type: "individual_cabinet" as CustomerType,
    legal_name: "",
    cnpj: "",
    city: "",
    state: "SP",
    plan_key: "pro",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });

  // Filter Logic
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.cnpj && c.cnpj.includes(searchTerm));

    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesType = typeFilter === "all" || c.customer_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Toggle Activation/Suspension
  const handleToggleStatus = (tenant: PlatformTenant) => {
    const newStatus: TenantStatus = tenant.status === "active" ? "suspended" : "active";
    setClients((prev) =>
      prev.map((c) =>
        c.id === tenant.id
          ? {
              ...c,
              status: newStatus,
              updated_at: new Date().toISOString(),
            }
          : c
      )
    );
  };

  // Open Edit Modal
  const handleOpenEdit = (tenant: PlatformTenant) => {
    setSelectedClient(tenant);
    setFormData({
      name: tenant.name,
      slug: tenant.slug,
      customer_type: tenant.customer_type,
      legal_name: tenant.legal_name || "",
      cnpj: tenant.cnpj || "",
      city: tenant.city || "",
      state: tenant.state || "SP",
      plan_key: tenant.plan_key || "pro",
      contact_name: tenant.contacts?.[0]?.name || "",
      contact_email: tenant.contacts?.[0]?.email || "",
      contact_phone: tenant.contacts?.[0]?.phone || "",
    });
    setIsEditModalOpen(true);
  };

  // Submit Create
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) return;

    const newTenant: PlatformTenant = {
      id: `ten-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      slug: formData.slug.toLowerCase().replace(/\s+/g, "-"),
      customer_type: formData.customer_type,
      status: "active",
      lifecycle_state: "draft",
      legal_name: formData.legal_name || formData.name,
      cnpj: formData.cnpj,
      city: formData.city,
      state: formData.state,
      plan_key: formData.plan_key,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      contacts: formData.contact_name
        ? [
            {
              id: `c-${Date.now()}`,
              tenant_id: `ten-${Date.now().toString().slice(-4)}`,
              contact_type: "primary",
              name: formData.contact_name,
              email: formData.contact_email,
              phone: formData.contact_phone,
              created_at: new Date().toISOString(),
            },
          ]
        : [],
    };

    setClients([newTenant, ...clients]);
    setIsCreateModalOpen(false);
    resetForm();
  };

  // Submit Edit
  const handleUpdateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    setClients((prev) =>
      prev.map((c) =>
        c.id === selectedClient.id
          ? {
              ...c,
              name: formData.name,
              slug: formData.slug,
              customer_type: formData.customer_type,
              legal_name: formData.legal_name,
              cnpj: formData.cnpj,
              city: formData.city,
              state: formData.state,
              plan_key: formData.plan_key,
              updated_at: new Date().toISOString(),
            }
          : c
      )
    );
    setIsEditModalOpen(false);
    setSelectedClient(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      customer_type: "individual_cabinet",
      legal_name: "",
      cnpj: "",
      city: "",
      state: "SP",
      plan_key: "pro",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
    });
  };

  return (
    <MasterShell
      title="Gestão de Clientes & Contratantes"
      subtitle="Administração centralizada do ciclo de vida dos inquilinos (tenants) no Control Plane"
      badgeText="Control Plane Tenant Registry"
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Novo Inquilino
        </Button>
      }
    >
      <NoticeBanner variant="institutional">
        <strong>Ambiente de Demonstração:</strong> Todas as alterações de clientes, cadastros e suspensões
        ocorrem no estado em memória para fins de validação técnica do Control Plane.
      </NoticeBanner>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Buscar por nome, slug, cidade ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full pl-9 pr-4 rounded-md border border-line bg-white text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 rounded-md border border-line bg-white px-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-green"
              >
                <option value="all">Todos os Tipos</option>
                <option value="municipal_chamber">Câmara Municipal</option>
                <option value="individual_cabinet">Gabinete Individual</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-md border border-line bg-white px-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-green"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativo</option>
                <option value="pending">Pendente</option>
                <option value="suspended">Suspenso</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table of Tenants */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Inquilinos Registrados</CardTitle>
            <p className="text-xs text-muted mt-0.5">
              Exibindo {filteredClients.length} de {clients.length} clientes na plataforma
            </p>
          </div>
          <Badge variant="blue">DEMONSTRAÇÃO</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>Inquilino / Razão Social</Th>
                <Th>Tipo</Th>
                <Th>Plano</Th>
                <Th>Localidade</Th>
                <Th>Contatos</Th>
                <Th>Status</Th>
                <Th className="text-right">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredClients.map((client) => (
                <Tr key={client.id} className="hover:bg-paper/40 transition-colors">
                  <Td>
                    <div className="font-semibold text-ink text-xs">{client.name}</div>
                    <div className="text-[10px] text-muted font-mono">{client.slug} · CNPJ: {client.cnpj || "N/D"}</div>
                  </Td>
                  <Td>
                    <Badge variant={client.customer_type === "municipal_chamber" ? "blue" : "neutral"}>
                      {client.customer_type === "municipal_chamber" ? "Câmara Municipal" : "Gabinete Individual"}
                    </Badge>
                  </Td>
                  <Td>
                    <span className="font-semibold text-xs text-ink uppercase tracking-wide">
                      {client.plan_key === "chamber" ? "Enterprise 360°" : client.plan_key === "pro" ? "Profissional" : "Essencial"}
                    </span>
                  </Td>
                  <Td className="text-xs text-muted">
                    {client.city} / {client.state}
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => setViewContactsClient(client)}
                      className="text-xs text-green hover:underline font-medium flex items-center gap-1"
                    >
                      <Users className="h-3.5 w-3.5" />
                      {client.contacts?.length || 0} contato(s)
                    </button>
                  </Td>
                  <Td>
                    {client.status === "active" ? (
                      <Badge variant="green" dot>
                        Ativo
                      </Badge>
                    ) : client.status === "suspended" ? (
                      <Badge variant="red" dot>
                        Suspenso
                      </Badge>
                    ) : (
                      <Badge variant="amber" dot>
                        Pendente
                      </Badge>
                    )}
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(client)}
                        title="Editar Dados Cadastrais"
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-muted hover:text-ink" />
                      </Button>

                      <Button
                        variant={client.status === "active" ? "ghost" : "secondary"}
                        size="sm"
                        onClick={() => handleToggleStatus(client)}
                        title={client.status === "active" ? "Suspender Acesso" : "Reativar Cliente"}
                        className={`h-8 px-2 text-xs ${
                          client.status === "active"
                            ? "text-red hover:bg-red/10"
                            : "text-green"
                        }`}
                      >
                        <Power className="h-3.5 w-3.5 mr-1" />
                        {client.status === "active" ? "Suspender" : "Ativar"}
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
              {filteredClients.length === 0 && (
                <Tr>
                  <Td colSpan={7} className="text-center py-8 text-muted text-xs">
                    Nenhum cliente localizado para os filtros informados.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal: Create Client */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Cadastrar Novo Inquilino (Tenant)"
        description="Provisionamento administrativo de um novo cliente no Control Plane do Gabinete 360°"
        size="lg"
      >
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome do Cliente / Gabinete *"
              placeholder="Ex: Gabinete Ver. Carlos Eduardo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Slug do Tenant (Identificador único) *"
              placeholder="ex: carloseduardo-sp"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo de Contratação *"
              value={formData.customer_type}
              onChange={(e) => setFormData({ ...formData, customer_type: e.target.value as CustomerType })}
            >
              <option value="individual_cabinet">Gabinete Individual (Vereador / Deputado)</option>
              <option value="municipal_chamber">Câmara Municipal Completa (Multi-Gabinetes)</option>
            </Select>

            <Select
              label="Plano de Assinatura *"
              value={formData.plan_key}
              onChange={(e) => setFormData({ ...formData, plan_key: e.target.value })}
            >
              <option value="basic">Essencial (R$ 490/mês)</option>
              <option value="pro">Profissional (R$ 990/mês)</option>
              <option value="chamber">Enterprise 360° (R$ 3.900/mês)</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="CNPJ"
              placeholder="00.000.000/0001-00"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            />
            <Input
              label="Cidade"
              placeholder="Ex: Campinas"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Estado (UF)"
              placeholder="SP"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>

          <div className="border-t border-line pt-4 space-y-3">
            <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-green" /> Contato Responsável Principal
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Nome do Contato"
                placeholder="Ex: João da Silva"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              />
              <Input
                label="E-mail"
                type="email"
                placeholder="contato@gabinete.gov.br"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
              <Input
                label="Telefone / WhatsApp"
                placeholder="(11) 99999-9999"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-line">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Cadastrar Inquilino
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Client */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Dados do Inquilino"
        description="Atualização de parâmetros contratuais e identificadores do Control Plane"
        size="md"
      >
        <form onSubmit={handleUpdateClient} className="space-y-4">
          <Input
            label="Nome do Cliente"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Slug Identificador"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
          />
          <Select
            label="Plano de Assinatura"
            value={formData.plan_key}
            onChange={(e) => setFormData({ ...formData, plan_key: e.target.value })}
          >
            <option value="basic">Essencial</option>
            <option value="pro">Profissional</option>
            <option value="chamber">Enterprise 360°</option>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cidade"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Estado (UF)"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-line">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Contacts */}
      <Modal
        isOpen={!!viewContactsClient}
        onClose={() => setViewContactsClient(null)}
        title={`Contatos — ${viewContactsClient?.name}`}
        description="Pontos focais técnicos, administrativos e faturamento cadastrados"
        size="md"
      >
        <div className="space-y-3">
          {viewContactsClient?.contacts && viewContactsClient.contacts.length > 0 ? (
            viewContactsClient.contacts.map((contact) => (
              <div
                key={contact.id}
                className="rounded-lg border border-line bg-paper/30 p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-ink">{contact.name}</span>
                  <Badge variant="neutral" className="text-[9px]">
                    {contact.contact_type === "primary"
                      ? "Principal"
                      : contact.contact_type === "technical"
                      ? "TI / Técnico"
                      : "Faturamento"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Mail className="h-3 w-3 text-green" />
                  <span>{contact.email}</span>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Phone className="h-3 w-3 text-green" />
                    <span>{contact.phone}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-muted">
              Nenhum contato cadastrado para este inquilino.
            </div>
          )}
        </div>
      </Modal>
    </MasterShell>
  );
}
