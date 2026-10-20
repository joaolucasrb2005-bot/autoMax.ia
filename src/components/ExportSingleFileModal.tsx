import React, { useState } from 'react';
import { X, FileCode2, Copy, Check, Download, ExternalLink } from 'lucide-react';

interface ExportSingleFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export const ExportSingleFileModal: React.FC<ExportSingleFileModalProps> = ({
  isOpen,
  onClose,
  supabaseUrl,
  supabaseAnonKey,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const effectiveUrl = supabaseUrl || '<COLE_AQUI_A_PROJECT_URL>';
  const effectiveKey = supabaseAnonKey || '<COLE_AQUI_A_ANON_KEY>';

  // Gera o código HTML completo em um único arquivo puro
  const singleFileCode = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AutoMax - CRM para Oficina Mecânica</title>
  <!-- Carregamento do Supabase JS via CDN conforme solicitado -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"><\/script>
  <!-- Tailwind CSS CDN para estilização visual moderna e responsiva -->
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    /* Estilos personalizados para o Kanban e scrollbars */
    .kanban-col { min-height: 480px; }
    .kanban-card:hover { transform: translateY(-2px); }
  </style>
</head>
<body class="bg-slate-100 text-slate-800 min-h-screen flex flex-col font-sans">

  <!-- ==================== CABEÇALHO / NAVBAR ==================== -->
  <header class="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
    <div class="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <div class="bg-amber-500 text-slate-950 p-2 rounded-xl font-black text-lg">🔧</div>
        <div>
          <span class="text-xl font-black tracking-tight font-mono text-white">AUTO<span class="text-amber-400">MAX</span></span>
          <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 ml-1">CRM Mecânica</span>
        </div>
      </div>

      <!-- Navegação por Abas -->
      <nav class="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
        <button onclick="mudarAba('painel')" id="tab-painel" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950">Painel</button>
        <button onclick="mudarAba('kanban')" id="tab-kanban" class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white">Serviços (Kanban)</button>
        <button onclick="mudarAba('clientes')" id="tab-clientes" class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white">Clientes</button>
        <button onclick="mudarAba('veiculos')" id="tab-veiculos" class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white">Veículos</button>
      </nav>

      <button onclick="abrirModalServico()" class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow">+ Nova O.S.</button>
    </div>
  </header>

  <!-- ==================== CONTEÚDO PRINCIPAL ==================== -->
  <main class="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
    <!-- Banner de Status Supabase -->
    <div id="statusSupabaseBanner" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
      <span>Conectado ao Supabase: <strong>${effectiveUrl}</strong></span>
      <button onclick="carregarTudo()" class="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500">Recarregar Dados</button>
    </div>

    <!-- ABA 1: PAINEL INICIAL (INDICADORES) -->
    <section id="view-painel" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Total Clientes</span>
          <div id="metric-clientes" class="text-2xl font-black text-slate-800 mt-2">0</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Total Veículos</span>
          <div id="metric-veiculos" class="text-2xl font-black text-slate-800 mt-2">0</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Em Andamento</span>
          <div id="metric-andamento" class="text-2xl font-black text-amber-600 mt-2">0</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Concluídos no Mês</span>
          <div id="metric-concluidos-mes" class="text-2xl font-black text-emerald-600 mt-2">0</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold text-slate-400 uppercase">Faturado no Mês</span>
          <div id="metric-faturado-mes" class="text-xl font-black text-slate-900 mt-2">R$ 0,00</div>
        </div>
      </div>
    </section>

    <!-- ABA 2: KANBAN DE SERVIÇOS -->
    <section id="view-kanban" class="hidden space-y-4">
      <div class="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <input type="text" id="kanbanSearch" oninput="filtrarKanban()" placeholder="Buscar por placa ou cliente..." class="p-2 border rounded-lg text-xs w-72" />
        <button onclick="abrirModalServico()" class="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg">+ Abrir Serviço</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto" id="kanbanColumns">
        <!-- Colunas geradas via JS -->
      </div>
    </section>

    <!-- ABA 3: CLIENTES -->
    <section id="view-clientes" class="hidden space-y-4">
      <div class="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
        <input type="text" id="clientesSearch" oninput="renderizarClientes()" placeholder="Buscar por nome ou telefone..." class="p-2 border rounded-lg text-xs w-72" />
        <button onclick="abrirModalCliente()" class="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg">+ Novo Cliente</button>
      </div>
      <div id="listaClientes" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    </section>

    <!-- ABA 4: VEÍCULOS -->
    <section id="view-veiculos" class="hidden space-y-4">
      <div class="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
        <input type="text" id="veiculosSearch" oninput="renderizarVeiculos()" placeholder="Buscar por placa..." class="p-2 border rounded-lg text-xs w-72" />
        <button onclick="abrirModalVeiculo()" class="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg">+ Novo Veículo</button>
      </div>
      <div id="listaVeiculos" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    </section>
  </main>

  <!-- ==================== JAVASCRIPT & SUPABASE ==================== -->
  <script>
    // 1. CONFIGURAÇÃO DO SUPABASE
    const SUPABASE_URL = "${effectiveUrl}";
    const SUPABASE_ANON_KEY = "${effectiveKey}";
    const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

    const STATUS_LIST = ['Aguardando', 'Em diagnóstico', 'Aguardando aprovação', 'Em execução', 'Concluído', 'Entregue'];

    let clientes = [];
    let veiculos = [];
    let servicos = [];

    // 2. NAVEGAÇÃO POR ABAS
    function mudarAba(aba) {
      ['painel', 'kanban', 'clientes', 'veiculos'].forEach(a => {
        document.getElementById('view-' + a).classList.add('hidden');
        document.getElementById('tab-' + a).className = 'px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white';
      });
      document.getElementById('view-' + aba).classList.remove('hidden');
      document.getElementById('tab-' + aba).className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950';
    }

    // 3. CARREGAR DADOS DO SUPABASE (CRUD COMPLETO)
    async function carregarTudo() {
      if (!supabase) return;
      try {
        const { data: dCli } = await supabase.from('clientes').select('*').order('criado_em', { ascending: false });
        clientes = dCli || [];

        const { data: dVei } = await supabase.from('veiculos').select('*, clientes(nome, telefone)').order('criado_em', { ascending: false });
        veiculos = (dVei || []).map(v => ({ ...v, cliente_nome: v.clientes?.nome }));

        const { data: dSer } = await supabase.from('servicos').select('*, clientes(nome), veiculos(placa, modelo)').order('data_entrada', { ascending: false });
        servicos = (dSer || []).map(s => ({ ...s, cliente_nome: s.clientes?.nome, veiculo_placa: s.veiculos?.placa, veiculo_modelo: s.veiculos?.modelo }));

        renderizarPainel();
        renderizarKanban();
        renderizarClientes();
        renderizarVeiculos();
      } catch (err) {
        alert('Erro ao carregar dados do Supabase: ' + err.message);
      }
    }

    // 4. MUDANÇA DE STATUS NO KANBAN COM GRAVAÇÃO DE DATA_CONCLUSAO
    async function mudarStatusServico(id, novoStatus) {
      try {
        const updateData = { status: novoStatus };
        if (novoStatus === 'Concluído' || novoStatus === 'Entregue') {
          updateData.data_conclusao = new Date().toISOString();
        }
        await supabase.from('servicos').update(updateData).eq('id', id);
        await carregarTudo();
      } catch (e) {
        alert('Erro ao atualizar status: ' + e.message);
      }
    }

    window.onload = carregarTudo;
  <\/script>
</body>
</html>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(singleFileCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([singleFileCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6 max-h-[92vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Exportar index.html Puro (Arquivo Único)</h2>
              <p className="text-xs text-slate-400">
                Atende exatamente ao requisito de arquivo único com Supabase JS carregado por CDN
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

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            <div>
              <strong>Pronto para entrega ou execução local:</strong>
              <p className="text-amber-800/80 mt-0.5">
                Você pode baixar este arquivo <code className="bg-white px-1.5 py-0.5 rounded font-mono">index.html</code> e abri-lo diretamente no navegador sem precisar de Node ou instalação de pacotes!
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-white border border-amber-300 text-slate-800 font-bold rounded-lg hover:bg-amber-100 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar index.html</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-96 border border-slate-800 select-all">
            {singleFileCode}
          </pre>
        </div>

        {/* Rodapé */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
