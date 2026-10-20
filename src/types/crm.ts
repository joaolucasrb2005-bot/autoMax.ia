export type ServiceStatus =
  | 'Aguardando'
  | 'Em diagnóstico'
  | 'Aguardando aprovação'
  | 'Em execução'
  | 'Concluído'
  | 'Entregue';

export const STATUS_LIST: ServiceStatus[] = [
  'Aguardando',
  'Em diagnóstico',
  'Aguardando aprovação',
  'Em execução',
  'Concluído',
  'Entregue',
];

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  cpf: string | null;
  observacoes: string | null;
  criado_em: string;
}

export interface Veiculo {
  id: string;
  cliente_id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string | number | null;
  cor: string | null;
  km_atual: number | null;
  criado_em: string;
  // Campos populados em queries conjuntas
  cliente_nome?: string;
  cliente_telefone?: string;
}

export interface Servico {
  id: string;
  cliente_id: string;
  veiculo_id: string;
  descricao: string;
  valor: number;
  status: ServiceStatus;
  data_entrada: string;
  data_conclusao: string | null;
  observacoes: string | null;
  // Campos populados para exibição
  cliente_nome?: string;
  cliente_telefone?: string;
  veiculo_placa?: string;
  veiculo_modelo?: string;
  veiculo_marca?: string;
}

export interface DashboardMetrics {
  totalClientes: number;
  totalVeiculos: number;
  servicosEmAndamento: number;
  servicosConcluidosMes: number;
  valorConcluidoMes: number;
}

export const STATUS_CONFIG: Record<
  ServiceStatus,
  {
    label: string;
    bgBadge: string;
    borderCol: string;
    dotColor: string;
    headerBg: string;
    textColor: string;
    description: string;
  }
> = {
  'Aguardando': {
    label: 'Aguardando',
    bgBadge: 'bg-amber-100 text-amber-800 border-amber-300',
    borderCol: 'border-amber-400',
    dotColor: 'bg-amber-500',
    headerBg: 'bg-amber-50 text-amber-900 border-amber-200',
    textColor: 'text-amber-700',
    description: 'Veículo recebido no pátio aguardando triagem',
  },
  'Em diagnóstico': {
    label: 'Em diagnóstico',
    bgBadge: 'bg-purple-100 text-purple-800 border-purple-300',
    borderCol: 'border-purple-400',
    dotColor: 'bg-purple-500',
    headerBg: 'bg-purple-50 text-purple-900 border-purple-200',
    textColor: 'text-purple-700',
    description: 'Avaliação técnica e desmontagem inicial',
  },
  'Aguardando aprovação': {
    label: 'Aguardando aprovação',
    bgBadge: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    borderCol: 'border-cyan-400',
    dotColor: 'bg-cyan-500',
    headerBg: 'bg-cyan-50 text-cyan-900 border-cyan-200',
    textColor: 'text-cyan-700',
    description: 'Orçamento enviado ao cliente',
  },
  'Em execução': {
    label: 'Em execução',
    bgBadge: 'bg-blue-100 text-blue-800 border-blue-300',
    borderCol: 'border-blue-400',
    dotColor: 'bg-blue-500',
    headerBg: 'bg-blue-50 text-blue-900 border-blue-200',
    textColor: 'text-blue-700',
    description: 'Mecânicos trabalhando no veículo',
  },
  'Concluído': {
    label: 'Concluído',
    bgBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    borderCol: 'border-emerald-400',
    dotColor: 'bg-emerald-500',
    headerBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    textColor: 'text-emerald-700',
    description: 'Serviço finalizado, pronto para entrega',
  },
  'Entregue': {
    label: 'Entregue',
    bgBadge: 'bg-slate-100 text-slate-800 border-slate-300',
    borderCol: 'border-slate-400',
    dotColor: 'bg-slate-500',
    headerBg: 'bg-slate-50 text-slate-900 border-slate-200',
    textColor: 'text-slate-700',
    description: 'Veículo retirado e pagamento efetuado',
  },
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function getDaysSinceEntry(dateStr: string): number {
  if (!dateStr) return 0;
  const entry = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - entry.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
