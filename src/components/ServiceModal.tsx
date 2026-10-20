import React, { useState, useEffect } from 'react';
import {
  X,
  Wrench,
  User,
  Car,
  DollarSign,
  FileText,
  Clock,
  Calendar,
  AlertCircle,
  Plus,
} from 'lucide-react';
import {
  Cliente,
  Veiculo,
  Servico,
  ServiceStatus,
  STATUS_LIST,
  STATUS_CONFIG,
} from '../types/crm';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    cliente_id: string;
    veiculo_id: string;
    descricao: string;
    valor: number;
    status: ServiceStatus;
    data_entrada?: string;
    data_conclusao?: string | null;
    observacoes?: string | null;
  }) => Promise<void>;
  editingServico?: Servico | null;
  initialClienteId?: string;
  initialVeiculoId?: string;
  clientes: Cliente[];
  veiculos: Veiculo[];
  onOpenNewVehicleForClient: (cliente: Cliente) => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingServico,
  initialClienteId,
  initialVeiculoId,
  clientes,
  veiculos,
  onOpenNewVehicleForClient,
}) => {
  const [clienteId, setClienteId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valorStr, setValorStr] = useState('');
  const [status, setStatus] = useState<ServiceStatus>('Aguardando');
  const [observacoes, setObservacoes] = useState('');
  const [dataEntrada, setDataEntrada] = useState('');
  const [dataConclusao, setDataConclusao] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializa ou reseta formulário
  useEffect(() => {
    if (editingServico) {
      setClienteId(editingServico.cliente_id);
      setVeiculoId(editingServico.veiculo_id);
      setDescricao(editingServico.descricao);
      setValorStr(editingServico.valor ? editingServico.valor.toString() : '');
      setStatus(editingServico.status);
      setObservacoes(editingServico.observacoes || '');
      setDataEntrada(
        editingServico.data_entrada
          ? new Date(editingServico.data_entrada).toISOString().slice(0, 16)
          : ''
      );
      setDataConclusao(
        editingServico.data_conclusao
          ? new Date(editingServico.data_conclusao).toISOString().slice(0, 16)
          : ''
      );
    } else {
      const cId = initialClienteId || (clientes.length > 0 ? clientes[0].id : '');
      setClienteId(cId);

      // Veículos do cliente selecionado
      const clientVehicles = veiculos.filter((v) => v.cliente_id === cId);
      const vId = initialVeiculoId || (clientVehicles.length > 0 ? clientVehicles[0].id : '');
      setVeiculoId(vId);

      setDescricao('');
      setValorStr('');
      setStatus('Aguardando');
      setObservacoes('');
      setDataEntrada(new Date().toISOString().slice(0, 16));
      setDataConclusao('');
    }
    setErrorMsg('');
  }, [editingServico, initialClienteId, initialVeiculoId, isOpen, clientes]);

  if (!isOpen) return null;

  // Ao alterar o cliente, filtra os veículos correspondentes
  const availableVehicles = veiculos.filter((v) => v.cliente_id === clienteId);
  const selectedCliente = clientes.find((c) => c.id === clienteId);

  const handleClienteChange = (newClienteId: string) => {
    setClienteId(newClienteId);
    const newVehicles = veiculos.filter((v) => v.cliente_id === newClienteId);
    if (newVehicles.length > 0) {
      setVeiculoId(newVehicles[0].id);
    } else {
      setVeiculoId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!clienteId) {
      setErrorMsg('Selecione um cliente para a ordem de serviço.');
      return;
    }

    if (!veiculoId) {
      setErrorMsg('Selecione um veículo vinculado ao cliente. Se o cliente não tem veículo, cadastre um primeiro.');
      return;
    }

    if (!descricao.trim()) {
      setErrorMsg('Informe a descrição do serviço a ser realizado.');
      return;
    }

    const valorNum = parseFloat(valorStr.replace(',', '.')) || 0;
    if (valorNum < 0) {
      setErrorMsg('O valor do serviço não pode ser negativo.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: editingServico?.id,
        cliente_id: clienteId,
        veiculo_id: veiculoId,
        descricao: descricao.trim(),
        valor: valorNum,
        status,
        data_entrada: dataEntrada ? new Date(dataEntrada).toISOString() : new Date().toISOString(),
        data_conclusao: status === 'Concluído' || status === 'Entregue'
          ? (dataConclusao ? new Date(dataConclusao).toISOString() : new Date().toISOString())
          : null,
        observacoes: observacoes.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar ordem de serviço.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Cabeçalho */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {editingServico ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço (O.S.)'}
              </h2>
              <p className="text-xs text-slate-400">
                {editingServico ? 'Atualize o status ou detalhes do atendimento' : 'Vincule cliente, veículo e serviços da AutoMax'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Seleção do Cliente (Requisito 3) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-500" />
              Cliente *
            </label>
            <select
              value={clienteId}
              onChange={(e) => handleClienteChange(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500"
              required
            >
              <option value="">Selecione o cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} {c.telefone ? `(${c.telefone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Seleção do Veículo do Cliente (Requisito 3) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-amber-500" />
                Veículo do Cliente *
              </label>

              {selectedCliente && (
                <button
                  type="button"
                  onClick={() => onOpenNewVehicleForClient(selectedCliente)}
                  className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Novo Veículo para este Cliente
                </button>
              )}
            </div>

            {availableVehicles.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                <span>Este cliente ainda não possui veículos cadastrados.</span>
                {selectedCliente && (
                  <button
                    type="button"
                    onClick={() => onOpenNewVehicleForClient(selectedCliente)}
                    className="font-bold underline text-amber-900"
                  >
                    Cadastrar Agora
                  </button>
                )}
              </div>
            ) : (
              <select
                value={veiculoId}
                onChange={(e) => setVeiculoId(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500"
                required
              >
                <option value="">Selecione o veículo...</option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    Placa: {v.placa} — {v.marca} {v.modelo} ({v.cor || 'Sem cor'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Descrição do Serviço (Requisito 3) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              Descrição dos Serviços e Peças *
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Troca de pastilhas de freio dianteiras, óleo sintético 5W30 e filtro de ar"
              rows={3}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Valor (R$) e Status (Requisito 3 e 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                Valor Total (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valorStr}
                onChange={(e) => setValorStr(e.target.value)}
                placeholder="0.00"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Status Atual *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceStatus)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
              >
                {STATUS_LIST.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data de Entrada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                Data de Entrada
              </label>
              <input
                type="datetime-local"
                value={dataEntrada}
                onChange={(e) => setDataEntrada(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            {(status === 'Concluído' || status === 'Entregue') && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  Data de Conclusão (Requisito 4)
                </label>
                <input
                  type="datetime-local"
                  value={dataConclusao}
                  onChange={(e) => setDataConclusao(e.target.value)}
                  className="w-full py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Observações Técnicas / Garantia / Peças Fornecidas
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Peças com garantia de 90 dias. Cliente autorizou via WhatsApp."
              rows={2}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availableVehicles.length === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-amber-500/20"
            >
              {isSubmitting ? 'Salvando...' : editingServico ? 'Salvar Alterações' : 'Abrir Ordem de Serviço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
