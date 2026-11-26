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
import {
  UserCheck,
  Plus,
  Shield,
  Mail,
  Phone,
  CheckCircle,
  Edit2,
  Trash2,
  Camera,
} from "lucide-react";
import { type DemoTeamMember } from "../../lib/types/domain";

export default function EquipePage() {
  const { organization } = useOrganization();
  const [members, setMembers] = useState<DemoTeamMember[]>([]);

  useEffect(() => {
    if (!organization?.id) return;
    const supabase = createClient();
    supabase
      .from("memberships")
      .select("*, profile:profiles(*)")
      .eq("organization_id", organization.id)
      .eq("status", "active")
      .then(({ data }) => {
        if (data) {
          const mapped: DemoTeamMember[] = data.map((m: any) => ({
            id: m.id,
            organization_id: m.organization_id,
            name: m.profile?.display_name || "Membro",
            role: m.role,
            role_title: m.profile?.role_title || m.role,
            email: m.profile?.email || "",
            phone: m.profile?.phone || "",
            avatar_initials: (m.profile?.display_name || "MB").substring(0, 2).toUpperCase(),
            status: m.status,
            active_demands: 0,
            active_tasks: 0,
            joined_at: m.joined_at || m.created_at,
          }));
          setMembers(mapped);
        }
      });
  }, [organization?.id]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<DemoTeamMember | null>(null);
  const [editName, setEditName] = useState("");
  const [editRoleTitle, setEditRoleTitle] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("advisor");

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleTitle, setRoleTitle] = useState("Assessor Parlamentar");
  const [role, setRole] = useState("advisor");

  const handleEditOpen = (m: DemoTeamMember) => {
    setEditingMember(m);
    setEditName(m.name);
    setEditRoleTitle(m.role_title);
    setEditPhone(m.phone || "");
    setEditRole(m.role as string);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setMembers(
      members.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              name: editName,
              role_title: editRoleTitle,
              phone: editPhone,
              role: editRole as any,
            }
          : m
      )
    );
    setEditingMember(null);
  };

  const handleDeleteMember = (id: string, memberName: string) => {
    if (confirm(`Tem certeza que deseja remover ${memberName} da equipe do gabinete?`)) {
      setMembers(members.filter((m) => m.id !== id));
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newMember: DemoTeamMember = {
      id: `mem-${Date.now()}`,
      organization_id: "org-gabinete-mariana",
      name,
      email,
      phone: "+55 13 99999-0000",
      role: role as any,
      role_title: roleTitle,
      status: "invited",
      active_demands: 0,
      active_tasks: 0,
      avatar_initials: name.split(" ").map((n) => n[0]).join(""),
      joined_at: new Date().toISOString(),
    };

    setMembers([...members, newMember]);
    setIsInviteModalOpen(false);
    setName("");
    setEmail("");
  };

  const getRoleBadge = (role: DemoTeamMember["role"]) => {
    switch (role) {
      case "owner":
        return <Badge variant="green">Titular / Parlamentar</Badge>;
      case "admin":
        return <Badge variant="blue">Chefe de Gabinete / Admin</Badge>;
      case "advisor":
        return <Badge variant="neutral">Assessor / Atendimento</Badge>;
      default:
        return <Badge variant="neutral">{role}</Badge>;
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
              <strong>Equipe e Controle de Acessos RBAC</strong> — Gerenciamento de servidores, assessores parlamentares e atribuição de permissões operacionais.
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
                          <div className="text-[11px] text-muted flex items-center gap-1 font-mono">
                            <Mail className="h-3 w-3 text-muted" /> {m.email}
                          </div>
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
                        {m.role !== "owner" && (
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
              placeholder="lucas@gabinete.exemplo.com.br"
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
                  { value: "admin", label: "Chefe de Gabinete (Acesso Total)" },
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

            <div>
              <label className="font-semibold block mb-1">E-mail Corporativo</label>
              <Input
                value={editingMember.email}
                disabled
                className="bg-muted-bg cursor-not-allowed opacity-75 font-mono"
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
                  placeholder="+55 13 99999-0000"
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
                  { value: "admin", label: "Chefe de Gabinete (Acesso Total)" },
                  { value: "owner", label: "Titular do Mandato (Parlamentar)" },
                ]}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-line">
              <Button variant="ghost" type="button" onClick={() => setEditingMember(null)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Salvar Alterações
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </ClientShell>
  );
}
