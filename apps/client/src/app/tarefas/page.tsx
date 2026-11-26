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
  Avatar,
  Modal,
  Input,
  Textarea,
  Select,
} from "@gabinete360/ui";
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { type DemoTask } from "../../lib/types/domain";

export default function TarefasPage() {
  const { organization } = useOrganization();
  const [tasks, setTasks] = useState<DemoTask[]>([]);

  useEffect(() => {
    if (!organization?.id) return;
    const supabase = createClient();
    supabase
      .from("tasks")
      .select("*")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setTasks(data as DemoTask[]);
      });
  }, [organization?.id]);
  const [filter, setFilter] = useState("all");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("Ana Souza");
  const [priority, setPriority] = useState("normal");
  const [deadline, setDeadline] = useState("Hoje");

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "completed") return t.status === "completed";
    if (filter === "pending") return t.status === "pending" || t.status === "in_progress";
    return t.status === filter;
  });

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === "completed" ? "in_progress" : "completed",
            }
          : t
      )
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newTask: DemoTask = {
      id: `task-${Date.now()}`,
      organization_id: "org-gabinete-mariana",
      workspace_id: "wks-santos-01",
      title,
      description: "Tarefa interna do gabinete parlamentar.",
      assigned_to: "usr-ana",
      assigned_name: assignedTo,
      status: "in_progress",
      priority: priority as any,
      due_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setIsNewModalOpen(false);
    setTitle("");
  };

  return (
    <ClientShell
      breadcrumbs={[
        { label: "Início", href: "/dashboard" },
        { label: "Tarefas da Equipe", current: true },
      ]}
      topbarActions={
        <Button variant="primary" size="sm" onClick={() => setIsNewModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nova Tarefa
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="bg-mint/40 border border-green/20 rounded-lg p-3 text-xs text-green flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            <span>
              <strong>Tarefas e Fluxos Internos do Gabinete</strong> — Distribuição de responsabilidades, prazos de ofícios e acompanhamento de providências.
            </span>
          </div>

        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 text-xs">
          <FilterChip label={`Todas (${tasks.length})`} active={filter === "all"} onClick={() => setFilter("all")} />
          <FilterChip
            label={`Pendentes (${tasks.filter((t) => t.status !== "completed").length})`}
            active={filter === "pending"}
            onClick={() => setFilter("pending")}
          />
          <FilterChip
            label={`Concluídas (${tasks.filter((t) => t.status === "completed").length})`}
            active={filter === "completed"}
            onClick={() => setFilter("completed")}
          />
        </div>

        {/* Lista de Tarefas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((t) => (
            <Card key={t.id} className="border-line p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={t.status === "completed"}
                    onChange={() => toggleTaskStatus(t.id)}
                    className="mt-1 h-4 w-4 text-green rounded border-line focus:ring-green cursor-pointer"
                  />
                  <div>
                    <div
                      className={`text-sm font-semibold text-ink leading-tight ${
                        t.status === "completed" ? "line-through text-muted" : ""
                      }`}
                    >
                      {t.title}
                    </div>
                    {t.description && (
                      <div className="text-xs text-muted mt-1">{t.description}</div>
                    )}
                  </div>
                </div>
                <Badge variant={t.priority === "urgent" ? "red" : t.priority === "high" ? "amber" : "neutral"}>
                  {t.priority}
                </Badge>
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Avatar name={t.assigned_name} size="xs" />
                  <span className="text-[11px] text-ink font-medium">{t.assigned_name}</span>
                </div>
                <div className="text-[11px] text-muted flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Prazo: Hoje
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal Nova Tarefa */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Criar Nova Tarefa para a Equipe"
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1">Título da Tarefa *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Redigir ofício à CET sobre sinalização"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Responsável *</label>
              <Select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                options={[
                  { value: "Ana Souza", label: "Ana Souza (Chefe de Gabinete)" },
                  { value: "Rafael Lima", label: "Rafael Lima (Assessor Jurídico)" },
                  { value: "Mariana Costa", label: "Mariana Costa (Vereadora)" },
                  { value: "Carlos Eduardo", label: "Carlos Eduardo (Comunicação)" },
                ]}
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Prioridade</label>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                options={[
                  { value: "normal", label: "Normal" },
                  { value: "high", label: "Alta" },
                  { value: "urgent", label: "Urgente" },
                ]}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button variant="ghost" type="button" onClick={() => setIsNewModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Criar Tarefa
            </Button>
          </div>
        </form>
      </Modal>
    </ClientShell>
  );
}
