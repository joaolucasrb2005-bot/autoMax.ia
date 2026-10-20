import React, { useState, useEffect } from 'react';
import { X, Car, User, Palette, Gauge, Calendar, AlertCircle } from 'lucide-react';
import { Veiculo, Cliente } from '../types/crm';

interface VeiculoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    cliente_id: string;
    placa: string;
    marca: string;
    modelo: string;
    ano?: string | number | null;
    cor?: string | null;
    km_atual?: number | null;
  }) => Promise<void>;
  editingVeiculo?: Veiculo | null;
  initialClienteId?: string;
  clientes: Cliente[];
}

export const VeiculoModal: React.FC<VeiculoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingVeiculo,
  initialClienteId,
  clientes,
}) => {
  const [clienteId, setClienteId] = useState('');
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [cor, setCor] = useState('');
  const [kmAtualStr, setKmAtualStr] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingVeiculo) {
      setClienteId(editingVeiculo.cliente_id);
      setPlaca(editingVeiculo.placa);
      setMarca(editingVeiculo.marca);
      setModelo(editingVeiculo.modelo);
      setAno(editingVeiculo.ano ? editingVeiculo.ano.toString() : '');
      setCor(editingVeiculo.cor || '');
      setKmAtualStr(editingVeiculo.km_atual ? editingVeiculo.km_atual.toString() : '0');
    } else {
      setClienteId(initialClienteId || (clientes.length > 0 ? clientes[0].id : ''));
      setPlaca('');
      setMarca('');
      setModelo('');
      setAno(new Date().getFullYear().toString());
      setCor('');
      setKmAtualStr('');
    }
    setErrorMsg('');
  }, [editingVeiculo, initialClienteId, isOpen, clientes]);

  if (!isOpen) return null;

  // Formatação de placa (caixa alta e sem caracteres estranhos)
  const handlePlacaChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
    setPlaca(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!clienteId) {
      setErrorMsg('Selecione o cliente proprietário do veículo.');
      return;
    }

    if (!placa.trim() || placa.trim().length < 7) {
      setErrorMsg('Informe uma placa válida com 7 caracteres (ex: ABC1234 ou BRA2E19).');
      return;
    }

    if (!marca.trim()) {
      setErrorMsg('A marca do veículo é obrigatória (ex: Chevrolet, Honda, Fiat).');
      return;
    }

    if (!modelo.trim()) {
      setErrorMsg('O modelo do veículo é obrigatório (ex: Onix 1.0, Civic EXL).');
      return;
    }

    const kmNum = kmAtualStr ? parseInt(kmAtualStr, 10) : 0;
    if (isNaN(kmNum) || kmNum < 0) {
      setErrorMsg('A quilometragem informada deve ser um número válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: editingVeiculo?.id,
        cliente_id: clienteId,
        placa: placa.trim().toUpperCase(),
        marca: marca.trim(),
        modelo: modelo.trim(),
        ano: ano.trim() || null,
        cor: cor.trim() || null,
        km_atual: kmNum,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao salvar veículo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Cabeçalho */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {editingVeiculo ? 'Editar Veículo' : 'Novo Veículo da Frota'}
              </h2>
              <p className="text-xs text-slate-400">
                Vincule o veículo ao cliente com controle de placa única
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

          {/* Cliente Proprietário */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-500" />
              Cliente Proprietário *
            </label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
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

          {/* Placa e Marca */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-amber-500" />
                Placa (Única) *
              </label>
              <input
                type="text"
                value={placa}
                onChange={(e) => handlePlacaChange(e.target.value)}
                placeholder="ABC1234 ou BRA2E19"
                maxLength={7}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-slate-900 focus:outline-none focus:border-amber-500"
                required
              />
              <span className="text-[10px] text-slate-400 block">
                7 caracteres (Mercosul ou Tradicional)
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Marca / Montadora *</label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ex: Honda, Toyota, Fiat"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Modelo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Modelo e Versão *</label>
            <input
              type="text"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="Ex: Civic EXL 2.0 Automático"
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Ano, Cor e Km Atual */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-500" />
                Ano
              </label>
              <input
                type="text"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                placeholder="2022"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Palette className="w-3 h-3 text-amber-500" />
                Cor
              </label>
              <input
                type="text"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                placeholder="Prata"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-amber-500" />
                Km Atual
              </label>
              <input
                type="number"
                min="0"
                value={kmAtualStr}
                onChange={(e) => setKmAtualStr(e.target.value)}
                placeholder="45000"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Botões */}
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
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-amber-500/20"
            >
              {isSubmitting ? 'Salvando...' : editingVeiculo ? 'Salvar Alterações' : 'Cadastrar Veículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
