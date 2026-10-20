import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Clock,
  Calendar,
  DollarSign,
  User,
  Car,
  MoreVertical,
  Edit2,
  Trash2,
  History,
  CheckCircle2,
  AlertCircle,
  MoveRight,
} from 'lucide-react';
import {
  Servico,
  ServiceStatus,
  STATUS_LIST,
  STATUS_CONFIG,
  formatCurrency,
  formatDate,
  getDaysSinceEntry,
  Cliente,
} from '../types/crm';

interface KanbanViewProps {
  servicos: Servico[];
  clientes: Cliente[];
  onUpdateStatus: (id: string, newStatus: ServiceStatus) => Promise<void>;
  onOpenNewService: () => void;
  onEditService: (servico: Servico) => void;
  onDeleteService: (servico: Servico) => void;
  onSelectClientForHistory: (cliente: Cliente) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  servicos,
  clientes,
  onUpdateStatus,
  onOpenNewService,
  onEditService,
  onDeleteService,
  onSelectClientForHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');
  const [draggedServiceId, setDraggedServiceId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ServiceStatus | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filtros de busca por placa, cliente ou descrição
  const filteredServicos = servicos.filter((serv) => {
    const matchesSearch =
      (serv.cliente_nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (serv.veiculo_placa?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (serv.veiculo_modelo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (serv.descricao?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === 'todos' || serv.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedServiceId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: ServiceStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent, status: ServiceStatus) => {
    e.preventDefault();
    if (dragOverColumn === status) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: ServiceStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const serviceId = e.dataTransfer.getData('text/plain') || draggedServiceId;
    if (!serviceId) return;

    const serv = servicos.find((s) => s.id === serviceId);
    if (serv && serv.status !== targetStatus) {
      await onUpdateStatus(serviceId, targetStatus);
    }
    setDraggedServiceId(null);
  };

  // Encontra o objeto Cliente a partir do cliente_id do serviço
  const getClienteObj = (clienteId: string): Cliente | undefined => {
    return clientes.find((c) => c.id === clienteId);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Ferramentas: Busca, Filtro e Botão Nova O.S. */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Busca por placa, cliente ou descrição */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por placa, cliente ou descrição do serviço..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Filtro por Status */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-amber-500"
            >
              <option value="todos">Todos os Status ({servicos.length})</option>
              {STATUS_LIST.map((st) => (
                <option key={st} value={st}>
                  {st} ({servicos.filter((s) => s.status === st).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botão Nova O.S. */}
        <button
          onClick={onOpenNewService}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Nova O.S.</span>
        </button>
      </div>

      {/* Dica de uso do Kanban */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="flex items-center gap-1.5">
          <MoveRight className="w-3.5 h-3.5 text-amber-500" />
          Arraste o cartão para mudar de status ou use o menu suspenso (ideal no celular).
        </span>
        <span className="font-semibold text-slate-600">
          Total exibido: {filteredServicos.length} de {servicos.length}
        </span>
      </div>

      {/* Colunas do Kanban (Responsivo com rolagem horizontal em telas pequenas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
        {STATUS_LIST.map((status) => {
          const config = STATUS_CONFIG[status];
          const columnServices = filteredServicos.filter((s) => s.status === status);
          const isOver = dragOverColumn === status;

          return (
            <div
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={(e) => handleDragLeave(e, status)}
              onDrop={(e) => handleDrop(e, status)}
              className={`flex flex-col bg-slate-100/80 rounded-2xl border transition-all duration-200 min-h-[460px] ${
                isOver
                  ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/30'
                  : 'border-slate-200'
              }`}
            >
              {/* Cabeçalho da Coluna */}
              <div
                className={`p-3 rounded-t-2xl border-b flex items-center justify-between ${config.headerBg}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
                  <span className="text-xs font-bold tracking-tight text-slate-900">
                    {status}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-black px-2 py-0.5 rounded-full ${config.bgBadge}`}
                >
                  {columnServices.length}
                </span>
              </div>

              {/* Lista de Cartões */}
              <div className="p-2.5 space-y-3 flex-1">
                {columnServices.length === 0 ? (
                  <div
                    className={`h-32 flex flex-col items-center justify-center rounded-xl border border-dashed text-xs text-slate-400 p-2 text-center transition-colors ${
                      isOver ? 'border-amber-400 bg-amber-50' : 'border-slate-300'
                    }`}
                  >
                    {isOver ? (
                      <span className="text-amber-700 font-bold">Solte aqui para mover</span>
                    ) : (
                      <span>Nenhum serviço neste status</span>
                    )}
                  </div>
                ) : (
                  columnServices.map((serv) => {
                    const dias = getDaysSinceEntry(serv.data_entrada);
                    const cli = getClienteObj(serv.cliente_id);
                    const isMenuOpen = activeMenuId === serv.id;

                    return (
                      <div
                        key={serv.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, serv.id)}
                        className={`bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative group ${
                          draggedServiceId === serv.id ? 'opacity-40 scale-95' : 'opacity-100'
                        }`}
                      >
                        {/* Topo do Card: Placa & Modelo + Menu */}
                        <div className="flex items-start justify-between gap-1.5 mb-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Placa Padrão Mercosul / Brasil */}
                              <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700 tracking-wider shadow-xs">
                                {serv.veiculo_placa || 'PLACA'}
                              </span>
                              <span className="text-xs font-bold text-slate-800 line-clamp-1">
                                {serv.veiculo_modelo || 'Veículo'}
                              </span>
                            </div>
                            {serv.veiculo_marca && (
                              <p className="text-[10px] text-slate-400 font-medium">
                                {serv.veiculo_marca}
                              </p>
                            )}
                          </div>

                          {/* Botão de Menu de Ações / Status no Celular */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(isMenuOpen ? null : serv.id);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="Opções do serviço"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu Flutuante */}
                            {isMenuOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setActiveMenuId(null)}
                                />
                                <div className="absolute right-0 top-6 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs font-medium divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                                  <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400">
                                    Mover Status
                                  </div>
                                  <div className="py-1">
                                    {STATUS_LIST.map((st) => (
                                      <button
                                        key={st}
                                        onClick={async () => {
                                          setActiveMenuId(null);
                                          await onUpdateStatus(serv.id, st);
                                        }}
                                        disabled={serv.status === st}
                                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                                          serv.status === st
                                            ? 'text-amber-600 font-bold bg-amber-50/50'
                                            : 'text-slate-700'
                                        }`}
                                      >
                                        <span>{st}</span>
                                        {serv.status === st && (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        onEditService(serv);
                                      }}
                                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                                    >
                                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                      Editar Ordem
                                    </button>
                                    {cli && (
                                      <button
                                        onClick={() => {
                                          setActiveMenuId(null);
                                          onSelectClientForHistory(cli);
                                        }}
                                        className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                                      >
                                        <History className="w-3.5 h-3.5 text-slate-500" />
                                        Histórico do Cliente
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        onDeleteService(serv);
                                      }}
                                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-rose-600 hover:bg-rose-50"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                      Excluir Ordem
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Cliente */}
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                          <button
                            onClick={() => cli && onSelectClientForHistory(cli)}
                            className="flex items-center gap-1.5 hover:text-amber-600 font-medium truncate text-left"
                            title="Clique para ver histórico completo do cliente"
                          >
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{serv.cliente_nome || 'Cliente'}</span>
                          </button>
                          {serv.cliente_telefone && (
                            <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                              {serv.cliente_telefone}
                            </span>
                          )}
                        </div>

                        {/* Descrição do Serviço */}
                        <p className="text-xs text-slate-700 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-3">
                          {serv.descricao}
                        </p>

                        {/* Observações rápidas (se houver) */}
                        {serv.observacoes && (
                          <p className="text-[10px] text-slate-500 italic mb-2 line-clamp-1">
                            Obs: {serv.observacoes}
                          </p>
                        )}

                        {/* Rodapé do Card: Valor & Dias no Pátio */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                          {/* Valor formatado */}
                          <div className="font-extrabold text-slate-900 flex items-center">
                            <span className="text-amber-600 font-bold mr-0.5 text-[11px]">R$</span>
                            <span>{serv.valor ? serv.valor.toFixed(2).replace('.', ',') : '0,00'}</span>
                          </div>

                          {/* Dias desde a entrada */}
                          <div
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              dias >= 4 && serv.status !== 'Concluído' && serv.status !== 'Entregue'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                            title={`Entrada: ${formatDate(serv.data_entrada)}${
                              serv.data_conclusao ? ` | Conclusão: ${formatDate(serv.data_conclusao)}` : ''
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{dias === 0 ? 'Hoje' : `${dias}d`}</span>
                          </div>
                        </div>

                        {/* Seletor rápido de status direto no rodapé (para facilitar no mobile sem arrastar) */}
                        <div className="mt-2.5 pt-2 border-t border-dashed border-slate-100 sm:hidden">
                          <label className="text-[10px] text-slate-400 block mb-0.5">
                            Mudar status:
                          </label>
                          <select
                            value={serv.status}
                            onChange={(e) => onUpdateStatus(serv.id, e.target.value as ServiceStatus)}
                            className="w-full text-[11px] font-semibold py-1 px-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                          >
                            {STATUS_LIST.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
