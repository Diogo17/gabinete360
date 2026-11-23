"use client";

import React, { useState } from "react";
import { ClientShell } from "../../components/client-shell";
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
} from "lucide-react";
import { DEMO_TEAM_MEMBERS, type DemoTeamMember } from "../../lib/mock-data";

export default function EquipePage() {
  const [members, setMembers] = useState<DemoTeamMember[]>(DEMO_TEAM_MEMBERS);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleTitle, setRoleTitle] = useState("Assessor Parlamentar");
  const [role, setRole] = useState("advisor");

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
          <Badge variant="green">Ambiente Demonstração</Badge>
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
    </ClientShell>
  );
}
