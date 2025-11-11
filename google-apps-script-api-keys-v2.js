/**
 * GT Lands - Google Apps Script para Gerenciar API Keys
 * VERSÃO 2.0 - Suporte a Português e Inglês
 */

// Nome da aba do Google Sheets onde estão as API keys
const SHEET_NAME = 'API keys';

// ⚠️ MUDE ESTA SENHA PARA UMA SENHA FORTE E ÚNICA!
const SECRET_PASSWORD = 'teste 102030';

/**
 * Função chamada quando o dashboard faz uma requisição GET
 */
function doGet(e) {
  try {
    const password = e.parameter.password;
    
    if (password !== SECRET_PASSWORD) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Senha incorreta! Acesso negado.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
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
 * Busca todas as API keys do Google Sheets
 */
function getApiKeys() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    throw new Error(`Aba "${SHEET_NAME}" não encontrada!`);
  }
  
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1); // Remove cabeçalho
  
  const apiKeys = {};
  
  rows.forEach(row => {
    const apiName = row[0];
    const apiKey = row[1];
    const status = row[2];
    
    // Só adiciona se estiver ativa
    if (status && (status.toString().toLowerCase() === 'ativa' || status.toString().toLowerCase() === 'active')) {
      const keyName = normalizeApiName(apiName);
      if (keyName) {
        apiKeys[keyName] = apiKey;
      }
    }
  });
  
  return apiKeys;
}

/**
 * Normaliza o nome da API (Suporta Português e Inglês)
 */
function normalizeApiName(name) {
  if (!name) return '';
  
  const nameStr = name.toString().trim();
  
  // Mapeamento completo - Português e Inglês
  const mapping = {
    // OpenAI
    'Open AI': 'openaiApiKey',
    'OpenAI': 'openaiApiKey',
    'OpenAI API': 'openaiApiKey',
    'Open AI API': 'openaiApiKey',
    
    // Google Maps
    'Google Maps': 'googleMapsApiKey',
    'Google Maps API': 'googleMapsApiKey',
    'Maps': 'googleMapsApiKey',
    
    // Gemini
    'Google AI Studio (Gemini)': 'geminiApiKey',
    'Google AI Studio': 'geminiApiKey',
    'Gemini': 'geminiApiKey',
    'Gemini API': 'geminiApiKey',
    'Google Gemini': 'geminiApiKey',
    'Google Gemini API': 'geminiApiKey',
    
    // Perplexity
    'Perplexity': 'perplexityApiKey',
    'Perplexity API': 'perplexityApiKey',
    'Perplexity Sonar': 'perplexityApiKey',
    'Sonar': 'perplexityApiKey',
    
    // RapidAPI (Zillow, Realtor, etc.)
    'Zillow (Rapid)': 'rapidApiKey',
    'Zillow': 'rapidApiKey',
    'Zillow API': 'rapidApiKey',
    'Zillow RapidAPI': 'rapidApiKey',
    'Realtor (Rapid)': 'rapidApiKey',
    'Realtor': 'rapidApiKey',
    'Realtor.com': 'rapidApiKey',
    'Realtor.com (Rapid)': 'rapidApiKey',
    'Realtor API': 'rapidApiKey',
    'Realtor.com API': 'rapidApiKey',
    'RapidAPI': 'rapidApiKey',
    'RapidAPI Key': 'rapidApiKey',
    'X-RapidAPI-Key': 'rapidApiKey',
    
    // Realty Mole
    'Realty Mole': 'realtyMoleApiKey',
    'Realty Mole API': 'realtyMoleApiKey',
    'RealtyMole': 'realtyMoleApiKey'
  };
  
  // Tentar encontrar no mapeamento
  const normalized = mapping[nameStr];
  if (normalized) return normalized;
  
  // Se não encontrou, criar automaticamente
  return nameStr
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .map((word, index) => {
      if (index === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('') + 'ApiKey';
}

/**
 * Função de teste - Execute esta função para ver se está funcionando
 */
function testGetApiKeys() {
  const apiKeys = getApiKeys();
  Logger.log('===== API KEYS ENCONTRADAS =====');
  Logger.log(JSON.stringify(apiKeys, null, 2));
  Logger.log('================================');
  Logger.log('Total de APIs ativas: ' + Object.keys(apiKeys).length);
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
  Logger.log('===== RESPOSTA DO WEB APP =====');
  Logger.log(response.getContent());
  Logger.log('================================');
}

