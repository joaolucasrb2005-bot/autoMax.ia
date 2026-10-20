import React, { useState } from 'react';
import {
  X,
  Database,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  getSavedConfig,
  saveConfig,
  testConnection,
  SUPABASE_SQL_SCHEMA,
  seedInitialDataToSupabase,
} from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const currentConfig = getSavedConfig();
  const [url, setUrl] = useState(currentConfig.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    saveConfig({ url: url.trim(), anonKey: anonKey.trim() });

    try {
      const res = await testConnection();
      setTestResult(res);
      if (res.success) {
        onConfigSaved();
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Falha ao testar conexão' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await seedInitialDataToSupabase();
      if (res.success) {
        setSeedResult('✅ ' + res.message);
        onConfigSaved();
      } else {
        setSeedResult('⚠️ ' + res.message);
      }
    } catch (err: any) {
      setSeedResult('❌ ' + (err.message || 'Erro ao popular dados'));
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6 max-h-[92vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Configuração do Supabase</h2>
              <p className="text-xs text-slate-400">
                Conecte seu banco de dados em nuvem para persistência permanente da AutoMax
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

        {/* Conteúdo rolável */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Formulário de Credenciais */}
          <form onSubmit={handleSaveAndTest} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                URL do Projeto Supabase (Project URL)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://seu-projeto.supabase.co"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                Chave Pública Anon (anon / public key)
              </label>
              <textarea
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                rows={2}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 border ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Os dados são salvos no navegador para chamadas via @supabase/supabase-js
              </span>

              <button
                type="submit"
                disabled={isTesting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Testando Conexão...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar & Conectar</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* DDL SQL das Tabelas */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800">
                  Estrutura das Tabelas no Supabase (SQL DDL)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Se ainda não criou as tabelas no Supabase, copie este script e cole no SQL Editor do painel Supabase:
                </p>
              </div>

              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40 border border-slate-800">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>

          {/* Popular dados de demonstração no Supabase */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold text-amber-900">
                  Popular Banco com Dados de Exemplo da AutoMax
                </h4>
              </div>

              <button
                onClick={handleSeedDemo}
                disabled={isSeeding || !url || !anonKey}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                {isSeeding ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                <span>Inserir Dados no Supabase</span>
              </button>
            </div>
            <p className="text-[11px] text-amber-800/80">
              Insere 4 clientes, 5 veículos com placas brasileiras e 6 ordens de serviço distribuídas nos 6 status do Kanban para testar imediatamente.
            </p>
            {seedResult && (
              <div className="text-xs font-bold pt-1">{seedResult}</div>
            )}
          </div>
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
