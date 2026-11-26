"use client";

import React, { useState } from "react";
import { ClientShell } from "../../components/client-shell";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  FilterChip,
  Button,
  Modal,
  Input,
  Textarea,
} from "@gabinete360/ui";
import {
  HelpCircle,
  Plus,
  ThumbsUp,
  MessageCircle,
  Users,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

interface CommunityProposal {
  id: string;
  title: string;
  author: string;
  neighborhood: string;
  votes: number;
  status: "open" | "under_review" | "converted_to_pl";
  description: string;
}

const INITIAL_PROPOSALS: CommunityProposal[] = [
  {
    id: "prop-01",
    title: "Criação de Parque Pet Municipal na Orla da Praia",
    author: "Camila Guimarães",
    neighborhood: "Gonzaga",
    votes: 342,
    status: "converted_to_pl",
    description: "Espaço cercado com bebedouros e obstáculos de agility para socialização canina sem risco aos banhistas.",
  },
  {
    id: "prop-02",
    title: "Ciclovia conectando a Zona Noroeste ao Centro Histórico",
    author: "Felipe Andrade",
    neighborhood: "Areia Branca",
    votes: 189,
    status: "under_review",
    description: "Interligação segura para os trabalhadores que utilizam bicicleta diariamente para acessar o centro.",
  },
  {
    id: "prop-03",
    title: "Horta Comunitária Urbana nos Terrenos Baldios do Município",
    author: "Tereza Cristina",
    neighborhood: "Marapé",
    votes: 95,
    status: "open",
    description: "Incentivo à agricultura urbana e hortaliças orgânicas para famílias em vulnerabilidade social.",
  },
];

export default function ParticipacaoPage() {
  const [proposals, setProposals] = useState<CommunityProposal[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [neighborhood, setNeighborhood] = useState("Gonzaga");
  const [description, setDescription] = useState("");

  const handleVote = (id: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, votes: p.votes + 1 } : p))
    );
  };

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) return;

    const newProp: CommunityProposal = {
      id: `prop-${Date.now()}`,
      title,
      author,
      neighborhood,
      votes: 1,
      status: "open",
      description,
    };

    setProposals([newProp, ...proposals]);
    setIsNewModalOpen(false);
    setTitle("");
    setAuthor("");
    setDescription("");
  };

  return (
    <ClientShell
      breadcrumbs={[
        { label: "Início", href: "/dashboard" },
        { label: "Participação Popular", current: true },
      ]}
      topbarActions={
        <Button variant="primary" size="sm" onClick={() => setIsNewModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nova Ideia Comunitária
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="bg-mint/40 border border-green/20 rounded-lg p-3 text-xs text-green flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span>
              <strong>Voz Cidadã e Consultas Públicas</strong> — Espaço para a comunidade sugerir, apoiar ideias e colaborar na construção de projetos de lei para o município.
            </span>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {proposals.map((p) => (
            <Card key={p.id} className="border-line flex flex-col justify-between p-4">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={p.status === "converted_to_pl" ? "green" : p.status === "under_review" ? "amber" : "neutral"}>
                    {p.status === "converted_to_pl" ? "Convertida em PL" : p.status === "under_review" ? "Em Análise pela Equipe" : "Aberta para Votos"}
                  </Badge>
                  <span className="text-xs font-bold text-green flex items-center gap-1 font-mono">
                    <ThumbsUp className="h-3 w-3" /> {p.votes}
                  </span>
                </div>

                <div className="font-semibold text-ink text-sm leading-tight">{p.title}</div>
                <p className="text-xs text-muted leading-relaxed line-clamp-3">{p.description}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-line space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted text-[11px]">
                  <span>Por: <strong>{p.author}</strong></span>
                  <span>{p.neighborhood}</span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => handleVote(p.id)}
                >
                  <ThumbsUp className="h-3.5 w-3.5 mr-1" /> Apoiar Proposta (+1)
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal Nova Ideia */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Enviar Sugestão Comunitária"
      >
        <form onSubmit={handleCreateProposal} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1">Título da Ideia / Proposta *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Instalação de lixeiras seletivas nas praias"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Seu Nome / Liderança *</label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ex.: Mariana Souza"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Bairro *</label>
              <Input
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ex.: Ponta da Praia"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Descrição e Justificativa</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explique como essa medida beneficia o bairro ou a cidade..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button variant="ghost" type="button" onClick={() => setIsNewModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Publicar Ideia
            </Button>
          </div>
        </form>
      </Modal>
    </ClientShell>
  );
}
