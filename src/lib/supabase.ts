import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Cliente, Veiculo, Servico, ServiceStatus } from '../types/crm';

const CONFIG_KEY = 'automax_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Configuração padrão: busca no env ou localStorage
export function getSavedConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao ler configuração do localStorage', e);
  }

  return {
    url: envUrl,
    anonKey: envKey,
  };
}

export function saveConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    clientInstance = null; // reinicia o cliente
  } catch (e) {
    console.error('Falha ao salvar configuração do Supabase', e);
  }
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSavedConfig();
  if (!config.url || !config.anonKey || config.url === '<COLE_AQUI_A_PROJECT_URL>') {
    return null;
  }

  if (!clientInstance) {
    try {
      clientInstance = createClient(config.url, config.anonKey, {
        auth: { persistSession: false },
      });
    } catch (err) {
      console.error('Erro ao instanciar Supabase Client:', err);
      return null;
    }
  }
  return clientInstance;
}

// Dados iniciais de demonstração para quando o Supabase ainda não estiver conectado
const INITIAL_CLIENTES: Cliente[] = [
  {
    id: 'c101-1111-2222-3333-444455556666',
    nome: 'Carlos Eduardo Silva',
    telefone: '(11) 98765-4321',
    email: 'carlos.silva@email.com',
    cpf: '123.456.789-00',
    observacoes: 'Cliente frotista, pontual nos pagamentos. Prefere peças originais.',
    criado_em: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'c202-1111-2222-3333-444455556666',
    nome: 'Mariana Guimarães',
    telefone: '(11) 97654-3210',
    email: 'mariana.gui@email.com',
    cpf: '234.567.890-11',
    observacoes: 'Faz revisão a cada 10.000 km rigorosamente.',
    criado_em: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'c303-1111-2222-3333-444455556666',
    nome: 'Roberto Antunes',
    telefone: '(11) 99123-4567',
    email: 'roberto.antunes@transporte.com',
    cpf: '345.678.901-22',
    observacoes: 'Veículo de trabalho para entregas rápidas.',
    criado_em: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'c404-1111-2222-3333-444455556666',
    nome: 'Luciana Ferreira',
    telefone: '(11) 98432-1098',
    email: 'luciana.ferreira@advocacia.com',
    cpf: '456.789.012-33',
    observacoes: 'Solicitou lavagem detalhada de cortesia após o serviço.',
    criado_em: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const INITIAL_VEICULOS: Veiculo[] = [
  {
    id: 'v101-1111-2222-3333-444455556666',
    cliente_id: 'c101-1111-2222-3333-444455556666',
    placa: 'BRA2E19',
    marca: 'Honda',
    modelo: 'Civic EXL 2.0',
    ano: 2021,
    cor: 'Prata',
    km_atual: 48500,
    criado_em: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'v102-1111-2222-3333-444455556666',
    cliente_id: 'c101-1111-2222-3333-444455556666',
    placa: 'ABC1234',
    marca: 'Toyota',
    modelo: 'Corolla Altis',
    ano: 2019,
    cor: 'Preto',
    km_atual: 74200,
    criado_em: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'v201-1111-2222-3333-444455556666',
    cliente_id: 'c202-1111-2222-3333-444455556666',
    placa: 'RJK4F50',
    marca: 'Jeep',
    modelo: 'Compass Longitude 1.3 Turbo',
    ano: 2022,
    cor: 'Branco Polar',
    km_atual: 32000,
    criado_em: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'v301-1111-2222-3333-444455556666',
    cliente_id: 'c303-1111-2222-3333-444455556666',
    placa: 'XYZ9876',
    marca: 'Fiat',
    modelo: 'Fiorino 1.4 EVO',
    ano: 2020,
    cor: 'Branco',
    km_atual: 112000,
    criado_em: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'v401-1111-2222-3333-444455556666',
    cliente_id: 'c404-1111-2222-3333-444455556666',
    placa: 'MER3A22',
    marca: 'Volkswagen',
    modelo: 'T-Cross Highline 250 TSI',
    ano: 2023,
    cor: 'Cinza Platinum',
    km_atual: 18400,
    criado_em: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const INITIAL_SERVICOS: Servico[] = [
  {
    id: 's101-1111-2222-3333-444455556666',
    cliente_id: 'c101-1111-2222-3333-444455556666',
    veiculo_id: 'v101-1111-2222-3333-444455556666',
    descricao: 'Revisão preventiva 50k: troca de óleo sintético 0W20, filtros de óleo, ar e combustível + pastilhas dianteiras',
    valor: 850.0,
    status: 'Em execução',
    data_entrada: new Date(Date.now() - 2 * 86400000).toISOString(),
    data_conclusao: null,
    observacoes: 'Cliente pediu atenção ao ruído leve ao esterçar para a esquerda.',
  },
  {
    id: 's201-1111-2222-3333-444455556666',
    cliente_id: 'c202-1111-2222-3333-444455556666',
    veiculo_id: 'v201-1111-2222-3333-444455556666',
    descricao: 'Diagnóstico de injeção eletrônica (luz acesa no painel) e falha em baixa rotação',
    valor: 350.0,
    status: 'Em diagnóstico',
    data_entrada: new Date(Date.now() - 1 * 86400000).toISOString(),
    data_conclusao: null,
    observacoes: 'Scanner conectado: código P0300 (falha de ignição múltipla).',
  },
  {
    id: 's301-1111-2222-3333-444455556666',
    cliente_id: 'c303-1111-2222-3333-444455556666',
    veiculo_id: 'v301-1111-2222-3333-444455556666',
    descricao: 'Troca de kit de embreagem completo (disco, platô e rolamento) + retífica de volante',
    valor: 1450.0,
    status: 'Aguardando aprovação',
    data_entrada: new Date(Date.now() - 3 * 86400000).toISOString(),
    data_conclusao: null,
    observacoes: 'Orçamento enviado pelo WhatsApp. Aguardando retorno do financeiro da empresa.',
  },
  {
    id: 's401-1111-2222-3333-444455556666',
    cliente_id: 'c404-1111-2222-3333-444455556666',
    veiculo_id: 'v401-1111-2222-3333-444455556666',
    descricao: 'Alinhamento 3D, balanceamento das 4 rodas e rodízio de pneus',
    valor: 220.0,
    status: 'Aguardando',
    data_entrada: new Date().toISOString(),
    data_conclusao: null,
    observacoes: 'Veículo acabou de chegar no box de entrada.',
  },
  {
    id: 's102-1111-2222-3333-444455556666',
    cliente_id: 'c101-1111-2222-3333-444455556666',
    veiculo_id: 'v102-1111-2222-3333-444455556666',
    descricao: 'Troca de amortecedores dianteiros Monroe e batentes de suspensão',
    valor: 1890.0,
    status: 'Concluído',
    data_entrada: new Date(Date.now() - 4 * 86400000).toISOString(),
    data_conclusao: new Date(Date.now() - 1 * 86400000).toISOString(),
    observacoes: 'Teste de rodagem aprovado. Carro limpo e pronto para entrega.',
  },
  {
    id: 's103-1111-2222-3333-444455556666',
    cliente_id: 'c101-1111-2222-3333-444455556666',
    veiculo_id: 'v101-1111-2222-3333-444455556666',
    descricao: 'Higienização de ar condicionado e troca do filtro de cabine (filtro de pólen)',
    valor: 180.0,
    status: 'Entregue',
    data_entrada: new Date(Date.now() - 15 * 86400000).toISOString(),
    data_conclusao: new Date(Date.now() - 14 * 86400000).toISOString(),
    observacoes: 'Serviço executado com sucesso e pago via Pix.',
  },
];

// Fallback in-memory storage (usado apenas se Supabase não tiver credenciais ou estiver offline)
let mockClientes: Cliente[] = [...INITIAL_CLIENTES];
let mockVeiculos: Veiculo[] = [...INITIAL_VEICULOS];
let mockServicos: Servico[] = [...INITIAL_SERVICOS];

export const SUPABASE_SQL_SCHEMA = `-- Copie e cole no SQL Editor do seu projeto Supabase:

CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  cpf TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS veiculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  placa TEXT UNIQUE NOT NULL,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano TEXT,
  cor TEXT,
  km_atual NUMERIC DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS servicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  veiculo_id UUID NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor NUMERIC DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('Aguardando', 'Em diagnóstico', 'Aguardando aprovação', 'Em execução', 'Concluído', 'Entregue')),
  data_entrada TIMESTAMPTZ DEFAULT now(),
  data_conclusao TIMESTAMPTZ,
  observacoes TEXT
);

-- Ativar RLS (Row Level Security) permissivo para chave pública anon
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público veiculos" ON veiculos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público servicos" ON servicos FOR ALL USING (true) WITH CHECK (true);
`;

// Helper para testar conexão com o Supabase
export async function testConnection(): Promise<{ success: boolean; message: string; count?: number }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      message: 'URL do projeto ou Chave Anon não informadas. Insira os dados do Supabase.',
    };
  }

  try {
    const { data, error } = await supabase.from('clientes').select('id', { count: 'exact', head: true });
    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Conectado ao Supabase, mas as tabelas ainda não foram criadas! Execute o script SQL no Supabase.',
        };
      }
      return { success: false, message: `Erro do Supabase: ${error.message} (${error.code || ''})` };
    }
    return { success: true, message: 'Conectado ao Supabase com sucesso!' };
  } catch (err: any) {
    return { success: false, message: `Falha de rede ou URL inválida: ${err.message || err}` };
  }
}

// ================= CLIENTES CRUD =================
export async function getClientes(): Promise<Cliente[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [...mockClientes].sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
  }

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('criado_em', { ascending: false });

  if (error) {
    console.error('Erro ao buscar clientes no Supabase:', error);
    throw new Error(`Erro ao buscar clientes: ${error.message}`);
  }
  return data || [];
}

export async function createCliente(clienteData: Omit<Cliente, 'id' | 'criado_em'>): Promise<Cliente> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    const novo: Cliente = {
      ...clienteData,
      id: crypto.randomUUID ? crypto.randomUUID() : 'c_' + Date.now(),
      criado_em: new Date().toISOString(),
    };
    mockClientes.unshift(novo);
    return novo;
  }

  const { data, error } = await supabase
    .from('clientes')
    .insert([
      {
        nome: clienteData.nome.trim(),
        telefone: clienteData.telefone.trim(),
        email: clienteData.email?.trim() || null,
        cpf: clienteData.cpf?.trim() || null,
        observacoes: clienteData.observacoes?.trim() || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Erro ao cadastrar cliente no Supabase:', error);
    throw new Error(`Falha ao cadastrar cliente: ${error.message}`);
  }
  return data;
}

export async function updateCliente(id: string, clienteData: Partial<Cliente>): Promise<Cliente> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    const index = mockClientes.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Cliente não encontrado.');
    mockClientes[index] = { ...mockClientes[index], ...clienteData };
    return mockClientes[index];
  }

  const { data, error } = await supabase
    .from('clientes')
    .update({
      nome: clienteData.nome?.trim(),
      telefone: clienteData.telefone?.trim(),
      email: clienteData.email?.trim() || null,
      cpf: clienteData.cpf?.trim() || null,
      observacoes: clienteData.observacoes?.trim() || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw new Error(`Falha ao atualizar cliente: ${error.message}`);
  }
  return data;
}

export async function deleteCliente(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    mockClientes = mockClientes.filter((c) => c.id !== id);
    mockVeiculos = mockVeiculos.filter((v) => v.cliente_id !== id);
    mockServicos = mockServicos.filter((s) => s.cliente_id !== id);
    return;
  }

  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir cliente:', error);
    throw new Error(`Falha ao excluir cliente: ${error.message}`);
  }
}

// ================= VEÍCULOS CRUD =================
export async function getVeiculos(): Promise<Veiculo[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    // Popula dados do cliente localmente
    return mockVeiculos.map((v) => {
      const c = mockClientes.find((cli) => cli.id === v.cliente_id);
      return {
        ...v,
        cliente_nome: c ? c.nome : 'Cliente Desconhecido',
        cliente_telefone: c ? c.telefone : '',
      };
    }).sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
  }

  const { data, error } = await supabase
    .from('veiculos')
    .select(`
      *,
      clientes (
        nome,
        telefone
      )
    `)
    .order('criado_em', { ascending: false });

  if (error) {
    console.error('Erro ao buscar veículos no Supabase:', error);
    throw new Error(`Erro ao buscar veículos: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    cliente_id: item.cliente_id,
    placa: item.placa,
    marca: item.marca,
    modelo: item.modelo,
    ano: item.ano,
    cor: item.cor,
    km_atual: item.km_atual,
    criado_em: item.criado_em,
    cliente_nome: item.clientes?.nome,
    cliente_telefone: item.clientes?.telefone,
  }));
}

export async function checkPlacaExists(placa: string, excludeId?: string): Promise<boolean> {
  const cleanedPlaca = placa.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
  const supabase = getSupabaseClient();

  if (!supabase) {
    return mockVeiculos.some(
      (v) =>
        v.placa.toUpperCase().replace(/[^A-Z0-9]/g, '') === cleanedPlaca &&
        v.id !== excludeId
    );
  }

  const query = supabase
    .from('veiculos')
    .select('id')
    .ilike('placa', cleanedPlaca);

  if (excludeId) {
    query.neq('id', excludeId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Erro ao verificar placa:', error);
    return false;
  }
  return (data && data.length > 0);
}

export async function createVeiculo(veiculoData: Omit<Veiculo, 'id' | 'criado_em'>): Promise<Veiculo> {
  const placaFormatada = veiculoData.placa.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
  const jaExiste = await checkPlacaExists(placaFormatada);
  if (jaExiste) {
    throw new Error(`A placa ${placaFormatada} já está cadastrada no sistema. Cada veículo deve ter placa única.`);
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    const novo: Veiculo = {
      ...veiculoData,
      placa: placaFormatada,
      id: crypto.randomUUID ? crypto.randomUUID() : 'v_' + Date.now(),
      criado_em: new Date().toISOString(),
    };
    mockVeiculos.unshift(novo);
    return novo;
  }

  const { data, error } = await supabase
    .from('veiculos')
    .insert([
      {
        cliente_id: veiculoData.cliente_id,
        placa: placaFormatada,
        marca: veiculoData.marca.trim(),
        modelo: veiculoData.modelo.trim(),
        ano: veiculoData.ano || null,
        cor: veiculoData.cor?.trim() || null,
        km_atual: veiculoData.km_atual !== null && veiculoData.km_atual !== undefined ? Number(veiculoData.km_atual) : 0,
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(`A placa informada já está cadastrada.`);
    }
    console.error('Erro ao cadastrar veículo:', error);
    throw new Error(`Falha ao cadastrar veículo: ${error.message}`);
  }
  return data;
}

export async function updateVeiculo(id: string, veiculoData: Partial<Veiculo>): Promise<Veiculo> {
  if (veiculoData.placa) {
    const placaFormatada = veiculoData.placa.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
    const jaExiste = await checkPlacaExists(placaFormatada, id);
    if (jaExiste) {
      throw new Error(`A placa ${placaFormatada} já está em uso por outro veículo.`);
    }
    veiculoData.placa = placaFormatada;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    const index = mockVeiculos.findIndex((v) => v.id === id);
    if (index === -1) throw new Error('Veículo não encontrado.');
    mockVeiculos[index] = { ...mockVeiculos[index], ...veiculoData };
    return mockVeiculos[index];
  }

  const payload: any = {};
  if (veiculoData.cliente_id) payload.cliente_id = veiculoData.cliente_id;
  if (veiculoData.placa) payload.placa = veiculoData.placa;
  if (veiculoData.marca) payload.marca = veiculoData.marca.trim();
  if (veiculoData.modelo) payload.modelo = veiculoData.modelo.trim();
  if (veiculoData.ano !== undefined) payload.ano = veiculoData.ano;
  if (veiculoData.cor !== undefined) payload.cor = veiculoData.cor?.trim() || null;
  if (veiculoData.km_atual !== undefined) payload.km_atual = Number(veiculoData.km_atual);

  const { data, error } = await supabase
    .from('veiculos')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar veículo:', error);
    throw new Error(`Falha ao atualizar veículo: ${error.message}`);
  }
  return data;
}

export async function deleteVeiculo(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    mockVeiculos = mockVeiculos.filter((v) => v.id !== id);
    mockServicos = mockServicos.filter((s) => s.veiculo_id !== id);
    return;
  }

  const { error } = await supabase.from('veiculos').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir veículo:', error);
    throw new Error(`Falha ao excluir veículo: ${error.message}`);
  }
}

// ================= SERVIÇOS CRUD =================
export async function getServicos(): Promise<Servico[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return mockServicos.map((s) => {
      const c = mockClientes.find((cli) => cli.id === s.cliente_id);
      const v = mockVeiculos.find((vei) => vei.id === s.veiculo_id);
      return {
        ...s,
        cliente_nome: c ? c.nome : 'Cliente Desconhecido',
        cliente_telefone: c ? c.telefone : '',
        veiculo_placa: v ? v.placa : 'PLACA',
        veiculo_modelo: v ? v.modelo : 'Modelo',
        veiculo_marca: v ? v.marca : '',
      };
    }).sort((a, b) => new Date(b.data_entrada).getTime() - new Date(a.data_entrada).getTime());
  }

  const { data, error } = await supabase
    .from('servicos')
    .select(`
      *,
      clientes (
        nome,
        telefone
      ),
      veiculos (
        placa,
        modelo,
        marca
      )
    `)
    .order('data_entrada', { ascending: false });

  if (error) {
    console.error('Erro ao buscar serviços no Supabase:', error);
    throw new Error(`Erro ao buscar serviços: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    cliente_id: item.cliente_id,
    veiculo_id: item.veiculo_id,
    descricao: item.descricao,
    valor: Number(item.valor) || 0,
    status: item.status as ServiceStatus,
    data_entrada: item.data_entrada,
    data_conclusao: item.data_conclusao,
    observacoes: item.observacoes,
    cliente_nome: item.clientes?.nome,
    cliente_telefone: item.clientes?.telefone,
    veiculo_placa: item.veiculos?.placa,
    veiculo_modelo: item.veiculos?.modelo,
    veiculo_marca: item.veiculos?.marca,
  }));
}

export async function createServico(
  servicoData: Omit<Servico, 'id' | 'data_entrada' | 'data_conclusao'> & {
    data_entrada?: string;
  }
): Promise<Servico> {
  const supabase = getSupabaseClient();
  const dataEntrada = servicoData.data_entrada || new Date().toISOString();
  const dataConclusao = servicoData.status === 'Concluído' || servicoData.status === 'Entregue'
    ? new Date().toISOString()
    : null;

  if (!supabase) {
    const novo: Servico = {
      ...servicoData,
      id: crypto.randomUUID ? crypto.randomUUID() : 's_' + Date.now(),
      data_entrada: dataEntrada,
      data_conclusao: dataConclusao,
    };
    mockServicos.unshift(novo);
    return novo;
  }

  const { data, error } = await supabase
    .from('servicos')
    .insert([
      {
        cliente_id: servicoData.cliente_id,
        veiculo_id: servicoData.veiculo_id,
        descricao: servicoData.descricao.trim(),
        valor: Number(servicoData.valor) || 0,
        status: servicoData.status,
        data_entrada: dataEntrada,
        data_conclusao: dataConclusao,
        observacoes: servicoData.observacoes?.trim() || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Erro ao abrir ordem de serviço:', error);
    throw new Error(`Falha ao abrir serviço: ${error.message}`);
  }
  return data;
}

export async function updateServico(id: string, servicoData: Partial<Servico>): Promise<Servico> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const index = mockServicos.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Serviço não encontrado.');
    const updated = { ...mockServicos[index], ...servicoData };
    if (servicoData.status === 'Concluído' && !updated.data_conclusao) {
      updated.data_conclusao = new Date().toISOString();
    }
    mockServicos[index] = updated;
    return mockServicos[index];
  }

  const payload: any = {};
  if (servicoData.cliente_id) payload.cliente_id = servicoData.cliente_id;
  if (servicoData.veiculo_id) payload.veiculo_id = servicoData.veiculo_id;
  if (servicoData.descricao !== undefined) payload.descricao = servicoData.descricao.trim();
  if (servicoData.valor !== undefined) payload.valor = Number(servicoData.valor);
  if (servicoData.status !== undefined) {
    payload.status = servicoData.status;
    if (servicoData.status === 'Concluído') {
      payload.data_conclusao = servicoData.data_conclusao || new Date().toISOString();
    }
  }
  if (servicoData.data_conclusao !== undefined) payload.data_conclusao = servicoData.data_conclusao;
  if (servicoData.observacoes !== undefined) payload.observacoes = servicoData.observacoes?.trim() || null;

  const { data, error } = await supabase
    .from('servicos')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar serviço:', error);
    throw new Error(`Falha ao atualizar serviço: ${error.message}`);
  }
  return data;
}

// Atualizar status direto (para Drag and Drop do Kanban e menu de status)
export async function updateServicoStatus(id: string, newStatus: ServiceStatus): Promise<Servico> {
  const supabase = getSupabaseClient();
  const willBeCompleted = newStatus === 'Concluído';

  if (!supabase) {
    const item = mockServicos.find((s) => s.id === id);
    if (!item) throw new Error('Serviço não encontrado');
    item.status = newStatus;
    if (willBeCompleted && !item.data_conclusao) {
      item.data_conclusao = new Date().toISOString();
    }
    return item;
  }

  const updateFields: any = {
    status: newStatus,
  };
  if (willBeCompleted) {
    updateFields.data_conclusao = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('servicos')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar status do serviço no Supabase:', error);
    throw new Error(`Falha ao atualizar status: ${error.message}`);
  }
  return data;
}

export async function deleteServico(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    mockServicos = mockServicos.filter((s) => s.id !== id);
    return;
  }

  const { error } = await supabase.from('servicos').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir serviço:', error);
    throw new Error(`Falha ao excluir serviço: ${error.message}`);
  }
}

// Inserir dados de demonstração diretamente no Supabase do usuário
export async function seedInitialDataToSupabase(): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, message: 'Supabase não conectado. Configure as credenciais primeiro.' };
  }

  try {
    // 1. Inserir clientes
    const { data: clientesInseridos, error: errCli } = await supabase
      .from('clientes')
      .insert(
        INITIAL_CLIENTES.map((c) => ({
          nome: c.nome,
          telefone: c.telefone,
          email: c.email,
          cpf: c.cpf,
          observacoes: c.observacoes,
        }))
      )
      .select();

    if (errCli) throw errCli;
    if (!clientesInseridos || clientesInseridos.length === 0) {
      throw new Error('Falha ao receber clientes inseridos.');
    }

    const c1 = clientesInseridos[0];
    const c2 = clientesInseridos[1] || clientesInseridos[0];
    const c3 = clientesInseridos[2] || clientesInseridos[0];
    const c4 = clientesInseridos[3] || clientesInseridos[0];

    // 2. Inserir veículos vinculados
    const { data: veiculosInseridos, error: errVei } = await supabase
      .from('veiculos')
      .insert([
        {
          cliente_id: c1.id,
          placa: 'BRA2E19',
          marca: 'Honda',
          modelo: 'Civic EXL 2.0',
          ano: 2021,
          cor: 'Prata',
          km_atual: 48500,
        },
        {
          cliente_id: c1.id,
          placa: 'ABC1234',
          marca: 'Toyota',
          modelo: 'Corolla Altis',
          ano: 2019,
          cor: 'Preto',
          km_atual: 74200,
        },
        {
          cliente_id: c2.id,
          placa: 'RJK4F50',
          marca: 'Jeep',
          modelo: 'Compass Longitude 1.3 Turbo',
          ano: 2022,
          cor: 'Branco Polar',
          km_atual: 32000,
        },
        {
          cliente_id: c3.id,
          placa: 'XYZ9876',
          marca: 'Fiat',
          modelo: 'Fiorino 1.4 EVO',
          ano: 2020,
          cor: 'Branco',
          km_atual: 112000,
        },
        {
          cliente_id: c4.id,
          placa: 'MER3A22',
          marca: 'Volkswagen',
          modelo: 'T-Cross Highline 250 TSI',
          ano: 2023,
          cor: 'Cinza Platinum',
          km_atual: 18400,
        },
      ])
      .select();

    if (errVei) throw errVei;
    if (!veiculosInseridos || veiculosInseridos.length === 0) {
      throw new Error('Falha ao receber veículos inseridos.');
    }

    const v1 = veiculosInseridos[0];
    const v2 = veiculosInseridos[1] || veiculosInseridos[0];
    const v3 = veiculosInseridos[2] || veiculosInseridos[0];
    const v4 = veiculosInseridos[3] || veiculosInseridos[0];
    const v5 = veiculosInseridos[4] || veiculosInseridos[0];

    // 3. Inserir serviços distribuídos nos status do Kanban
    const now = new Date();
    const { error: errServ } = await supabase.from('servicos').insert([
      {
        cliente_id: c1.id,
        veiculo_id: v1.id,
        descricao: 'Revisão completa 50.000 km: óleo 0W20, filtros, velas de ignição e pastilhas de freio dianteiras',
        valor: 980.0,
        status: 'Em execução',
        data_entrada: new Date(now.getTime() - 2 * 86400000).toISOString(),
      },
      {
        cliente_id: c2.id,
        veiculo_id: v3.id,
        descricao: 'Diagnóstico computadorizado de injeção eletrônica e limpeza do corpo de borboleta (TBI)',
        valor: 420.0,
        status: 'Em diagnóstico',
        data_entrada: new Date(now.getTime() - 1 * 86400000).toISOString(),
      },
      {
        cliente_id: c3.id,
        veiculo_id: v4.id,
        descricao: 'Substituição do kit de embreagem LUK e troca do cabo de comando',
        valor: 1350.0,
        status: 'Aguardando aprovação',
        data_entrada: new Date(now.getTime() - 4 * 86400000).toISOString(),
      },
      {
        cliente_id: c4.id,
        veiculo_id: v5.id,
        descricao: 'Alinhamento a laser, balanceamento 4 rodas e higienização com ozônio',
        valor: 260.0,
        status: 'Aguardando',
        data_entrada: now.toISOString(),
      },
      {
        cliente_id: c1.id,
        veiculo_id: v2.id,
        descricao: 'Substituição de amortecedores dianteiros Monroe, bieletas e buchas da barra estabilizadora',
        valor: 1780.0,
        status: 'Concluído',
        data_entrada: new Date(now.getTime() - 5 * 86400000).toISOString(),
        data_conclusao: new Date(now.getTime() - 1 * 86400000).toISOString(),
      },
      {
        cliente_id: c1.id,
        veiculo_id: v1.id,
        descricao: 'Polimento de faróis e cristalização do parabrisa dianteiro',
        valor: 200.0,
        status: 'Entregue',
        data_entrada: new Date(now.getTime() - 12 * 86400000).toISOString(),
        data_conclusao: new Date(now.getTime() - 11 * 86400000).toISOString(),
      },
    ]);

    if (errServ) throw errServ;

    return {
      success: true,
      message: 'Base de dados de demonstração inserida com sucesso no seu Supabase!',
    };
  } catch (err: any) {
    console.error('Erro ao popular dados no Supabase:', err);
    return {
      success: false,
      message: `Erro ao popular banco: ${err.message || err}`,
    };
  }
}
