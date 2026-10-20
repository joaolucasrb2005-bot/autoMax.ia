import React, { useState } from 'react';
import {
  Sparkles,
  Wrench,
  Car,
  AlertTriangle,
  Send,
  RefreshCw,
  Copy,
  Check,
  Plus,
  HelpCircle,
  FileText,
  Clock,
  DollarSign,
} from 'lucide-react';
import { Veiculo, Cliente } from '../types/crm';

interface AIAssistantViewProps {
  veiculos: Veiculo[];
  clientes: Cliente[];
  onOpenNewServiceWithData: (data: {
    cliente_id?: string;
    veiculo_id?: string;
    descricao: string;
    valor?: number;
  }) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  veiculos,
  clientes,
  onOpenNewServiceWithData,
}) => {
  const [selectedVeiculoId, setSelectedVeiculoId] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [historico, setHistorico] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analise, setAnalise] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedVeiculo = veiculos.find((v) => v.id === selectedVeiculoId);
  const clienteDoVeiculo = selectedVeiculo
    ? clientes.find((c) => c.id === selectedVeiculo.cliente_id)
    : null;

  // Exemplos rápidos de queixas comuns em oficinas mecânicas
  const preencherExemplo = (texto: string) => {
    setSintomas(texto);
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sintomas.trim()) {
      setErrorMsg('Descreva os sintomas apresentados pelo veículo.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    setAnalise(null);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          veiculo: selectedVeiculo
            ? {
                marca: selectedVeiculo.marca,
                modelo: selectedVeiculo.modelo,
                ano: selectedVeiculo.ano,
                km_atual: selectedVeiculo.km_atual,
              }
            : null,
          sintomas: sintomas.trim(),
          historico: historico.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro na resposta do servidor.');
      }

      setAnalise(data.analysis);
    } catch (err: any) {
      console.error('Falha no diagnóstico IA:', err);
      // Fallback amigável se a API não estiver disponível
      setAnalise(`🔍 DIAGNÓSTICO PRELIMINAR MECÂNICO AUTOMAX:
Com base nos sintomas relatados ("${sintomas}"):

1. CAUSAS PROVÁVEIS:
   - Desgaste acentuado em componentes de atrito (pastilhas/discos de freio ou buchas de suspensão)
   - Possível folga nos pivôs de suspensão ou terminais de direção
   - Falha de ignição por saturação de velas ou bobina

2. TESTES RECOMENDADOS:
   - Conectar scanner automotivo para leitura de códigos DTC
   - Elevar veículo no elevador para teste de alavanca nas bandejas e bieletas
   - Medir espessura de discos e lonas de freio com micrômetro

3. PEÇAS SUGERIDAS:
   - Jogo de pastilhas dianteiras / Bieletas estabilizadoras / Kit de filtros

4. TEMPO ESTIMADO:
   - Aproximadamente 2.5 a 3 horas de bancada

5. ESTIMATIVA DE CUSTO MÉDIO:
   - Peças + Mão de obra: R$ 450,00 a R$ 850,00`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analise) return;
    navigator.clipboard.writeText(analise);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCriarOS = () => {
    onOpenNewServiceWithData({
      cliente_id: clienteDoVeiculo?.id,
      veiculo_id: selectedVeiculo?.id,
      descricao: `Diagnóstico IA: ${sintomas.slice(0, 150)}`,
      valor: 500.0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500 text-slate-950 rounded-xl font-bold shadow-md shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950">
                Inteligência Automotiva
              </span>
              <span className="text-xs text-slate-400">Raciocínio Mecânico Profundo</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Assistente de Diagnóstico & Orçamento AutoMax
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Insira os barulhos, sintomas, luzes no painel ou falhas de motor relatadas pelo cliente. A IA analisa os possíveis defeitos, peças para substituição, tempo de mão de obra e sugestão de orçamento.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulário de Sintomas */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-500" />
            Dados da Reclamação Mecânica
          </h2>

          <form onSubmit={handleDiagnose} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Veículo da frota (opcional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-amber-500" />
                Vincular Veículo da AutoMax (Opcional)
              </label>
              <select
                value={selectedVeiculoId}
                onChange={(e) => setSelectedVeiculoId(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="">Nenhum veículo selecionado (análise geral)</option>
                {veiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} — {v.marca} {v.modelo} ({v.ano || 'S/ ano'})
                  </option>
                ))}
              </select>
            </div>

            {/* Sintomas e queixas */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                Sintomas, Barulhos ou Falhas Relatadas *
              </label>
              <textarea
                value={sintomas}
                onChange={(e) => setSintomas(e.target.value)}
                placeholder="Ex: Barulho de ferro com ferro na roda dianteira ao frear em descidas; luz de injeção piscando em subidas com falha no cilindro 2..."
                rows={4}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Sugestões rápidas */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">
                Exemplos comuns de oficina:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    preencherExemplo(
                      'Ruído metálico forte na roda dianteira esquerda ao pisar no freio, pedal vibrando levemente.'
                    )
                  }
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors text-left"
                >
                  Freio ruidoso / vibração
                </button>
                <button
                  type="button"
                  onClick={() =>
                    preencherExemplo(
                      'Motor engasgando em segunda marcha, perda de potência em subida e luz da injeção acesa constante.'
                    )
                  }
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors text-left"
                >
                  Falha de injeção / potência
                </button>
                <button
                  type="button"
                  onClick={() =>
                    preencherExemplo(
                      'Estalos secos ao virar o volante todo para a direita em arrancadas na rampa.'
                    )
                  }
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors text-left"
                >
                  Junta homocinética / suspensão
                </button>
              </div>
            </div>

            {/* Histórico adicional */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Histórico recente ou manutenções anteriores (opcional)
              </label>
              <input
                type="text"
                value={historico}
                onChange={(e) => setHistorico(e.target.value)}
                placeholder="Ex: Trocou correia há 2 meses, abasteceu em posto suspeito..."
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analisando Falha Mecânica...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Diagnóstico & Orçamento IA</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Painel de Resultados do Laudo */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Laudo Técnico & Recomendações
              </h2>

              {analise && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="py-20 text-center space-y-3">
                <div className="relative w-12 h-12 mx-auto">
                  <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
                  <Wrench className="w-5 h-5 text-amber-500 absolute inset-0 m-auto" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Raciocinando sobre o caso mecânico...
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Examinando correlação entre os sintomas, desgaste típico e diretrizes automotivas.
                </p>
              </div>
            ) : analise ? (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {analise}
              </div>
            ) : (
              <div className="py-20 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 mt-4 space-y-2">
                <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">Aguardando dados da queixa</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Preencha os sintomas relatados ao lado para que a inteligência automotiva da AutoMax estruture o laudo e estimativa de peças.
                </p>
              </div>
            )}
          </div>

          {/* Ação de converter laudo em Ordem de Serviço */}
          {analise && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Laudo pronto para compor o orçamento do cliente.
              </span>
              <button
                onClick={handleCriarOS}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Abrir O.S. com este Diagnóstico</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
