import React from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  FileText,
  Car,
  Wrench,
  Clock,
  Plus,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Hash,
} from 'lucide-react';
import {
  Cliente,
  Veiculo,
  Servico,
  STATUS_CONFIG,
  formatCurrency,
  formatDate,
  formatDateTime,
  getDaysSinceEntry,
} from '../types/crm';

interface ClienteHistoryModalProps {
  cliente: Cliente | null;
  veiculos: Veiculo[];
  servicos: Servico[];
  onClose: () => void;
  onOpenNewVehicleForClient: (cliente: Cliente) => void;
  onOpenNewServiceForClient: (cliente: Cliente) => void;
  onEditClient: (cliente: Cliente) => void;
}

export const ClienteHistoryModal: React.FC<ClienteHistoryModalProps> = ({
  cliente,
  veiculos,
  servicos,
  onClose,
  onOpenNewVehicleForClient,
  onOpenNewServiceForClient,
  onEditClient,
}) => {
  if (!cliente) return null;

  // Filtrar veículos pertencentes a este cliente
  const clientVehicles = veiculos.filter((v) => v.cliente_id === cliente.id);

  // Filtrar serviços deste cliente ordenados do mais recente para o mais antigo
  const clientServices = servicos
    .filter((s) => s.cliente_id === cliente.id)
    .sort((a, b) => new Date(b.data_entrada).getTime() - new Date(a.data_entrada).getTime());

  // Total gasto pelo cliente
  const totalGasto = clientServices.reduce((sum, s) => sum + (Number(s.valor) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Cabeçalho do Modal */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between border-b border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-xl font-bold shadow-md">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {cliente.nome}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 font-mono">
                  {clientVehicles.length} veículo{clientVehicles.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Cliente desde {formatDate(cliente.criado_em)} • Histórico Completo de Atendimentos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditClient(cliente)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Editar Dados
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo rolável */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Seção 1: Dados de Contato e Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Telefone
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {cliente.telefone || 'Não informado'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  E-mail
                </span>
                <span className="text-xs font-semibold text-slate-800 truncate block max-w-[170px]" title={cliente.email || ''}>
                  {cliente.email || 'Não informado'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Hash className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  CPF
                </span>
                <span className="text-xs font-semibold text-slate-800 font-mono">
                  {cliente.cpf || 'Não informado'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Investimento Total
                </span>
                <span className="text-xs font-black text-emerald-700">
                  {formatCurrency(totalGasto)}
                </span>
              </div>
            </div>

            {cliente.observacoes && (
              <div className="md:col-span-4 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Observações: </span>
                {cliente.observacoes}
              </div>
            )}
          </div>

          {/* Seção 2: Veículos Cadastrados do Cliente */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-500" />
                Veículos Cadastrados ({clientVehicles.length})
              </h3>
              <button
                onClick={() => onOpenNewVehicleForClient(cliente)}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                + Adicionar Veículo
              </button>
            </div>

            {clientVehicles.length === 0 ? (
              <div className="p-4 bg-amber-50/50 rounded-xl border border-dashed border-amber-200 text-center">
                <p className="text-xs font-semibold text-amber-800">
                  Nenhum veículo cadastrado para este cliente ainda.
                </p>
                <button
                  onClick={() => onOpenNewVehicleForClient(cliente)}
                  className="mt-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 px-3 py-1 rounded-md transition-colors inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Cadastrar Primeiro Veículo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {clientVehicles.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700">
                        {v.placa}
                      </span>
                      {v.ano && (
                        <span className="text-[10px] font-semibold text-slate-500">
                          Ano {v.ano}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-1">
                      {v.marca} {v.modelo}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>Cor: {v.cor || '—'}</span>
                      <span>{v.km_atual ? `${v.km_atual.toLocaleString('pt-BR')} km` : '0 km'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seção 3: Histórico de Atendimentos (Requisito 5: do mais recente para o mais antigo) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  Histórico de Serviços & Atendimentos ({clientServices.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Ordenado cronologicamente do mais recente para o mais antigo
                </p>
              </div>

              <button
                onClick={() => onOpenNewServiceForClient(cliente)}
                className="text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Ordem de Serviço
              </button>
            </div>

            {clientServices.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  Nenhum serviço registrado para este cliente até o momento.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Abra uma nova Ordem de Serviço vinculando um dos veículos cadastrados.
                </p>
              </div>
            ) : (
              <div className="relative pl-4 sm:pl-6 border-l-2 border-slate-200 space-y-4">
                {clientServices.map((serv, index) => {
                  const statusCfg = STATUS_CONFIG[serv.status];
                  const dias = getDaysSinceEntry(serv.data_entrada);

                  return (
                    <div key={serv.id} className="relative group">
                      {/* Marcador na Linha do Tempo */}
                      <div
                        className={`absolute -left-[23px] sm:-left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ring-2 ring-slate-200 ${statusCfg.dotColor}`}
                      />

                      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-sm transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700">
                              {serv.veiculo_placa || 'PLACA'}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {serv.veiculo_modelo || 'Veículo'}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusCfg.bgBadge}`}
                            >
                              {serv.status}
                            </span>
                          </div>

                          <div className="text-sm font-black text-slate-900">
                            {formatCurrency(serv.valor)}
                          </div>
                        </div>

                        {/* Descrição */}
                        <p className="text-xs text-slate-700 mb-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {serv.descricao}
                        </p>

                        {serv.observacoes && (
                          <p className="text-[11px] text-slate-500 italic mb-2">
                            Obs: {serv.observacoes}
                          </p>
                        )}

                        {/* Datas e prazos */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Entrada: {formatDate(serv.data_entrada)}</span>
                            {serv.data_conclusao && (
                              <span className="text-emerald-700 font-medium">
                                • Concluído em: {formatDate(serv.data_conclusao)}
                              </span>
                            )}
                          </div>

                          <span className="text-slate-400">
                            {dias === 0 ? 'Entrou hoje' : `Entrada há ${dias} dias`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Total de {clientServices.length} atendimento{clientServices.length !== 1 ? 's' : ''} no histórico
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Fechar Histórico
          </button>
        </div>
      </div>
    </div>
  );
};
