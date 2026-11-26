"use client";

import React, { useState, useEffect } from "react";
import { ClientShell } from "../../components/client-shell";
import { useOrganization } from "../../lib/tenant/context";
import { createClient } from "../../lib/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  FilterChip,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Modal,
  Input,
  Textarea,
  Select,
  SkeletonLoader,
  EmptyState,
  ErrorState,
} from "@gabinete360/ui";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Tag,
  MessageSquare,
  Clock,
  UserCheck,
  Building,
} from "lucide-react";
import { type DemoCitizen } from "../../lib/types/domain";
import { citizenSchema, validateForm } from "../../lib/validation/schemas";

export default function CidadaosPage() {
  const { organization } = useOrganization();
  const [citizens, setCitizens] = useState<DemoCitizen[]>([]);

  useEffect(() => {
    if (!organization?.id) return;
    const supabase = createClient();
    supabase
      .from("citizens")
      .select("*")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setCitizens(data as DemoCitizen[]);
      });
  }, [organization?.id]);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [uiState, setUiState] = useState<"normal" | "loading" | "empty" | "error">("normal");
  const [selectedCitizen, setSelectedCitizen] = useState<DemoCitizen | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [neighborhood, setNeighborhood] = useState("Jardim das Flores");
  const [preferredChannel, setPreferredChannel] = useState("whatsapp");
  const [tagInput, setTagInput] = useState("Liderança Comunitária");
  const [notes, setNotes] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredCitizens = citizens.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));

    const matchTag =
      tagFilter === "all" ||
      c.tags.some((t) => t.toLowerCase().includes(tagFilter.toLowerCase()));

    return matchSearch && matchTag;
  });

  const handleCreateCitizen = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateForm(citizenSchema, {
      name,
      phone,
      email: email || null,
      neighborhood,
      preferred_channel: preferredChannel as any,
      tags: [tagInput],
      notes,
    });

    if (!result.success) {
      setFormErrors(result.errors);
      return;
    }

    const newCitizen: DemoCitizen = {
      id: `cit-${Date.now()}`,
      organization_id: "org-gabinete-mariana",
      name,
      display_name: name,
      phone,
      email: email || null,
      preferred_channel: preferredChannel as any,
      neighborhood,
      city: "Santos",
      state: "SP",
      tags: [tagInput],
      notes,
      status: "active",
      demands_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCitizens([newCitizen, ...citizens]);
    setIsNewModalOpen(false);
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setFormErrors({});
  };

  return (
    <ClientShell
      breadcrumbs={[
        { label: "Início", href: "/dashboard" },
        { label: "CRM de Cidadãos", current: true },
      ]}
      topbarActions={
        <Button variant="primary" size="sm" onClick={() => setIsNewModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Novo Munícipe
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Banner de Demonstração */}
        <div className="bg-mint/40 border border-green/20 rounded-lg p-3 text-xs text-green flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              <strong>CRM Parlamentar</strong> — Base de relacionamento comunitário, histórico de lideranças e perfil de munícipes.
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted">Alternar estado UI:</span>
            <Button size="sm" variant={uiState === "normal" ? "secondary" : "ghost"} onClick={() => setUiState("normal")}>
              Normal
            </Button>
            <Button size="sm" variant={uiState === "loading" ? "secondary" : "ghost"} onClick={() => setUiState("loading")}>
              Carregando
            </Button>
            <Button size="sm" variant={uiState === "empty" ? "secondary" : "ghost"} onClick={() => setUiState("empty")}>
              Vazio
            </Button>
            <Button size="sm" variant={uiState === "error" ? "secondary" : "ghost"} onClick={() => setUiState("error")}>
              Erro
            </Button>
          </div>
        </div>

        {/* Resumo de Indicadores do CRM */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white rounded-lg border border-line">
            <div className="text-[11px] text-muted font-medium">Total de Munícipes</div>
            <div className="text-xl font-bold font-heading text-ink">{citizens.length}</div>
            <div className="text-[10px] text-green font-medium">Base ativa no mandato</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-line">
            <div className="text-[11px] text-muted font-medium">Canal WhatsApp</div>
            <div className="text-xl font-bold font-heading text-ink">
              {citizens.filter((c) => c.preferred_channel === "whatsapp").length}
            </div>
            <div className="text-[10px] text-muted">Preferência de contato</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-line">
            <div className="text-[11px] text-muted font-medium">Lideranças Mapeadas</div>
            <div className="text-xl font-bold font-heading text-ink">
              {citizens.filter((c) => c.tags.some((t) => t.includes("Liderança"))).length}
            </div>
            <div className="text-[10px] text-amber-600 font-medium">Contatos prioritários</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-line">
            <div className="text-[11px] text-muted font-medium">Bairros Alcançados</div>
            <div className="text-xl font-bold font-heading text-ink">
              {new Set(citizens.map((c) => c.neighborhood)).size}
            </div>
            <div className="text-[10px] text-muted">Presença territorial</div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Buscar por nome do cidadão, telefone, e-mail ou bairro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-green"
              />
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-line text-xs">
              <span className="text-muted font-medium mr-1 flex items-center gap-1">
                <Tag className="h-3 w-3" /> Filtrar por Perfil:
              </span>
              <FilterChip label={`Todos (${citizens.length})`} active={tagFilter === "all"} onClick={() => setTagFilter("all")} />
              <FilterChip label="Lideranças Comunitárias" active={tagFilter === "liderança"} onClick={() => setTagFilter("liderança")} />
              <FilterChip label="Comunitário" active={tagFilter === "comunitário"} onClick={() => setTagFilter("comunitário")} />
              <FilterChip label="Saúde" active={tagFilter === "saúde"} onClick={() => setTagFilter("saúde")} />
              <FilterChip label="Educação" active={tagFilter === "educação"} onClick={() => setTagFilter("educação")} />
            </div>
          </CardContent>
        </Card>

        {/* Estados Especiais */}
        {uiState === "loading" && (
          <div className="space-y-3">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
        )}

        {uiState === "empty" && (
          <EmptyState
            title="Nenhum munícipe cadastrado"
            description="Não encontramos registros correspondentes à busca na base do mandato."
            actionLabel="Cadastrar Primeiro Munícipe"
            onAction={() => setIsNewModalOpen(true)}
          />
        )}

        {uiState === "error" && (
          <ErrorState
            title="Erro ao carregar lista de cidadãos"
            message="Não foi possível sincronizar o CRM no momento."
            retryLabel="Tentar Novamente"
            onRetry={() => setUiState("normal")}
          />
        )}

        {/* Tabela Principal de Munícipes */}
        {uiState === "normal" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={selectedCitizen ? "lg:col-span-2" : "lg:col-span-3"}>
              <Card>
                <CardHeader className="py-3 px-4 border-b border-line flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    Cidadãos Cadastrados ({filteredCitizens.length})
                  </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                  <Table>
                    <Thead>
                      <Tr>
                        <Th>Munícipe</Th>
                        <Th>Contato</Th>
                        <Th>Localidade</Th>
                        <Th>Tags / Perfil</Th>
                        <Th>Demandas</Th>
                        <Th className="text-right">Ação</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredCitizens.map((citizen) => (
                        <Tr
                          key={citizen.id}
                          className={`cursor-pointer hover:bg-paper/50 ${
                            selectedCitizen?.id === citizen.id ? "bg-mint/30 font-medium" : ""
                          }`}
                          onClick={() => setSelectedCitizen(citizen)}
                        >
                          <Td>
                            <div className="flex items-center gap-2">
                              <Avatar name={citizen.name} size="sm" />
                              <div>
                                <div className="font-semibold text-ink text-sm">{citizen.name}</div>
                                <div className="text-[11px] text-muted">Cadastrado no mandato</div>
                              </div>
                            </div>
                          </Td>
                          <Td>
                            <div className="text-xs text-ink font-mono flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted" /> {citizen.phone}
                            </div>
                            {citizen.email && (
                              <div className="text-[11px] text-muted flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted" /> {citizen.email}
                              </div>
                            )}
                          </Td>
                          <Td>
                            <div className="text-xs text-ink flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted" /> {citizen.neighborhood}
                            </div>
                            <div className="text-[10px] text-muted">
                              {citizen.city} / {citizen.state}
                            </div>
                          </Td>
                          <Td>
                            <div className="flex flex-wrap gap-1">
                              {citizen.tags.map((t) => (
                                <Badge key={t} variant={t.includes("Liderança") ? "amber" : "neutral"}>
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          </Td>
                          <Td>
                            <span className="font-semibold text-green text-xs">
                              {citizen.demands_count} registradas
                            </span>
                          </Td>
                          <Td className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCitizen(citizen);
                              }}
                            >
                              Ver Perfil
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </div>
              </Card>
            </div>

            {/* Painel Lateral com Detalhes do Munícipe */}
            {selectedCitizen && (
              <div className="lg:col-span-1">
                <Card className="sticky top-20 border-green/30 shadow-sm">
                  <CardHeader className="py-3 px-4 border-b border-line bg-mint/20 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={selectedCitizen.name} size="sm" />
                      <div>
                        <CardTitle className="text-sm font-semibold text-ink">
                          {selectedCitizen.name}
                        </CardTitle>
                        <div className="text-[11px] text-muted">{selectedCitizen.neighborhood}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCitizen(null)}>
                      ✕
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4 text-xs">
                    <div>
                      <div className="text-muted font-medium mb-1">Tags e Categorização:</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedCitizen.tags.map((t) => (
                          <Badge key={t} variant="green">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 bg-paper rounded border border-line space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Telefone:</span>
                        <span className="font-mono font-medium text-ink">{selectedCitizen.phone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted">E-mail:</span>
                        <span className="text-ink">{selectedCitizen.email || "Não informado"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Canal preferido:</span>
                        <Badge variant="blue" className="capitalize">
                          {selectedCitizen.preferred_channel}
                        </Badge>
                      </div>
                    </div>

                    {selectedCitizen.notes && (
                      <div>
                        <div className="text-muted font-medium mb-1">Anotações do Gabinete:</div>
                        <p className="p-2 bg-paper rounded border border-line text-ink leading-relaxed">
                          {selectedCitizen.notes}
                        </p>
                      </div>
                    )}

                    <div className="p-2.5 bg-mint/30 rounded border border-green/20">
                      <div className="text-green font-semibold flex items-center gap-1.5 mb-1">
                        <MessageSquare className="h-3.5 w-3.5" /> Histórico no Mandato
                      </div>
                      <div className="text-[11px] text-ink">
                        Este munícipe possui <strong>{selectedCitizen.demands_count} atendimentos</strong> vinculados ao seu cadastro.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Novo Munícipe */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Cadastrar Novo Munícipe no CRM"
      >
        <form onSubmit={handleCreateCitizen} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1">Nome Completo *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Maria Aparecida de Oliveira"
              error={formErrors.name}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Telefone / WhatsApp *</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 13 99999-8888"
                error={formErrors.phone}
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">E-mail (opcional)</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@exemplo.com.br"
                error={formErrors.email}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Bairro *</label>
              <Input
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ex.: Gonzaga"
                error={formErrors.neighborhood}
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Canal Preferencial *</label>
              <Select
                value={preferredChannel}
                onChange={(e) => setPreferredChannel(e.target.value)}
                options={[
                  { value: "whatsapp", label: "WhatsApp" },
                  { value: "phone", label: "Ligação Telefônica" },
                  { value: "email", label: "E-mail" },
                  { value: "in_person", label: "Presencial no Gabinete" },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Perfil / Classificação</label>
            <Select
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              options={[
                { value: "Liderança Comunitária", label: "Liderança Comunitária" },
                { value: "Comunitário", label: "Comunitário / Morador" },
                { value: "Saúde", label: "Setor de Saúde" },
                { value: "Educação", label: "Educação / Professor" },
                { value: "Comerciante", label: "Comerciante Local" },
              ]}
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Observações do Gabinete</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Histórico da liderança, demandas habituais ou particularidades..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button variant="ghost" type="button" onClick={() => setIsNewModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Salvar Munícipe
            </Button>
          </div>
        </form>
      </Modal>
    </ClientShell>
  );
}
