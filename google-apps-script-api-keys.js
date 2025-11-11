/**
 * GT Lands - Google Apps Script para Gerenciar API Keys
 * 
 * Este script lê API keys do Google Sheets e retorna de forma segura
 * para o dashboard, com autenticação e controle de acesso.
 * 
 * COMO USAR:
 * 1. Abra seu Google Sheet com as API keys
 * 2. Vá em Extensions → Apps Script
 * 3. Cole este código
 * 4. Clique em "Deploy" → "New deployment"
 * 5. Escolha "Web app"
 * 6. Execute como: "Me"
 * 7. Who has access: "Anyone" (mas com senha secreta)
 * 8. Copie a URL do Web App
 * 9. Cole no dashboard
 */

// ========================================
// CONFIGURAÇÕES
// ========================================

// Nome da aba do Google Sheets onde estão as API keys
const SHEET_NAME = 'API Keys';

// Senha secreta para acessar as API keys (MUDE ISSO!)
const SECRET_PASSWORD = 'GT_LANDS_2025_SECURE';

// ========================================
// FUNÇÃO PRINCIPAL (Web App)
// ========================================

/**
 * Função chamada quando o dashboard faz uma requisição GET
 */
function doGet(e) {
  try {
    // Verificar senha
    const password = e.parameter.password;
    
    if (password !== SECRET_PASSWORD) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Senha incorreta! Acesso negado.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Buscar API keys
    const apiKeys = getApiKeys();
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: apiKeys,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Função chamada quando o dashboard faz uma requisição POST
 * (para atualizar API keys no futuro, se necessário)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const password = data.password;
    
    if (password !== SECRET_PASSWORD) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Senha incorreta! Acesso negado.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Aqui você pode adicionar lógica para atualizar API keys
    // Por enquanto, apenas retorna sucesso
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Funcionalidade de atualização em desenvolvimento'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Busca todas as API keys do Google Sheets
 */
function getApiKeys() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    throw new Error(`Aba "${SHEET_NAME}" não encontrada! Crie uma aba com esse nome.`);
  }
  
  // Pegar todos os dados (assumindo que está em formato: Nome | API Key | Status)
  const data = sheet.getDataRange().getValues();
  
  // Remover cabeçalho
  const headers = data[0];
  const rows = data.slice(1);
  
  // Converter para objeto
  const apiKeys = {};
  
  rows.forEach(row => {
    const apiName = row[0]; // Coluna A: Nome da API
    const apiKey = row[1];  // Coluna B: API Key
    const status = row[2];  // Coluna C: Status (Ativa/Inativa)
    
    // Só adiciona se estiver ativa
    if (status && status.toString().toLowerCase() === 'ativa') {
      // Normalizar nome da API para usar como chave
      const keyName = normalizeApiName(apiName);
      apiKeys[keyName] = apiKey;
    }
  });
  
  return apiKeys;
}

/**
 * Normaliza o nome da API para usar como chave
 * Exemplo: "Google Maps API" → "googleMapsApiKey"
 */
function normalizeApiName(name) {
  if (!name) return '';
  
  // Mapeamento de nomes conhecidos
  const mapping = {
    'Google Maps': 'googleMapsApiKey',
    'Google Maps API': 'googleMapsApiKey',
    'OpenAI': 'openaiApiKey',
    'OpenAI API': 'openaiApiKey',
    'Gemini': 'geminiApiKey',
    'Gemini API': 'geminiApiKey',
    'Google Gemini': 'geminiApiKey',
    'Google Gemini API': 'geminiApiKey',
    'Perplexity': 'perplexityApiKey',
    'Perplexity API': 'perplexityApiKey',
    'Perplexity Sonar': 'perplexityApiKey',
    'Sonar': 'perplexityApiKey',
    'Zillow': 'zillowApiKey',
    'Zillow API': 'zillowApiKey',
    'Zillow RapidAPI': 'zillowApiKey',
    'Realtor': 'realtorApiKey',
    'Realtor.com': 'realtorApiKey',
    'Realtor API': 'realtorApiKey',
    'Realtor.com API': 'realtorApiKey',
    'Realty Mole': 'realtyMoleApiKey',
    'Realty Mole API': 'realtyMoleApiKey',
    'RapidAPI': 'rapidApiKey',
    'RapidAPI Key': 'rapidApiKey',
    'X-RapidAPI-Key': 'rapidApiKey'
  };
  
  // Tentar encontrar no mapeamento
  const normalized = mapping[name.trim()];
  if (normalized) return normalized;
  
  // Se não encontrou, criar automaticamente
  // Remove caracteres especiais e converte para camelCase
  return name
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map((word, index) => {
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('') + 'ApiKey';
}

// ========================================
// FUNÇÕES DE TESTE (Para testar no Apps Script)
// ========================================

/**
 * Função de teste - Execute esta função para ver se está funcionando
 */
function testGetApiKeys() {
  const apiKeys = getApiKeys();
  Logger.log('API Keys encontradas:');
  Logger.log(JSON.stringify(apiKeys, null, 2));
}

/**
 * Função de teste - Simula uma requisição GET
 */
function testDoGet() {
  const e = {
    parameter: {
      password: SECRET_PASSWORD
    }
  };
  
  const response = doGet(e);
  Logger.log('Resposta:');
  Logger.log(response.getContent());
}

