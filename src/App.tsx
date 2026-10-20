/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Navbar,
  ActiveTab,
} from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { KanbanView } from './components/KanbanView';
import { ClientesView } from './components/ClientesView';
import { VeiculosView } from './components/VeiculosView';
import { AIAssistantView } from './components/AIAssistantView';
import { ClienteModal } from './components/ClienteModal';
import { VeiculoModal } from './components/VeiculoModal';
import { ServiceModal } from './components/ServiceModal';
import { ClienteHistoryModal } from './components/ClienteHistoryModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { ExportSingleFileModal } from './components/ExportSingleFileModal';
import {
  Cliente,
  Veiculo,
  Servico,
  ServiceStatus,
} from './types/crm';
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  getVeiculos,
  createVeiculo,
  updateVeiculo,
  deleteVeiculo,
  getServicos,
  createServico,
  updateServico,
  updateServicoStatus,
  deleteServico,
  getSavedConfig,
  testConnection,
} from './lib/supabase';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Database,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('painel');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Sistema de Notificações / Toasts
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  };

  // Modais de Cadastro / Edição
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const [isVeiculoModalOpen, setIsVeiculoModalOpen] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);
  const [initialClienteIdForVeiculo, setInitialClienteIdForVeiculo] = useState<string | undefined>();

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [initialClienteIdForService, setInitialClienteIdForService] = useState<string | undefined>();
  const [initialVeiculoIdForService, setInitialVeiculoIdForService] = useState<string | undefined>();

  // Modal de Histórico do Cliente (Requisito 5)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedClienteForHistory, setSelectedClienteForHistory] = useState<Cliente | null>(null);

  // Modais de Configuração & Exportação
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Modal de Confirmação para Exclusão Segura
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
  });

  // Carregar todos os dados do banco
  const carregarDados = useCallback(async () => {
    setIsLoading(true);
    try {
      const conn = await testConnection();
      setIsSupabaseConnected(conn.success);

      const [cList, vList, sList] = await Promise.all([
        getClientes(),
        getVeiculos(),
        getServicos(),
      ]);

      setClientes(cList);
      setVeiculos(vList);
      setServicos(sList);
    } catch (err: any) {
      console.error('Erro ao buscar dados:', err);
      showToast(err.message || 'Falha ao sincronizar dados com o banco.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // ==================== OPERAÇÕES DE CLIENTES ====================
  const handleSaveCliente = async (data: {
    id?: string;
    nome: string;
    telefone: string;
    email?: string | null;
    cpf?: string | null;
    observacoes?: string | null;
  }) => {
    try {
      if (data.id) {
        await updateCliente(data.id, data);
        showToast('Cliente atualizado com sucesso!', 'success');
      } else {
        await createCliente({
          nome: data.nome,
          telefone: data.telefone,
          email: data.email || null,
          cpf: data.cpf || null,
          observacoes: data.observacoes || null,
        });
        showToast('Novo cliente cadastrado com sucesso!', 'success');
      }
      await carregarDados();
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar cliente', 'error');
      throw err;
    }
  };

  const handleDeleteCliente = (cliente: Cliente) => {
    const qtdVeiculos = veiculos.filter((v) => v.cliente_id === cliente.id).length;
    const qtdServicos = servicos.filter((s) => s.cliente_id === cliente.id).length;

    let warning = `Deseja realmente excluir o cliente "${cliente.nome}"?`;
    if (qtdVeiculos > 0 || qtdServicos > 0) {
      warning += ` ATENÇÃO: Este cliente possui ${qtdVeiculos} veículo(s) e ${qtdServicos} ordem(ns) de serviço que também serão excluídos.`;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Excluir Cliente',
      message: warning,
      onConfirm: async () => {
        try {
          await deleteCliente(cliente.id);
          showToast(`Cliente "${cliente.nome}" excluído.`, 'success');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await carregarDados();
        } catch (err: any) {
          showToast(err.message || 'Erro ao excluir cliente.', 'error');
        }
      },
    });
  };

  // ==================== OPERAÇÕES DE VEÍCULOS ====================
  const handleSaveVeiculo = async (data: {
    id?: string;
    cliente_id: string;
    placa: string;
    marca: string;
    modelo: string;
    ano?: string | number | null;
    cor?: string | null;
    km_atual?: number | null;
  }) => {
    try {
      if (data.id) {
        await updateVeiculo(data.id, data);
        showToast('Veículo atualizado com sucesso!', 'success');
      } else {
        await createVeiculo({
          cliente_id: data.cliente_id,
          placa: data.placa,
          marca: data.marca,
          modelo: data.modelo,
          ano: data.ano || null,
          cor: data.cor || null,
          km_atual: data.km_atual || 0,
        });
        showToast(`Veículo placa ${data.placa} cadastrado com sucesso!`, 'success');
      }
      await carregarDados();
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar veículo', 'error');
      throw err;
    }
  };

  const handleDeleteVeiculo = (veiculo: Veiculo) => {
    const qtdServicos = servicos.filter((s) => s.veiculo_id === veiculo.id).length;
    let warning = `Deseja realmente excluir o veículo placa "${veiculo.placa}" (${veiculo.modelo})?`;
    if (qtdServicos > 0) {
      warning += ` ATENÇÃO: Existem ${qtdServicos} ordem(ns) de serviço vinculadas a este veículo.`;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Excluir Veículo',
      message: warning,
      onConfirm: async () => {
        try {
          await deleteVeiculo(veiculo.id);
          showToast(`Veículo ${veiculo.placa} excluído com sucesso.`, 'success');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await carregarDados();
        } catch (err: any) {
          showToast(err.message || 'Erro ao excluir veículo.', 'error');
        }
      },
    });
  };

  // ==================== OPERAÇÕES DE SERVIÇOS (KANBAN) ====================
  const handleSaveServico = async (data: {
    id?: string;
    cliente_id: string;
    veiculo_id: string;
    descricao: string;
    valor: number;
    status: ServiceStatus;
    data_entrada?: string;
    data_conclusao?: string | null;
    observacoes?: string | null;
  }) => {
    try {
      if (data.id) {
        await updateServico(data.id, data);
        showToast('Ordem de serviço atualizada com sucesso!', 'success');
      } else {
        await createServico({
          cliente_id: data.cliente_id,
          veiculo_id: data.veiculo_id,
          descricao: data.descricao,
          valor: data.valor,
          status: data.status,
          data_entrada: data.data_entrada,
          observacoes: data.observacoes || null,
        });
        showToast('Ordem de serviço aberta com sucesso no pátio!', 'success');
      }
      await carregarDados();
    } catch (err: any) {
      showToast(err.message || 'Erro ao registrar serviço', 'error');
      throw err;
    }
  };

  const handleUpdateServicoStatus = async (id: string, newStatus: ServiceStatus) => {
    try {
      await updateServicoStatus(id, newStatus);
      showToast(`Status atualizado para "${newStatus}"!`, 'success');
      await carregarDados();
    } catch (err: any) {
      showToast(err.message || 'Erro ao mover status da ordem', 'error');
    }
  };

  const handleDeleteServico = (servico: Servico) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Ordem de Serviço',
      message: `Tem certeza que deseja excluir esta O.S. (${servico.descricao}) do veículo ${servico.veiculo_placa || ''}?`,
      onConfirm: async () => {
        try {
          await deleteServico(servico.id);
          showToast('Ordem de serviço excluída com sucesso.', 'success');
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await carregarDados();
        } catch (err: any) {
          showToast(err.message || 'Erro ao excluir ordem.', 'error');
        }
      },
    });
  };

  // Abertura de Modais com Contexto
  const openNewVehicleForClient = (cliente: Cliente) => {
    setEditingVeiculo(null);
    setInitialClienteIdForVeiculo(cliente.id);
    setIsVeiculoModalOpen(true);
  };

  const openNewServiceForClient = (cliente: Cliente) => {
    setEditingServico(null);
    setInitialClienteIdForService(cliente.id);
    const clientCars = veiculos.filter((v) => v.cliente_id === cliente.id);
    setInitialVeiculoIdForService(clientCars[0]?.id);
    setIsServiceModalOpen(true);
  };

  const openNewServiceForVehicle = (veiculo: Veiculo) => {
    setEditingServico(null);
    setInitialClienteIdForService(veiculo.cliente_id);
    setInitialVeiculoIdForService(veiculo.id);
    setIsServiceModalOpen(true);
  };

  const openNewServiceWithData = (data: {
    cliente_id?: string;
    veiculo_id?: string;
    descricao: string;
    valor?: number;
  }) => {
    setEditingServico({
      id: '',
      cliente_id: data.cliente_id || (clientes[0]?.id || ''),
      veiculo_id: data.veiculo_id || (veiculos[0]?.id || ''),
      descricao: data.descricao,
      valor: data.valor || 0,
      status: 'Aguardando',
      data_entrada: new Date().toISOString(),
      data_conclusao: null,
      observacoes: 'Gerado a partir do laudo do Assistente de Diagnóstico IA AutoMax.',
    });
    setIsServiceModalOpen(true);
  };

  const savedCfg = getSavedConfig();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notificações */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold text-white transition-all animate-in fade-in slide-in-from-bottom-5 duration-200 border">
          {toast.type === 'success' && (
            <div className="bg-emerald-600 border-emerald-500 flex items-center gap-2 px-3 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{toast.message}</span>
            </div>
          )}
          {toast.type === 'error' && (
            <div className="bg-rose-600 border-rose-500 flex items-center gap-2 px-3 py-2 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{toast.message}</span>
            </div>
          )}
          {toast.type === 'info' && (
            <div className="bg-slate-900 border-slate-700 flex items-center gap-2 px-3 py-2 rounded-xl">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{toast.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Cabeçalho & Barra de Navegação */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewService={() => {
          setEditingServico(null);
          setInitialClienteIdForService(undefined);
          setInitialVeiculoIdForService(undefined);
          setIsServiceModalOpen(true);
        }}
        onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* Banner de Aviso de Configuração do Supabase caso ainda não conectado */}
      {!isSupabaseConnected && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex flex-wrap items-center justify-between gap-2 border-b border-amber-600 shadow-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 shrink-0 text-slate-950" />
            <span>
              <strong>Modo de Demonstração AutoMax Ativo:</strong> Conecte sua URL e Chave Anon do Supabase para persistência remota no banco de dados.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="px-3 py-1 bg-slate-950 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Conectar Supabase
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3 py-1 bg-amber-400 text-slate-950 border border-slate-900 rounded-lg text-xs font-bold hover:bg-amber-300 transition-colors"
            >
              Exportar index.html
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal por Abas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {isLoading && (
          <div className="py-2 flex items-center justify-center gap-2 text-xs text-slate-500 mb-4 bg-white/60 p-2 rounded-xl border border-slate-200">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
            <span>Sincronizando com o banco de dados...</span>
          </div>
        )}

        {/* ABA: PAINEL (DASHBOARD) */}
        {activeTab === 'painel' && (
          <DashboardView
            clientes={clientes}
            veiculos={veiculos}
            servicos={servicos}
            setActiveTab={setActiveTab}
            onOpenNewClient={() => {
              setEditingCliente(null);
              setIsClienteModalOpen(true);
            }}
            onOpenNewVehicle={() => {
              setEditingVeiculo(null);
              setInitialClienteIdForVeiculo(undefined);
              setIsVeiculoModalOpen(true);
            }}
            onOpenNewService={() => {
              setEditingServico(null);
              setInitialClienteIdForService(undefined);
              setInitialVeiculoIdForService(undefined);
              setIsServiceModalOpen(true);
            }}
            onSelectClientForHistory={(cli) => {
              setSelectedClienteForHistory(cli);
              setIsHistoryModalOpen(true);
            }}
            onSelectServiceForEdit={(serv) => {
              setEditingServico(serv);
              setIsServiceModalOpen(true);
            }}
          />
        )}

        {/* ABA: KANBAN DE SERVIÇOS */}
        {activeTab === 'kanban' && (
          <KanbanView
            servicos={servicos}
            clientes={clientes}
            onUpdateStatus={handleUpdateServicoStatus}
            onOpenNewService={() => {
              setEditingServico(null);
              setInitialClienteIdForService(undefined);
              setInitialVeiculoIdForService(undefined);
              setIsServiceModalOpen(true);
            }}
            onEditService={(serv) => {
              setEditingServico(serv);
              setIsServiceModalOpen(true);
            }}
            onDeleteService={handleDeleteServico}
            onSelectClientForHistory={(cli) => {
              setSelectedClienteForHistory(cli);
              setIsHistoryModalOpen(true);
            }}
          />
        )}

        {/* ABA: CLIENTES */}
        {activeTab === 'clientes' && (
          <ClientesView
            clientes={clientes}
            veiculos={veiculos}
            servicos={servicos}
            onOpenNewClient={() => {
              setEditingCliente(null);
              setIsClienteModalOpen(true);
            }}
            onEditClient={(cli) => {
              setEditingCliente(cli);
              setIsClienteModalOpen(true);
            }}
            onDeleteClient={handleDeleteCliente}
            onSelectClientForHistory={(cli) => {
              setSelectedClienteForHistory(cli);
              setIsHistoryModalOpen(true);
            }}
          />
        )}

        {/* ABA: VEÍCULOS */}
        {activeTab === 'veiculos' && (
          <VeiculosView
            veiculos={veiculos}
            clientes={clientes}
            servicos={servicos}
            onOpenNewVehicle={() => {
              setEditingVeiculo(null);
              setInitialClienteIdForVeiculo(undefined);
              setIsVeiculoModalOpen(true);
            }}
            onEditVehicle={(vei) => {
              setEditingVeiculo(vei);
              setIsVeiculoModalOpen(true);
            }}
            onDeleteVehicle={handleDeleteVeiculo}
            onOpenNewServiceForVehicle={openNewServiceForVehicle}
            onSelectClientForHistory={(cli) => {
              setSelectedClienteForHistory(cli);
              setIsHistoryModalOpen(true);
            }}
          />
        )}

        {/* ABA: ASSISTENTE IA DE DIAGNÓSTICO MECÂNICO */}
        {activeTab === 'ia' && (
          <AIAssistantView
            veiculos={veiculos}
            clientes={clientes}
            onOpenNewServiceWithData={openNewServiceWithData}
          />
        )}
      </main>

      {/* ==================== MODAIS ==================== */}
      {/* Modal Cliente */}
      <ClienteModal
        isOpen={isClienteModalOpen}
        onClose={() => setIsClienteModalOpen(false)}
        onSave={handleSaveCliente}
        editingCliente={editingCliente}
      />

      {/* Modal Veículo */}
      <VeiculoModal
        isOpen={isVeiculoModalOpen}
        onClose={() => setIsVeiculoModalOpen(false)}
        onSave={handleSaveVeiculo}
        editingVeiculo={editingVeiculo}
        initialClienteId={initialClienteIdForVeiculo}
        clientes={clientes}
      />

      {/* Modal Ordem de Serviço */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSave={handleSaveServico}
        editingServico={editingServico}
        initialClienteId={initialClienteIdForService}
        initialVeiculoId={initialVeiculoIdForService}
        clientes={clientes}
        veiculos={veiculos}
        onOpenNewVehicleForClient={(cli) => {
          setIsServiceModalOpen(false);
          openNewVehicleForClient(cli);
        }}
      />

      {/* Modal Histórico do Cliente (Requisito 5) */}
      <ClienteHistoryModal
        cliente={selectedClienteForHistory}
        veiculos={veiculos}
        servicos={servicos}
        onClose={() => setIsHistoryModalOpen(false)}
        onOpenNewVehicleForClient={(cli) => {
          setIsHistoryModalOpen(false);
          openNewVehicleForClient(cli);
        }}
        onOpenNewServiceForClient={(cli) => {
          setIsHistoryModalOpen(false);
          openNewServiceForClient(cli);
        }}
        onEditClient={(cli) => {
          setIsHistoryModalOpen(false);
          setEditingCliente(cli);
          setIsClienteModalOpen(true);
        }}
      />

      {/* Modal de Configuração do Supabase */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigSaved={() => {
          carregarDados();
          showToast('Configuração do Supabase aplicada com sucesso!', 'success');
        }}
      />

      {/* Modal de Exportação do Arquivo Único index.html */}
      <ExportSingleFileModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        supabaseUrl={savedCfg.url}
        supabaseAnonKey={savedCfg.anonKey}
      />

      {/* Modal de Confirmação Segura */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Rodapé Simples */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>© {new Date().getFullYear()} AutoMax Oficina Mecânica — Sistema CRM de Gestão e Ordens de Serviço</p>
          <div className="flex items-center gap-3 text-slate-500">
            <span>Integração Supabase</span>
            <span>•</span>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="text-amber-400 hover:underline"
            >
              Exportar index.html Puro
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
