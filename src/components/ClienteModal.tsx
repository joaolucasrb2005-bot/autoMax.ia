import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Hash, FileText, AlertCircle } from 'lucide-react';
import { Cliente } from '../types/crm';

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    nome: string;
    telefone: string;
    email?: string | null;
    cpf?: string | null;
    observacoes?: string | null;
  }) => Promise<void>;
  editingCliente?: Cliente | null;
}

export const ClienteModal: React.FC<ClienteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCliente,
}) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCliente) {
      setNome(editingCliente.nome);
      setTelefone(editingCliente.telefone);
      setEmail(editingCliente.email || '');
      setCpf(editingCliente.cpf || '');
      setObservacoes(editingCliente.observacoes || '');
    } else {
      setNome('');
      setTelefone('');
      setEmail('');
      setCpf('');
      setObservacoes('');
    }
    setErrorMsg('');
  }, [editingCliente, isOpen]);

  if (!isOpen) return null;

  // Formatação simples de telefone
  const handlePhoneChange = (val: string) => {
    let clean = val.replace(/\D/g, '');
    if (clean.length > 11) clean = clean.slice(0, 11);

    if (clean.length <= 10) {
      // (XX) XXXX-XXXX
      clean = clean.replace(/^(\d{2})(\d)/g, '($1) $2');
      clean = clean.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      // (XX) XXXXX-XXXX
      clean = clean.replace(/^(\d{2})(\d)/g, '($1) $2');
      clean = clean.replace(/(\d{5})(\d)/, '$1-$2');
    }
    setTelefone(clean);
  };

  // Formatação de CPF
  const handleCpfChange = (val: string) => {
    let clean = val.replace(/\D/g, '');
    if (clean.length > 11) clean = clean.slice(0, 11);
    clean = clean.replace(/(\d{3})(\d)/, '$1.$2');
    clean = clean.replace(/(\d{3})(\d)/, '$1.$2');
    clean = clean.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setCpf(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nome.trim()) {
      setErrorMsg('O nome do cliente é obrigatório.');
      return;
    }

    if (!telefone.trim()) {
      setErrorMsg('O telefone de contato do cliente é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: editingCliente?.id,
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim() || null,
        cpf: cpf.trim() || null,
        observacoes: observacoes.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao salvar cliente.');
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
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente AutoMax'}
              </h2>
              <p className="text-xs text-slate-400">
                Cadastro cadastral e dados de contato para emissão de O.S.
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

          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-500" />
              Nome Completo do Cliente *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Carlos Eduardo Silva"
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Telefone e CPF */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                Telefone / WhatsApp *
              </label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-500" />
                CPF
              </label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* E-mail */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-500" />
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@email.com"
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              Observações / Preferências
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Cliente prefere contato pelo WhatsApp. Frotista."
              rows={2}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
            />
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
              {isSubmitting ? 'Salvando...' : editingCliente ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
