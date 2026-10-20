import React from 'react';
import {
  Users,
  Car,
  Clock,
  CheckCircle2,
  DollarSign,
  Plus,
  ArrowRight,
  AlertTriangle,
  Wrench,
  Sparkles,
  Kanban,
} from 'lucide-react';
import {
  Cliente,
  Veiculo,
  Servico,
  STATUS_CONFIG,
  STATUS_LIST,
  formatCurrency,
  formatDate,
  getDaysSinceEntry,
} from '../types/crm';
import { ActiveTab } from './Navbar';

interface DashboardViewProps {
  clientes: Cliente[];
  veiculos: Veiculo[];
  servicos: Servico[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewClient: () => void;
  onOpenNewVehicle: () => void;
  onOpenNewService: () => void;
  onSelectClientForHistory: (cliente: Cliente) => void;
  onSelectServiceForEdit: (servico: Servico) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  clientes,
  veiculos,
  servicos,
  setActiveTab,
  onOpenNewClient,
  onOpenNewVehicle,
  onOpenNewService,
  onSelectClientForHistory,
  onSelectServiceForEdit,
}) => {
  // Cálculos dos indicadores
  const totalClientes = clientes.length;
  const totalVeiculos = veiculos.length;

  // Serviços em andamento: qualquer status diferente de 'Concluído' e 'Entregue'
  const servicosEmAndamento = servicos.filter(
    (s) => s.status !== 'Concluído' && s.status !== 'Entregue'
  ).length;

  // Serviços concluídos no mês atual (considera 'Concluído' e 'Entregue' com data_conclusao no mês vigente)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const servicosConcluidosNoMesList = servicos.filter((s) => {
    if (s.status !== 'Concluído' && s.status !== 'Entregue') return false;
    const refDate = s.data_conclusao ? new Date(s.data_conclusao) : new Date(s.data_entrada);
    return refDate.getMonth() === currentMonth && refDate.getFullYear() === currentYear;
  });

  const servicosConcluidosMes = servicosConcluidosNoMesList.length;

  // Valor faturado/concluído no mês
  const valorConcluidoMes = servicosConcluidosNoMesList.reduce(
    (sum, s) => sum + (Number(s.valor) || 0),
    0
  );

  // Serviços que demandam atenção (em andamento há mais de 3 dias ou aguardando aprovação)
  const servicosAtencao = servicos
    .filter((s) => s.status !== 'Concluído' && s.status !== 'Entregue')
    .sort((a, b) => getDaysSinceEntry(b.data_entrada) - getDaysSinceEntry(a.data_entrada))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas AutoMax */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700/80 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950">
                Oficina AutoMax
              </span>
              <span className="text-xs text-slate-400">
                {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Painel de Controle Operacional
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Fim das anotações em papel: acompanhe clientes, veículos e o fluxo de ordens de serviço em tempo real sincronizado ao Supabase.
            </p>
          </div>

          {/* Atalhos Rápidos no Banner */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenNewClient}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-600 flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-4 h-4 text-amber-400" />
              + Cliente
            </button>
            <button
              onClick={onOpenNewVehicle}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-600 flex items-center gap-1.5 transition-colors"
            >
              <Car className="w-4 h-4 text-amber-400" />
              + Veículo
            </button>
            <button
              onClick={onOpenNewService}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              Abrir O.S.
            </button>
          </div>
        </div>
      </div>

      {/* 5 Indicadores Principais (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Clientes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total de Clientes
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-800">{totalClientes}</span>
            <p className="text-xs text-slate-500 mt-1">Cadastrados no sistema</p>
          </div>
        </div>

        {/* Card 2: Total Veículos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total de Veículos
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-800">{totalVeiculos}</span>
            <p className="text-xs text-slate-500 mt-1">Frota atendida</p>
          </div>
        </div>

        {/* Card 3: Serviços em Andamento */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Em Andamento
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-amber-600">{servicosEmAndamento}</span>
            <p className="text-xs text-slate-500 mt-1">No pátio ou oficina</p>
          </div>
        </div>

        {/* Card 4: Concluídos no Mês */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Concluídos no Mês
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-600">{servicosConcluidosMes}</span>
            <p className="text-xs text-slate-500 mt-1">Neste mês corrente</p>
          </div>
        </div>

        {/* Card 5: Valor Concluído no Mês */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Faturado no Mês
            </span>
            <div className="p-2.5 rounded-xl bg-green-50 text-green-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-slate-900 truncate block">
              {formatCurrency(valorConcluidoMes)}
            </span>
            <p className="text-xs text-slate-500 mt-1">Serviços finalizados</p>
          </div>
        </div>
      </div>

      {/* Seção Central: Distribuição do Kanban & Alertas de Pátio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por Status */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Kanban className="w-4 h-4 text-amber-500" />
              Fluxo da Oficina
            </h2>
            <button
              onClick={() => setActiveTab('kanban')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Ver Kanban <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {STATUS_LIST.map((st) => {
              const count = servicos.filter((s) => s.status === st).length;
              const config = STATUS_CONFIG[st];
              const percent = servicos.length > 0 ? (count / servicos.length) * 100 : 0;

              return (
                <div key={st} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
                      {st}
                    </span>
                    <span className="font-bold text-slate-900">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${config.dotColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('kanban')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Kanban className="w-3.5 h-3.5 text-amber-400" />
              Abrir Quadro Kanban
            </button>
          </div>
        </div>

        {/* Atenção no Pátio: Serviços em andamento mais antigos */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Atenção no Pátio (Em Andamento)
              </h2>
              <p className="text-xs text-slate-500">
                Veículos em serviço ordenados pelo tempo de permanência na oficina
              </p>
            </div>
            <button
              onClick={onOpenNewService}
              className="text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova O.S.
            </button>
          </div>

          {servicosAtencao.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-700">Tudo em dia!</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Nenhum veículo em andamento pendente no pátio no momento.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {servicosAtencao.map((serv) => {
                const dias = getDaysSinceEntry(serv.data_entrada);
                const statusCfg = STATUS_CONFIG[serv.status];

                return (
                  <div
                    key={serv.id}
                    onClick={() => onSelectServiceForEdit(serv)}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 p-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700">
                          {serv.veiculo_placa || 'PLACA'}
                        </span>
                        <span className="font-semibold text-sm text-slate-900">
                          {serv.veiculo_modelo || 'Veículo'}
                        </span>
                        <span className="text-xs text-slate-500">• {serv.cliente_nome}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">{serv.descricao}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Dias no pátio */}
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                          dias >= 3
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {dias === 0 ? 'Entrou hoje' : `${dias} dia${dias > 1 ? 's' : ''}`}
                      </span>

                      {/* Status badge */}
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusCfg.bgBadge}`}
                      >
                        {serv.status}
                      </span>

                      <span className="text-xs font-bold text-slate-900">
                        {formatCurrency(serv.valor)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Assistente Inteligente AutoMax Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 rounded-2xl p-5 border border-amber-300/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Assistente de Diagnóstico Mecânico Inteligente
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Recebeu um carro com sintomas complexos? Use o raciocínio mecânico da IA para investigar códigos de erro OBD-II, ruídos, tempo estimado de mão de obra e orçamento preliminar.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('ia')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Wrench className="w-3.5 h-3.5 text-amber-400" />
          Abrir Diagnóstico IA
        </button>
      </div>
    </div>
  );
};
