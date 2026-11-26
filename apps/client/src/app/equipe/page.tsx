"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ClientShell } from "../../components/client-shell";
import { useOrganization } from "../../lib/tenant/context";
import { createClient } from "../../lib/supabase/client";
import { updateClientUserProfile } from "../../lib/actions/profile";
import { updateTeamMemberRole, removeTeamMember } from "../../lib/actions/cabinet-management";
import {
  Card,
  CardHeader,
  CardTitle,
  Badge,
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
  Select,
} from "@gabinete360/ui";
import { UserCheck, Plus, Mail, Edit2, Trash2 } from "lucide-react";
import { type DemoTeamMember } from "../../lib/types/domain";

interface TeamRow extends DemoTeamMember {
  user_id?: string;
}

export default function EquipePage() {
  const { organization, membership: currentMembership, refreshMembership } = useOrganization();
  const [members, setMembers] = useState<TeamRow[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editRoleTitle, setEditRoleTitle] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("advisor");
  const [savingEdit, setSavingEdit] = useState(false);

  // Invite Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleTitle, setRoleTitle] = useState("Assessor Parlamentar");
  const [role, setRole] = useState("advisor");

  const loadMembers = useCallback(async () => {
    if (!organization?.id) return;
    const supabase = createClient();
    const { data: memberships } = await supabase
      .from("memberships")
      .select("*")
      .eq("organization_id", organization.id)
      .eq("status", "active");

    if (!memberships) return;

    const userIds = memberships.map((m: any) => m.user_id).filter(Boolean);
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("*").in("user_id", userIds)
      : { data: [] };

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    const mapped: TeamRow[] = memberships.map((m: any) => {
      const p: any = profileMap.get(m.user_id);
      const displayName = p?.display_name || "Membro do Gabinete";
      return {
        id: m.id,
        user_id: m.user_id,
        organization_id: m.organization_id,
        name: displayName,
        role: m.role,
        role_title: p?.institutional_role || p?.role_title || m.role,
        email: "",
        phone: p?.phone || "",
        avatar_initials: displayName.substring(0, 2).toUpperCase(),
        status: m.status,
        active_demands: 0,
        active_tasks: 0,
        joined_at: m.joined_at || m.created_at,
      };
    });
    setMembers(mapped);
  }, [organization?.id]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleEditOpen = (m: TeamRow) => {
    setEditingMember(m);
    setEditName(m.name);
    setEditRoleTitle(m.role_title);
    setEditPhone(m.phone || "");
    setEditRole(m.role as string);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !organization?.id) return;
    setSavingEdit(true);

    try {
      if (editingMember.user_id && editingMember.user_id === currentMembership?.user_id) {
        await updateClientUserProfile({
          displayName: editName,
          roleTitle: editRoleTitle,
          phone: editPhone,
        });
      }

      if (
        ["parliamentarian", "chief_of_staff", "staff", "advisor", "intern"].includes(editRole)
      ) {
        await updateTeamMemberRole(organization.id, editingMember.id, editRole as any);
      }

      await Promise.all([loadMembers(), refreshMembership()]);
      setEditingMember(null);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteMember = async (id: string, memberName: string) => {
    if (!organization?.id) return;
    if (confirm(`Tem certeza que deseja remover ${memberName} da equipe do gabinete?`)) {
      await removeTeamMember(organization.id, id);
      await loadMembers();
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newMember: TeamRow = {
      id: `mem-${Date.now()}`,
      organization_id: organization?.id || "",
      name,
      email,
      phone: "",
      role: role as any,
      role_title: roleTitle,
      status: "invited",
      active_demands: 0,
      active_tasks: 0,
      avatar_initials: name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      joined_at: new Date().toISOString(),
    };

    setMembers([...members, newMember]);
    setIsInviteModalOpen(false);
    setName("");
    setEmail("");
  };

  const getRoleBadge = (memberRole: string) => {
    switch (memberRole) {
      case "parliamentarian":
      case "owner":
        return <Badge variant="green">Titular / Parlamentar</Badge>;
      case "chief_of_staff":
      case "admin":
        return <Badge variant="blue">Chefe de Gabinete</Badge>;
      case "advisor":
      case "staff":
        return <Badge variant="neutral">Assessor / Equipe</Badge>;
      default:
        return <Badge variant="neutral">{memberRole}</Badge>;
    }
  };

  return (
    <ClientShell
      breadcrumbs={[
        { label: "Início", href: "/dashboard" },
        { label: "Equipe do Mandato", current: true },
      ]}
      topbarActions={
        <Button variant="primary" size="sm" onClick={() => setIsInviteModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Convidar Membro
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="bg-mint/40 border border-green/20 rounded-lg p-3 text-xs text-green flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span>
              <strong>Equipe e Controle de Acessos RBAC</strong> — Gerenciamento de servidores,
              assessores parlamentares e atribuição de permissões operacionais.
            </span>
          </div>
        </div>

        <Card>
          <CardHeader className="py-3 px-4 border-b border-line flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Membros Ativos no Gabinete ({members.length})
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>Membro da Equipe</Th>
                  <Th>Cargo no Gabinete</Th>
                  <Th>Papel RBAC</Th>
                  <Th>Demandas Atribuídas</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {members.map((m) => (
                  <Tr key={m.id}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Avatar name={m.name} size="sm" />
                        <div>
                          <div className="font-semibold text-ink text-sm">{m.name}</div>
                          {(m.email || m.phone) && (
                            <div className="text-[11px] text-muted flex items-center gap-1 font-mono">
                              <Mail className="h-3 w-3 text-muted" /> {m.email || m.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className="text-xs text-ink font-medium">{m.role_title}</span>
                    </Td>
                    <Td>{getRoleBadge(m.role)}</Td>
                    <Td>
                      <span className="text-xs font-semibold text-green">
                        {m.active_demands} ativas
                      </span>
                    </Td>
                    <Td>
                      <Badge variant={m.status === "active" ? "green" : "amber"}>
                        {m.status === "active" ? "Ativo" : "Convidado"}
                      </Badge>
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditOpen(m)}
                          className="text-xs text-muted hover:text-ink h-7 px-2"
                          title="Editar Perfil e Acesso"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        {m.role !== "owner" && m.role !== ("parliamentarian" as any) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMember(m.id, m.name)}
                            className="text-xs text-red hover:bg-red/10 h-7 px-2"
                            title="Remover Acesso"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Modal Convidar Membro */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Adicionar Membro à Equipe do Gabinete"
      >
        <form onSubmit={handleInvite} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1">Nome Completo *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Lucas Mendonça"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">E-mail Corporativo *</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="assessor@gabinete360.app"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Cargo no Mandato *</label>
              <Input
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Ex.: Assessor Parlamentar"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Nível de Permissão (RBAC) *</label>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                options={[
                  { value: "advisor", label: "Assessor (Atendimentos e Agenda)" },
                  { value: "chief_of_staff", label: "Chefe de Gabinete (Acesso Total)" },
                ]}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button variant="ghost" type="button" onClick={() => setIsInviteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Enviar Convite
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Perfil de Acesso */}
      <Modal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        title="Editar Perfil e Permissões do Membro"
      >
        {editingMember && (
          <form onSubmit={handleEditSave} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold block mb-1">Nome Completo *</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Cargo no Mandato *</label>
                <Input
                  value={editRoleTitle}
                  onChange={(e) => setEditRoleTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Telefone / WhatsApp</label>
                <Input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="(38) 99999-0000"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Papel RBAC *</label>
              <Select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                options={[
                  { value: "advisor", label: "Assessor (Atendimentos e Agenda)" },
                  { value: "staff", label: "Equipe / Atendimento" },
                  { value: "chief_of_staff", label: "Chefe de Gabinete" },
                  { value: "parliamentarian", label: "Titular do Mandato (Parlamentar)" },
                ]}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-line">
              <Button variant="ghost" type="button" onClick={() => setEditingMember(null)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={savingEdit}>
                {savingEdit ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </ClientShell>
  );
}
