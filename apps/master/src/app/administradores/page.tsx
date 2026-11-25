"use client";

import React, { useState } from "react";
import type { PlatformAdmin } from "@gabinete360/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  DemoWatermark,
  Button,
  Input,
  Select,
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
  ShieldCheck,
  Plus,
  Key,
  Lock,
  UserCheck,
  History,
  AlertTriangle,
  Mail,
  Shield,
  CheckCircle2,
  Info,
  Trash2,
  Edit2,
  Camera,
} from "lucide-react";
import { MasterShell } from "../../components/master-shell";

interface ExtendedAdmin extends PlatformAdmin {
  ipLastLogin?: string;
  mfaMethod?: string;
}

const INITIAL_ADMINS: ExtendedAdmin[] = [
  {
    id: "adm-1",
    auth_user_id: "usr-sec-01",
    display_name: "Diogo Mota (DM IA)",
    email: "admin@dmiastudio.com",
    role: "platform_super_admin",
    status: "active",
    mfa_required: true,
    mfa_enabled: true,
    created_at: "2026-01-01T00:00:00Z",
    last_login_at: "2026-11-22T21:45:00Z",
    ipLastLogin: "189.40.12.91 (São Paulo / BR)",
    mfaMethod: "TOTP AAL2 (Google Authenticator)",
  },
  {
    id: "adm-2",
    auth_user_id: "usr-sec-02",
    display_name: "Juliana Duarte (Segurança)",
    email: "sec-admin@dmiastudio.com",
    role: "platform_security_admin",
    status: "active",
    mfa_required: true,
    mfa_enabled: true,
    created_at: "2026-01-15T10:00:00Z",
    last_login_at: "2026-11-22T19:12:00Z",
    ipLastLogin: "201.86.104.22 (Belo Horizonte / BR)",
    mfaMethod: "TOTP AAL2 (1Password)",
  },
  {
    id: "adm-3",
    auth_user_id: "usr-ops-03",
    display_name: "Marcos Vinícius (Operações)",
    email: "ops-admin@dmiastudio.com",
    role: "platform_operations",
    status: "active",
    mfa_required: true,
    mfa_enabled: true,
    created_at: "2026-02-10T14:00:00Z",
    last_login_at: "2026-11-22T17:30:00Z",
    ipLastLogin: "177.136.20.15 (Campinas / BR)",
    mfaMethod: "TOTP AAL2 (YubiKey / Authenticator)",
  },
  {
    id: "adm-4",
    auth_user_id: "usr-sup-04",
    display_name: "Lucas Alencar (Suporte L3)",
    email: "suporte@dmiastudio.com",
    role: "platform_support",
    status: "active",
    mfa_required: true,
    mfa_enabled: true,
    created_at: "2026-03-01T09:00:00Z",
    last_login_at: "2026-11-22T20:05:00Z",
    ipLastLogin: "187.52.88.10 (Curitiba / BR)",
    mfaMethod: "TOTP AAL2 (Microsoft Authenticator)",
  },
  {
    id: "adm-5",
    auth_user_id: "usr-aud-05",
    display_name: "Dra. Camila Nogueira (Compliance)",
    email: "auditoria@dmiastudio.com",
    role: "platform_auditor",
    status: "active",
    mfa_required: true,
    mfa_enabled: true,
    created_at: "2026-04-12T11:00:00Z",
    last_login_at: "2026-11-21T16:20:00Z",
    ipLastLogin: "191.178.50.3 (Brasília / BR)",
    mfaMethod: "TOTP AAL2 (Google Authenticator)",
  },
  {
    id: "adm-6",
    auth_user_id: "usr-aud-06",
    display_name: "Eduardo Fonseca",
    email: "eduardo.dev@dmiastudio.com",
    role: "platform_operations",
    status: "invited",
    mfa_required: true,
    mfa_enabled: false,
    created_at: "2026-11-22T10:00:00Z",
    last_login_at: null,
    ipLastLogin: "—",
    mfaMethod: "Aguardando primeiro setup",
  },
];

const ROLES_INFO = [
  {
    code: "platform_super_admin",
    name: "Super Administrador",
    desc: "Acesso irrestrito a governança, provisionamento de bancos, gestão de planos e auditoria.",
    color: "red",
  },
  {
    code: "platform_security_admin",
    name: "Administrador de Segurança",
    desc: "Gestão de políticas de MFA, aprovação de acessos JIT e análise de trilhas de auditoria.",
    color: "blue",
  },
  {
    code: "platform_operations",
    name: "Operações & Infraestrutura",
    desc: "Execução de pipelines de provisionamento, monitoramento de microsserviços e retries.",
    color: "green",
  },
  {
    code: "platform_support",
    name: "Suporte Nível 3",
    desc: "Abertura de solicitações JIT para apoio emergencial aos inquilinos contratantes.",
    color: "amber",
  },
  {
    code: "platform_auditor",
    name: "Auditor de Conformidade",
    desc: "Acesso somente-leitura a relatórios de governança, logs imutáveis e conformidade LGPD.",
    color: "neutral",
  },
];

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<ExtendedAdmin[]>(INITIAL_ADMINS);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedAdminHistory, setSelectedAdminHistory] = useState<ExtendedAdmin | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<ExtendedAdmin | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("platform_operations");

  const [newAdminData, setNewAdminData] = useState({
    name: "",
    email: "",
    role: "platform_operations",
  });

  const handleDeleteAdmin = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover o acesso do administrador ${name}?`)) {
      setAdmins(admins.filter((a) => a.id !== id));
    }
  };

  const handleEditOpen = (admin: ExtendedAdmin) => {
    setEditingAdmin(admin);
    setEditName(admin.display_name);
    setEditRole(admin.role || "platform_operations");
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setAdmins(
      admins.map((a) =>
        a.id === editingAdmin.id
          ? { ...a, display_name: editName, role: editRole }
          : a
      )
    );
    setEditingAdmin(null);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminData.name || !newAdminData.email) return;

    const newAdmin: ExtendedAdmin = {
      id: `adm-${Date.now().toString().slice(-4)}`,
      auth_user_id: `usr-gen-${Date.now().toString().slice(-4)}`,
      display_name: newAdminData.name,
      email: newAdminData.email,
      role: newAdminData.role,
      status: "invited",
      mfa_required: true,
      mfa_enabled: false,
      created_at: new Date().toISOString(),
      last_login_at: null,
      ipLastLogin: "—",
      mfaMethod: "Aguardando ativação MFA",
    };

    setAdmins([...admins, newAdmin]);
    setIsInviteModalOpen(false);
    setNewAdminData({ name: "", email: "", role: "platform_operations" });
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "platform_super_admin":
        return <Badge variant="red">Super Admin</Badge>;
      case "platform_security_admin":
        return <Badge variant="blue">Segurança</Badge>;
      case "platform_operations":
        return <Badge variant="green">Operações</Badge>;
      case "platform_support":
        return <Badge variant="amber">Suporte</Badge>;
      case "platform_auditor":
        return <Badge variant="neutral">Auditor</Badge>;
      default:
        return <Badge variant="neutral">{role || "Admin"}</Badge>;
    }
  };

  return (
    <MasterShell
      title="Gestão de Administradores & MFA"
      subtitle="Diretório de operadores do Control Plane, controle de papéis (RBAC) e obrigatoriedade de MFA TOTP"
      badgeText="MFA TOTP Mandatório"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPermissionsModalOpen(true)}
            className="text-xs"
          >
            <Shield className="h-3.5 w-3.5 mr-1 text-green" />
            Matriz de Permissões
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsInviteModalOpen(true)}
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Convidar Administrador
          </Button>
        </div>
      }
    >
      <NoticeBanner variant="institutional">
        <strong>Política de Segurança Zero-Trust:</strong> Todos os administradores do Control Plane exigem
        obrigatoriamente autenticação em dois fatores (MFA TOTP - AAL2). Sessões sem MFA verificado são barradas pelo Middleware.
      </NoticeBanner>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted">Administradores Ativos</div>
            <div className="text-2xl font-bold font-heading text-ink">
              {admins.filter((a) => a.status === "active").length}
            </div>
            <div className="text-[11px] text-green font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> 100% com MFA Ativado
            </div>
          </div>
          <ShieldCheck className="h-8 w-8 text-green" />
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted">Convites Pendentes</div>
            <div className="text-2xl font-bold font-heading text-ink">
              {admins.filter((a) => a.status === "invited").length}
            </div>
            <div className="text-[11px] text-muted">Aguardando registro TOTP</div>
          </div>
          <Mail className="h-8 w-8 text-gold" />
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted">Nível de Garantia (AAL)</div>
            <div className="text-2xl font-bold font-heading text-ink">AAL2 Exigido</div>
            <div className="text-[11px] text-muted">RFC 6238 TOTP + Algoritmo SHA-1</div>
          </div>
          <Lock className="h-8 w-8 text-blue" />
        </Card>
      </div>

      {/* Admins Table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Operadores do Control Plane</CardTitle>
            <p className="text-xs text-muted mt-0.5">
              Diretório com status de MFA e último login registrado
            </p>
          </div>

        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <Thead>
              <Tr>
                <Th>Operador / E-mail</Th>
                <Th>Papel (Role)</Th>
                <Th>MFA Mandatório</Th>
                <Th>MFA Status</Th>
                <Th>Último Acesso</Th>
                <Th>Status</Th>
                <Th className="text-right">Histórico</Th>
              </Tr>
            </Thead>
            <Tbody>
              {admins.map((admin) => (
                <Tr key={admin.id} className="hover:bg-paper/40 transition-colors">
                  <Td>
                    <div className="font-semibold text-xs text-ink">{admin.display_name}</div>
                    <div className="text-[11px] text-muted font-mono">{admin.email}</div>
                  </Td>
                  <Td>{getRoleBadge(admin.role)}</Td>
                  <Td>
                    <Badge variant="green" className="text-[9px]">
                      Obrigatório
                    </Badge>
                  </Td>
                  <Td>
                    {admin.mfa_enabled ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green">
                        <CheckCircle2 className="h-3 w-3" /> AAL2 Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gold">
                        <AlertTriangle className="h-3 w-3" /> Não Configurado
                      </span>
                    )}
                  </Td>
                  <Td className="text-xs text-muted">
                    {admin.last_login_at
                      ? new Date(admin.last_login_at).toLocaleString("pt-BR")
                      : "Nunca acessou"}
                  </Td>
                  <Td>
                    {admin.status === "active" ? (
                      <Badge variant="green" dot>
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="amber" dot>
                        Pendente
                      </Badge>
                    )}
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditOpen(admin)}
                        className="text-xs text-muted hover:text-ink h-7 px-2"
                        title="Editar Administrador"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAdminHistory(admin)}
                        className="text-xs text-green hover:underline h-7 px-2"
                        title="Ver Logs"
                      >
                        <History className="h-3.5 w-3.5" />
                      </Button>
                      {admin.email !== "diogosrodrigues92@gmail.com" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin.id, admin.display_name)}
                          className="text-xs text-red hover:bg-red/10 h-7 px-2"
                          title="Excluir Administrador"
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
        </CardContent>
      </Card>

      {/* Modal: Invite Admin */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Convidar Novo Administrador Master"
        description="O novo operador receberá um convite por e-mail e deverá configurar o MFA TOTP no primeiro acesso."
        size="md"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <Input
            label="Nome Completo *"
            placeholder="Ex: Dra. Patrícia Mendes"
            value={newAdminData.name}
            onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
            required
          />
          <Input
            label="E-mail Corporativo DM IA Studio *"
            type="email"
            placeholder="nome@dmiastudio.com"
            value={newAdminData.email}
            onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
            required
          />
          <Select
            label="Papel / Perfil de Acesso *"
            value={newAdminData.role}
            onChange={(e) => setNewAdminData({ ...newAdminData, role: e.target.value })}
          >
            <option value="platform_operations">Operações & Infraestrutura</option>
            <option value="platform_security_admin">Administrador de Segurança</option>
            <option value="platform_support">Suporte Nível 3 (JIT)</option>
            <option value="platform_auditor">Auditor de Conformidade</option>
            <option value="platform_super_admin">Super Administrador</option>
          </Select>

          <div className="rounded border border-line bg-paper/50 p-3 text-xs space-y-1">
            <span className="font-bold text-ink block flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-green" /> Exigência de MFA
            </span>
            <p className="text-muted text-[11px]">
              O sistema aplicará <code>mfa_required = true</code> automaticamente. O acesso a rotas administrativas será liberado somente após pareamento do aplicativo autenticador.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsInviteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Enviar Convite
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Permissions Matrix */}
      <Modal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        title="Matriz de Papéis e Permissões (RBAC)"
        description="Regras de autorização por perfil de operador no Control Plane"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ROLES_INFO.map((r) => (
              <div key={r.code} className="border border-line rounded-lg p-3 bg-paper/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-ink">{r.name}</span>
                  <code className="text-[10px] text-muted font-mono">{r.code}</code>
                </div>
                <p className="text-[11px] text-muted">{r.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded border border-line p-3 bg-mint/30 text-xs">
            <strong className="text-green">Princípio do Menor Privilégio:</strong> Operadores com perfil de suporte não possuem acesso direto a bancos operacionais. O acesso pontual para diagnóstico depende de solicitação JIT aprovada por perfil de segurança.
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={() => setIsPermissionsModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Admin Access Log History */}
      <Modal
        isOpen={!!selectedAdminHistory}
        onClose={() => setSelectedAdminHistory(null)}
        title={`Histórico de Acesso — ${selectedAdminHistory?.display_name}`}
        description="Registro dos últimos logins e parâmetros de sessão"
        size="md"
      >
        {selectedAdminHistory && (
          <div className="space-y-3 text-xs">
            <div className="rounded border border-line p-3 bg-paper/40 space-y-2">
              <div className="flex justify-between border-b border-line pb-1.5">
                <span className="text-muted">E-mail:</span>
                <span className="font-mono font-bold text-ink">{selectedAdminHistory.email}</span>
              </div>
              <div className="flex justify-between border-b border-line pb-1.5">
                <span className="text-muted">Papel no Sistema:</span>
                <span className="font-bold text-ink">{selectedAdminHistory.role}</span>
              </div>
              <div className="flex justify-between border-b border-line pb-1.5">
                <span className="text-muted">Último Login:</span>
                <span className="font-medium text-ink">
                  {selectedAdminHistory.last_login_at
                    ? new Date(selectedAdminHistory.last_login_at).toLocaleString("pt-BR")
                    : "Sem registro"}
                </span>
              </div>
              <div className="flex justify-between border-b border-line pb-1.5">
                <span className="text-muted">IP & Localidade:</span>
                <span className="font-mono text-ink">{selectedAdminHistory.ipLastLogin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Método de Validação:</span>
                <span className="font-semibold text-green">{selectedAdminHistory.mfaMethod}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setSelectedAdminHistory(null)}>
                OK
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Edit Admin Profile & Access */}
      <Modal
        isOpen={!!editingAdmin}
        onClose={() => setEditingAdmin(null)}
        title="Editar Perfil e Acessos do Administrador"
        description="Altere o nome de exibição, foto ou papel de governança deste operador."
        size="md"
      >
        {editingAdmin && (
          <form onSubmit={handleEditSave} className="space-y-4">
            <Input
              label="Nome de Exibição *"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
            <Input
              label="E-mail (Inalterável)"
              value={editingAdmin.email}
              disabled
              className="bg-muted-bg cursor-not-allowed opacity-75 font-mono"
            />
            <Select
              label="Papel / Perfil de Acesso *"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
            >
              <option value="platform_super_admin">Super Administrador</option>
              <option value="platform_operations">Operações & Infraestrutura</option>
              <option value="platform_security_admin">Administrador de Segurança</option>
              <option value="platform_support">Suporte Nível 3 (JIT)</option>
              <option value="platform_auditor">Auditor de Conformidade</option>
            </Select>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditingAdmin(null)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Salvar Alterações
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </MasterShell>
  );
}
