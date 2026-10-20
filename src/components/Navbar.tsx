import React from 'react';
import {
  Wrench,
  LayoutDashboard,
  Kanban,
  Users,
  Car,
  Sparkles,
  Database,
  Plus,
  FileCode2,
} from 'lucide-react';

export type ActiveTab = 'painel' | 'kanban' | 'clientes' | 'veiculos' | 'ia';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewService: () => void;
  onOpenSupabaseConfig: () => void;
  onOpenExportModal: () => void;
  isSupabaseConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewService,
  onOpenSupabaseConfig,
  onOpenExportModal,
  isSupabaseConnected,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Marca */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white font-mono">
                  AUTO<span className="text-amber-400">MAX</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  CRM Oficina
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Gestão Integrada de Atendimentos & Serviços
              </p>
            </div>
          </div>

          {/* Navegação por Abas (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('painel')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'painel'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Painel
            </button>

            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'kanban'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Kanban className="w-4 h-4" />
              Serviços (Kanban)
            </button>

            <button
              onClick={() => setActiveTab('clientes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'clientes'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-4 h-4" />
              Clientes
            </button>

            <button
              onClick={() => setActiveTab('veiculos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'veiculos'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Car className="w-4 h-4" />
              Veículos
            </button>

            <button
              onClick={() => setActiveTab('ia')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'ia'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              IA Diagnóstico
            </button>
          </nav>

          {/* Ações Rápidas & Conexão */}
          <div className="flex items-center gap-2">
            {/* Status Supabase */}
            <button
              onClick={onOpenSupabaseConfig}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isSupabaseConnected
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
              }`}
              title="Configurar conexão do Supabase"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isSupabaseConnected ? 'Supabase Conectado' : 'Supabase Config'}
              </span>
            </button>

            {/* Exportar arquivo único index.html */}
            <button
              onClick={onOpenExportModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Baixar ou ver código do arquivo único index.html com CDN"
            >
              <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar index.html</span>
            </button>

            {/* Botão Novo Serviço */}
            <button
              onClick={onOpenNewService}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Nova O.S.</span>
            </button>
          </div>
        </div>

        {/* Barra de Navegação Mobile (Segunda Linha) */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800 scrollbar-none">
          <button
            onClick={() => setActiveTab('painel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'painel'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300 bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Painel
          </button>
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'kanban'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300 bg-slate-800/60'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            Kanban
          </button>
          <button
            onClick={() => setActiveTab('clientes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'clientes'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300 bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Clientes
          </button>
          <button
            onClick={() => setActiveTab('veiculos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'veiculos'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300 bg-slate-800/60'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            Veículos
          </button>
          <button
            onClick={() => setActiveTab('ia')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'ia'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-300 bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            IA Diagnóstico
          </button>
        </div>
      </div>
    </header>
  );
};
