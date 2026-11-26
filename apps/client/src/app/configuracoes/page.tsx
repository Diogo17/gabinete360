"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ClientShell } from "../../components/client-shell";
import { useOrganization } from "../../lib/tenant/context";
import { saveParliamentaryPortalProfile } from "../../lib/actions/profile";
import { uploadCabinetAsset } from "../../lib/supabase/storage";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  NoticeBanner,
  SkeletonLoader,
} from "@gabinete360/ui";
import {
  UserCog,
  Save,
  ExternalLink,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Globe,
  Building2,
} from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  vereador: "Vereador(a)",
  deputado_estadual: "Deputado(a) Estadual",
  deputado_federal: "Deputado(a) Federal",
  senador: "Senador(a)",
};

export default function ConfiguracoesPerfilPage() {
  const { organization, profile, parliamentaryProfile, isLoading, refreshMembership } =
    useOrganization();

  const [cabinetName, setCabinetName] = useState("");
  const [portalSlug, setPortalSlug] = useState("");
  const [jurisdiction, setJurisdiction] = useState<"municipal" | "state" | "federal">("municipal");
  const [institutionType, setInstitutionType] = useState<
    "city_council" | "state_assembly" | "house" | "senate"
  >("city_council");
  const [parliamentaryRole, setParliamentaryRole] = useState<
    "vereador" | "deputado_estadual" | "deputado_federal" | "senador"
  >("vereador");
  const [legislatorName, setLegislatorName] = useState("");
  const [fullName, setFullName] = useState("");
  const [party, setParty] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [district, setDistrict] = useState("");
  const [legislatureNumber, setLegislatureNumber] = useState("2025–2028");
  const [officeAddress, setOfficeAddress] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [officialPhone, setOfficialPhone] = useState("");
  const [officialSite, setOfficialSite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bioHeadline, setBioHeadline] = useState("");
  const [biography, setBiography] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState("");
  const [chamberName, setChamberName] = useState("");
  const [chamberAddress, setChamberAddress] = useState("");
  const [chamberCep, setChamberCep] = useState("");
  const [agendaSyncUrl, setAgendaSyncUrl] = useState("");
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [portalCtaLabel, setPortalCtaLabel] = useState("");
  const [neighborhoodPlaceholder, setNeighborhoodPlaceholder] = useState("");

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!organization) return;

    const p = parliamentaryProfile;
    setCabinetName(p?.cabinet_name || organization.name || "");
    setPortalSlug(p?.portal_slug || organization.slug || "");
    setJurisdiction(p?.jurisdiction || "municipal");
    setInstitutionType(p?.institution_type || "city_council");
    setParliamentaryRole(p?.parliamentary_role || "vereador");
    setLegislatorName(
      p?.legislator_name || organization.parliamentarian_name || profile?.display_name || ""
    );
    setFullName(p?.full_name || profile?.display_name || "");
    setParty(p?.party || "");
    setMunicipality(p?.municipality || organization.municipality || "");
    setStateUf(p?.state || organization.state || "");
    setDistrict(p?.district || "");
    setLegislatureNumber(p?.legislature_number || "2025–2028");
    setOfficeAddress(p?.office_address || "");
    setOfficialEmail(p?.official_email || "");
    setOfficialPhone(p?.official_phone || profile?.phone || "");
    setOfficialSite(p?.official_site || "");
    setAvatarUrl(p?.avatar_url || organization.avatar_url || profile?.avatar_path || "");
    setBioHeadline(p?.bio_headline || "");
    setBiography(p?.biography || organization.description || "");
    setHighlights(Array.isArray(p?.highlights) ? p.highlights : []);
    setChamberName(
      p?.chamber_name ||
        (p?.municipality || organization.municipality
          ? `Câmara Municipal de ${p?.municipality || organization.municipality}`
          : "")
    );
    setChamberAddress(p?.chamber_address || "");
    setChamberCep(p?.chamber_cep || "");
    setAgendaSyncUrl(organization.agenda_sync_url || "");
    setPortalEnabled(p?.portal_enabled ?? true);
    setPortalCtaLabel(p?.portal_cta_label || "");
    setNeighborhoodPlaceholder(p?.neighborhood_placeholder || "");
  }, [organization, parliamentaryProfile, profile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !organization?.id) return;
    setUploadingPhoto(true);
    setFeedback(null);
    try {
      const res = await uploadCabinetAsset(file, organization.id, "avatars");
      if (res.success && res.url) {
        setAvatarUrl(res.url);
        setFeedback({
          type: "success",
          text: "Foto enviada para o Storage. Clique em Salvar para publicar no portal.",
        });
      } else {
        setFeedback({ type: "error", text: res.error || "Falha ao enviar foto." });
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddHighlight = () => {
    const trimmed = newHighlight.trim();
    if (!trimmed || highlights.length >= 6) return;
    setHighlights((prev) => [...prev, trimmed]);
    setNewHighlight("");
  };

  const handleRemoveHighlight = (idx: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await saveParliamentaryPortalProfile({
        organizationId: organization.id,
        cabinetName,
        portalSlug,
        jurisdiction,
        institutionType,
        parliamentaryRole,
        legislatorName,
        fullName: fullName || null,
        party: party || null,
        state: stateUf,
        municipality,
        district: district || null,
        legislatureNumber: legislatureNumber || null,
        officeAddress: officeAddress || null,
        officialEmail: officialEmail || null,
        officialPhone: officialPhone || null,
        officialSite: officialSite || null,
        avatarUrl: avatarUrl || null,
        bioHeadline: bioHeadline || null,
        biography: biography || null,
        highlights,
        chamberName,
        chamberAddress: chamberAddress || null,
        chamberCep: chamberCep || null,
        agendaSyncUrl: agendaSyncUrl || null,
        portalEnabled,
        portalCtaLabel: portalCtaLabel || null,
        neighborhoodPlaceholder: neighborhoodPlaceholder || null,
      });

      if (!res.success) {
        setFeedback({ type: "error", text: res.error || "Não foi possível salvar o perfil." });
        return;
      }

      await refreshMembership();
      setFeedback({
        type: "success",
        text: "Perfil parlamentar salvo com sucesso! As alterações já estão refletidas no Portal Público.",
      });
    } finally {
      setSaving(false);
    }
  };

  const portalHref = portalSlug ? `/portal/${portalSlug}` : "/portal";

  return (
    <ClientShell
      breadcrumbs={[
        { label: "Início", href: "/dashboard" },
        { label: "Perfil & Portal Público", current: true },
      ]}
      topbarActions={
        <Link href={portalHref} target="_blank">
          <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
            <ExternalLink className="h-3.5 w-3.5" />
            Abrir Portal Público
          </Button>
        </Link>
      }
    >
      <div className="space-y-6 max-w-4xl">
        <div className="bg-mint/40 border border-green/20 rounded-lg p-3.5 text-xs text-green flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCog className="h-4 w-4 shrink-0" />
            <span>
              <strong>Fonte Única da Verdade do Portal Público</strong> — Tudo o que você salvar aqui
              atualiza automaticamente o cabeçalho, biografia, selos, formulário e rodapé da página pública.
            </span>
          </div>
          <Badge variant={portalEnabled ? "green" : "amber"}>
            {portalEnabled ? "Portal Publicado" : "Portal Oculto"}
          </Badge>
        </div>

        {feedback && (
          <NoticeBanner
            variant={feedback.type === "success" ? "institutional" : "warning"}
            className={
              feedback.type === "success"
                ? "border-green/30 bg-green/5 text-green text-xs"
                : "border-red/30 bg-red/5 text-red text-xs"
            }
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {feedback.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{feedback.text}</span>
              </div>
              {feedback.type === "success" && (
                <Link href={portalHref} target="_blank" className="font-bold underline shrink-0">
                  Ver Portal →
                </Link>
              )}
            </div>
          </NoticeBanner>
        )}

        {isLoading && !organization ? (
          <Card>
            <CardContent className="p-6 space-y-4">
              <SkeletonLoader variant="text" count={3} />
              <SkeletonLoader variant="card" count={2} />
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Foto e Identidade Parlamentar */}
            <Card>
              <CardHeader className="border-b border-line pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-green" />
                  1. Identidade do Parlamentar e Gabinete
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-line">
                  <div className="h-20 w-20 rounded-xl bg-paper border border-line overflow-hidden grid place-items-center shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={legislatorName || "Foto do Parlamentar"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-heading font-bold text-lg text-green">
                        {(legislatorName || organization?.name || "360").slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="font-semibold text-ink">Foto Oficial do Parlamentar</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-white hover:bg-paper cursor-pointer font-semibold text-ink">
                        <Upload className="h-3.5 w-3.5 text-green" />
                        <span>{uploadingPhoto ? "Enviando..." : "Enviar Nova Foto"}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                          className="sr-only"
                        />
                      </label>
                      <Input
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="URL da foto oficial ou caminho /imagem.jpg"
                        className="flex-1 min-w-[220px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome Público / Urna *"
                    value={legislatorName}
                    onChange={(e) => setLegislatorName(e.target.value)}
                    placeholder="Ex.: Nome parlamentar"
                    required
                  />
                  <Input
                    label="Nome Civil Completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex.: Nome completo oficial"
                  />
                  <Input
                    label="Nome do Gabinete (Cabeçalho) *"
                    value={cabinetName}
                    onChange={(e) => setCabinetName(e.target.value)}
                    placeholder="Ex.: Gabinete Parlamentar"
                    required
                  />
                  <Input
                    label="Slug do Portal Público *"
                    value={portalSlug}
                    onChange={(e) => setPortalSlug(e.target.value.toLowerCase())}
                    placeholder="Ex.: nome-parlamentar-cidade"
                    helperText={`URL pública: /portal/${portalSlug || "seu-slug"}`}
                    required
                  />
                  <Select
                    label="Cargo Parlamentar *"
                    value={parliamentaryRole}
                    onChange={(e) => setParliamentaryRole(e.target.value as any)}
                    options={Object.entries(ROLE_LABELS).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                  />
                  <Input
                    label="Partido"
                    value={party}
                    onChange={(e) => setParty(e.target.value)}
                    placeholder="Ex.: Sigla ou nome do partido"
                  />
                  <Input
                    label="Legislatura / Mandato"
                    value={legislatureNumber}
                    onChange={(e) => setLegislatureNumber(e.target.value)}
                    placeholder="Ex.: 2025–2028"
                  />
                  <Input
                    label="Distrito / Comunidade de Origem"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Ex.: Distrito ou região de atuação"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. Biografia e Destaques Verificados */}
            <Card>
              <CardHeader className="border-b border-line pb-3">
                <CardTitle className="text-sm font-bold">
                  2. Biografia e Selos de Destaque Verificados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-xs">
                <Input
                  label="Título de Destaque da Biografia"
                  value={bioHeadline}
                  onChange={(e) => setBioHeadline(e.target.value)}
                  placeholder="Ex.: Compromisso com o município e atuação comunitária"
                />
                <Textarea
                  label="Biografia Oficial"
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  rows={4}
                  placeholder="Descreva a trajetória verídica, origem e áreas de atuação do mandato..."
                />

                <div className="space-y-2">
                  <label className="font-semibold block">
                    Selos / Indicadores Verificados (até 6 selos exibidos abaixo da biografia)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {highlights.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint/40 border border-green/20 text-green font-semibold"
                      >
                        <span>✓ {item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(idx)}
                          className="text-red hover:opacity-80"
                          title="Remover selo"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newHighlight}
                      onChange={(e) => setNewHighlight(e.target.value)}
                      placeholder="Ex.: 849 Votos (Eleição 2024)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddHighlight}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Casa Legislativa, Endereço Oficial e Contatos */}
            <Card>
              <CardHeader className="border-b border-line pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-green" />
                  3. Casa Legislativa, Endereço e Contatos Oficiais (Rodapé & Canal)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <Select
                  label="Esfera *"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value as any)}
                  options={[
                    { value: "municipal", label: "Municipal" },
                    { value: "state", label: "Estadual" },
                    { value: "federal", label: "Federal" },
                  ]}
                />
                <Select
                  label="Casa Legislativa *"
                  value={institutionType}
                  onChange={(e) => setInstitutionType(e.target.value as any)}
                  options={[
                    { value: "city_council", label: "Câmara Municipal" },
                    { value: "state_assembly", label: "Assembleia Legislativa" },
                    { value: "house", label: "Câmara dos Deputados" },
                    { value: "senate", label: "Senado Federal" },
                  ]}
                />
                <Input
                  label="Nome da Câmara / Casa Legislativa *"
                  value={chamberName}
                  onChange={(e) => setChamberName(e.target.value)}
                  placeholder="Ex.: Câmara Municipal"
                  required
                />
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <Input
                      label="Município *"
                      value={municipality}
                      onChange={(e) => setMunicipality(e.target.value)}
                      placeholder="Ex.: Município"
                      required
                    />
                  </div>
                  <Input
                    label="UF *"
                    value={stateUf}
                    onChange={(e) => setStateUf(e.target.value.toUpperCase())}
                    placeholder="UF"
                    maxLength={2}
                    required
                  />
                </div>
                <Input
                  label="Endereço Oficial da Câmara (Rodapé)"
                  value={chamberAddress}
                  onChange={(e) => setChamberAddress(e.target.value)}
                  placeholder="Ex.: Avenida / Praça, nº · Bairro · Cidade - UF"
                />
                <Input
                  label="CEP"
                  value={chamberCep}
                  onChange={(e) => setChamberCep(e.target.value)}
                  placeholder="Ex.: 00.000-000"
                />
                <Input
                  label="Sala / Endereço do Gabinete"
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  placeholder="Ex.: Gabinete nº · Casa Legislativa"
                />
                <Input
                  label="E-mail Institucional"
                  type="email"
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  placeholder="Ex.: contato@camara.mg.leg.br"
                />
                <Input
                  label="Telefone Oficial"
                  value={officialPhone}
                  onChange={(e) => setOfficialPhone(e.target.value)}
                  placeholder="Ex.: (38) 3620-0000"
                />
                <Input
                  label="Site / SAPL Oficial"
                  value={officialSite}
                  onChange={(e) => setOfficialSite(e.target.value)}
                  placeholder="https://..."
                />
              </CardContent>
            </Card>

            {/* 4. Personalização do Portal Público */}
            <Card>
              <CardHeader className="border-b border-line pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green" />
                  4. Exibição e Formulário no Portal Público
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-xs">
                <label className="flex items-center gap-2.5 font-semibold text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={portalEnabled}
                    onChange={(e) => setPortalEnabled(e.target.checked)}
                    className="h-4 w-4 accent-[#176B52]"
                  />
                  <span>Portal Público da Transparência ativo e visível aos cidadãos</span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Texto do Botão de Envio no Formulário"
                    value={portalCtaLabel}
                    onChange={(e) => setPortalCtaLabel(e.target.value)}
                    placeholder={`Ex.: Enviar ao Gabinete do Vereador ${legislatorName || ""}`}
                  />
                  <Input
                    label="Exemplo de Bairro / Comunidade no Formulário"
                    value={neighborhoodPlaceholder}
                    onChange={(e) => setNeighborhoodPlaceholder(e.target.value)}
                    placeholder={`Ex.: Bairro / Comunidade · ${municipality || "Município"}`}
                  />
                </div>
                <Input
                  label="Link Externo de Agenda / Portal Legislativo (opcional)"
                  value={agendaSyncUrl}
                  onChange={(e) => setAgendaSyncUrl(e.target.value)}
                  placeholder="https://..."
                />
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3">
              <Link href={portalHref} target="_blank">
                <Button type="button" variant="outline">
                  Visualizar Portal
                </Button>
              </Link>
              <Button type="submit" variant="primary" disabled={saving} className="gap-1.5 font-bold">
                <Save className="h-4 w-4" />
                {saving ? "Salvando e Atualizando Portal..." : "Salvar Perfil e Atualizar Portal"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </ClientShell>
  );
}
