import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Car,
  Wrench,
  Edit2,
  Trash2,
  History,
  FileText,
  Calendar,
} from 'lucide-react';
import { Cliente, Veiculo, Servico, formatDate } from '../types/crm';

interface ClientesViewProps {
  clientes: Cliente[];
  veiculos: Veiculo[];
  servicos: Servico[];
  onOpenNewClient: () => void;
  onEditClient: (cliente: Cliente) => void;
  onDeleteClient: (cliente: Cliente) => void;
  onSelectClientForHistory: (cliente: Cliente) => void;
}

export const ClientesView: React.FC<ClientesViewProps> = ({
  clientes,
  veiculos,
  servicos,
  onOpenNewClient,
  onEditClient,
  onDeleteClient,
  onSelectClientForHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Busca por nome ou telefone (Requisito 1)
  const filteredClientes = clientes.filter((c) => {
    const term = searchTerm.toLowerCase();
    const nomeMatches = c.nome.toLowerCase().includes(term);
    const telefoneMatches = (c.telefone || '').replace(/\D/g, '').includes(term.replace(/\D/g, '')) ||
      (c.telefone || '').toLowerCase().includes(term);
    const emailMatches = (c.email || '').toLowerCase().includes(term);
    const cpfMatches = (c.cpf || '').includes(term);

    return nomeMatches || telefoneMatches || emailMatches || cpfMatches;
  });

  return (
    <div className="space-y-4">
      {/* Cabeçalho da Seção com Busca e Botão */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente por nome ou telefone..."
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
          onClick={onOpenNewClient}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Contador de Resultados */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Mostrando {filteredClientes.length} de {clientes.length} clientes</span>
        {searchTerm && (
          <span className="text-amber-600 font-medium">Filtrado por: "{searchTerm}"</span>
        )}
      </div>

      {/* Lista de Clientes */}
      {filteredClientes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Nenhum cliente encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchTerm
              ? 'Nenhum resultado corresponde à sua busca por nome ou telefone.'
              : 'Cadastre o primeiro cliente da AutoMax para vincular veículos e ordens de serviço.'}
          </p>
          <button
            onClick={onOpenNewClient}
            className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Cadastrar Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClientes.map((cliente) => {
            const clientVehicles = veiculos.filter((v) => v.cliente_id === cliente.id);
            const clientServices = servicos.filter((s) => s.cliente_id === cliente.id);

            return (
              <div
                key={cliente.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Topo do Card */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                        {cliente.nome}
                      </h3>
                      {cliente.cpf && (
                        <span className="text-[11px] font-mono text-slate-400">
                          CPF: {cliente.cpf}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditClient(cliente)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Editar cliente"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteClient(cliente)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Excluir cliente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Informações de Contato */}
                  <div className="space-y-1.5 mb-4 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="font-semibold text-slate-800">{cliente.telefone}</span>
                    </div>

                    {cliente.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{cliente.email}</span>
                      </div>
                    )}

                    {cliente.observacoes && (
                      <p className="text-[11px] text-slate-500 italic line-clamp-2 pt-1 border-t border-slate-100">
                        "{cliente.observacoes}"
                      </p>
                    )}
                  </div>

                  {/* Badges de Veículos e Serviços */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Veículos
                      </span>
                      <span className="text-sm font-black text-slate-800 flex items-center justify-center gap-1">
                        <Car className="w-3.5 h-3.5 text-slate-400" />
                        {clientVehicles.length}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Atendimentos
                      </span>
                      <span className="text-sm font-black text-slate-800 flex items-center justify-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-slate-400" />
                        {clientServices.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rodapé: Botão de Ver Histórico Completo */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onSelectClientForHistory(cliente)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ver Histórico Completo</span>
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
