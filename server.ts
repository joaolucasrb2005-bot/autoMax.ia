import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API de Diagnóstico Mecânico Inteligente AutoMax com Raciocínio (Thinking Mode)
app.post('/api/diagnose', async (req, res) => {
  const { veiculo, sintomas, historico } = req.body;

  if (!sintomas || typeof sintomas !== 'string') {
    return res.status(400).json({ error: 'Os sintomas do veículo são obrigatórios.' });
  }

  const prompt = `Você é o Engenheiro Chefe Mecânico e Especialista em Diagnóstico Automotivo da oficina AutoMax.
Analise a situação do veículo a seguir e forneça um laudo técnico completo, estruturado e prático:

VEÍCULO:
- Marca/Modelo: ${veiculo?.marca || 'Não informado'} ${veiculo?.modelo || ''}
- Ano: ${veiculo?.ano || 'Não informado'}
- Km Atual: ${veiculo?.km_atual ? veiculo.km_atual + ' km' : 'Não informado'}

SINTOMAS RELATADOS PELO CLIENTE OU MECÂNICO:
${sintomas}

HISTÓRICO RECENTE:
${historico || 'Nenhum serviço prévio informado.'}

Responda em Português do Brasil com uma estrutura clara:
1. 🔍 DIAGNÓSTICO PRELIMINAR & CAUSAS PROVÁVEIS (liste as 2 ou 3 falhas mais comuns para esse conjunto de sintomas e motorização).
2. 🛠️ TESTES E PROCEDIMENTOS RECOMENDADOS (passo a passo para a equipe da oficina testar antes de trocar peças).
3. 📦 PEÇAS PROVÁVEIS PARA SUBSTITUIÇÃO.
4. ⏱️ TEMPO ESTIMADO DE MÃO DE OBRA (em horas).
5. 💰 FAIXA DE VALOR ESTIMADO DE REPARO (R$) (estimativa sugerida para compor o orçamento).
6. ⚠️ AVISO DE SEGURANÇA E RISCO AO CLIENTE (se pode rodar com o carro ou não).`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        analysis: `⚠️ Chave GEMINI_API_KEY não configurada no ambiente. 
Diagnóstico Técnico Padrão AutoMax:
- Proceda com varredura completa via scanner OBD-II para leitura de códigos DTC.
- Inspecione visualmente vazamentos, folgas nas buchas/terminais e estado de fluidos.
- Realize teste de rodagem monitorando temperatura, ruídos e resposta dos freios.`,
      });
    }

    const ai = new GoogleGenAI();
    let response;
    
    // Tenta utilizar o modelo com thinking conforme instrução
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 2048,
          },
        },
      });
    } catch (modelErr) {
      console.warn('Fallback sem thinkingBudget:', modelErr);
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
    }

    return res.status(200).json({
      analysis: response.text || 'Nenhum laudo gerado.',
    });
  } catch (error: any) {
    console.error('Erro na API de Diagnóstico Gemini:', error);
    return res.status(500).json({
      error: 'Falha ao processar diagnóstico inteligente: ' + (error.message || error),
    });
  }
});

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'AutoMax CRM', timestamp: new Date().toISOString() });
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AutoMax CRM server rodando na porta ${PORT}`);
  });
}

startServer();
