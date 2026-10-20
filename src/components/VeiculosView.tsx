import React, { useState } from 'react';
import {
  Car,
  Search,
  Plus,
  User,
  Wrench,
  Edit2,
  Trash2,
  History,
  Gauge,
  Palette,
  Calendar,
} from 'lucide-react';
import { Veiculo, Cliente, Servico } from '../types/crm';

interface VeiculosViewProps {
  veiculos: Veiculo[];
  clientes: Cliente[];
  servicos: Servico[];
  onOpenNewVehicle: () => void;
  onEditVehicle: (veiculo: Veiculo) => void;
  onDeleteVehicle: (veiculo: Veiculo) => void;
  onOpenNewServiceForVehicle: (veiculo: Veiculo) => void;
  onSelectClientForHistory: (cliente: Cliente) => void;
}

export const VeiculosView: React.FC<VeiculosViewProps> = ({
  veiculos,
  clientes,
  servicos,
  onOpenNewVehicle,
  onEditVehicle,
  onDeleteVehicle,
  onOpenNewServiceForVehicle,
  onSelectClientForHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Busca por placa (Requisito 2), modelo, marca ou cliente
  const filteredVeiculos = veiculos.filter((v) => {
    const term = searchTerm.toLowerCase();
    const placaClean = v.placa.toLowerCase().replace(/[^a-z0-9]/g, '');
    const searchClean = term.replace(/[^a-z0-9]/g, '');

    const placaMatches = v.placa.toLowerCase().includes(term) || (searchClean && placaClean.includes(searchClean));
    const modeloMatches = (v.modelo || '').toLowerCase().includes(term);
    const marcaMatches = (v.marca || '').toLowerCase().includes(term);
    const clienteMatches = (v.cliente_nome || '').toLowerCase().includes(term);

    return placaMatches || modeloMatches || marcaMatches || clienteMatches;
  });

  const getClienteObj = (clienteId: string): Cliente | undefined => {
    return clientes.find((c) => c.id === clienteId);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Busca e Botão Novo Veículo */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar veículo por placa (ex: BRA2E19), modelo ou cliente..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
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

        <button
          onClick={onOpenNewVehicle}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Veículo</span>
        </button>
      </div>

      {/* Contador de Veículos */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Mostrando {filteredVeiculos.length} de {veiculos.length} veículos</span>
        {searchTerm && (
          <span className="text-amber-600 font-medium">Filtrado por: "{searchTerm}"</span>
        )}
      </div>

      {/* Grid de Veículos */}
      {filteredVeiculos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Nenhum veículo encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchTerm
              ? 'Nenhum veículo encontrado com a placa ou dados digitados.'
              : 'Cadastre os veículos dos seus clientes para iniciar o controle de manutenções.'}
          </p>
          <button
            onClick={onOpenNewVehicle}
            className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Cadastrar Veículo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVeiculos.map((veiculo) => {
            const cli = getClienteObj(veiculo.cliente_id);
            const servicosVeiculo = servicos.filter((s) => s.veiculo_id === veiculo.id);

            return (
              <div
                key={veiculo.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Topo: Placa Estilizada e Ações */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="space-y-1">
                      <div className="inline-flex items-center rounded-lg bg-slate-950 text-amber-400 border border-slate-800 shadow-inner px-3 py-1">
                        <span className="font-mono text-sm font-black tracking-widest">
                          {veiculo.placa}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {veiculo.marca} {veiculo.modelo}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditVehicle(veiculo)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Editar veículo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteVehicle(veiculo)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Excluir veículo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Proprietário / Cliente Vinculado */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                          Proprietário
                        </span>
                        <span className="text-xs font-bold text-slate-800 truncate block">
                          {cli?.nome || veiculo.cliente_nome || 'Cliente não identificado'}
                        </span>
                      </div>
                    </div>

                    {cli && (
                      <button
                        onClick={() => onSelectClientForHistory(cli)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-white transition-colors shrink-0"
                        title="Ver histórico do cliente"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Ficha Técnica Rápida */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 mb-4">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100/80">
                      <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                        <Calendar className="w-3 h-3" /> Ano
                      </div>
                      <span className="font-bold text-slate-800 block mt-0.5">
                        {veiculo.ano || '—'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100/80">
                      <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                        <Palette className="w-3 h-3" /> Cor
                      </div>
                      <span className="font-bold text-slate-800 block mt-0.5 truncate">
                        {veiculo.cor || '—'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100/80">
                      <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                        <Gauge className="w-3 h-3" /> Km
                      </div>
                      <span className="font-bold text-slate-800 block mt-0.5 truncate">
                        {veiculo.km_atual ? `${veiculo.km_atual.toLocaleString('pt-BR')} km` : '0 km'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rodapé: Ação de Abrir O.S. Direta */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    {servicosVeiculo.length} O.S. já aberta{servicosVeiculo.length !== 1 ? 's' : ''}
                  </span>

                  <button
                    onClick={() => onOpenNewServiceForVehicle(veiculo)}
                    className="py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>Abrir O.S.</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
