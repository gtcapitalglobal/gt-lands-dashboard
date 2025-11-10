# GT Lands Dashboard

**Professional Property Analysis Tool for Tax Lien Investments**

![GT Lands Dashboard](logo.png)

## 🎯 Sobre o Projeto

O GT Lands Dashboard é uma ferramenta profissional de análise de propriedades desenvolvida especificamente para investimentos em tax liens. O sistema permite importar dados de propriedades via CSV (Parcel Fair), filtrar e selecionar propriedades de interesse, e realizar análises detalhadas através de 11 ferramentas integradas.

## ✨ Funcionalidades Principais

### TELA 1 - Seleção de Propriedades
- **Importação CSV**: Sistema IPP (Importar Propriedades Para Pesquisa)
- **Filtros Avançados**: Filtre por cidade, county, tipo de propriedade, área, valor
- **Seleção Múltipla**: Checkboxes para selecionar propriedades de interesse
- **Visualização em Mapa**: Integração com Leaflet.js para visualização geográfica
- **Gestão de Dados**: Botões para deletar selecionadas ou filtradas

### TELA 2 - Análise Detalhada
- **Carrossel de Imagens**: Street View e Satellite View via Google Maps API
- **11 Ferramentas de Análise**:
  1. 🔍 **Crime Score** - Análise de criminalidade via SpotCrime API
  2. 🌪️ **Disaster History** - Histórico de desastres via FEMA API
  3. 🏗️ **Zoning & Land Use** - Informações de zoneamento
  4. 🖼️ **Images AI Analysis** - Análise de imagens com IA
  5. 🏘️ **Comps + BID** - Comparáveis e ofertas via Zillow/RapidAPI
  6. 🤖 **AI Recommends** - Recomendações de IA via OpenAI GPT-4
  7. 📊 **Simulator** - Simulador de investimento
  8. 📍 **Proximity** - Análise de proximidade
  9. 🏫 **Schools** - Informações de escolas via GreatSchools API
  10. 📈 **Market Trends** - Tendências de mercado
  11. 💰 **Tax History** - Histórico de impostos

## 🚀 Deploy Rápido no Netlify

### Pré-requisitos
- Conta no [Netlify](https://netlify.com)
- Conta no GitHub conectada ao Netlify

### Passos para Deploy

1. **Conectar Repositório ao Netlify**:
   - Acesse [Netlify](https://app.netlify.com)
   - Clique em "Add new site" → "Import an existing project"
   - Escolha "GitHub" e selecione o repositório `gtcapitalglobal/gt-lands-dashboard`

2. **Configurações de Build**:
   - **Build command**: (deixe vazio)
   - **Publish directory**: `/` (raiz do projeto)
   - **Branch to deploy**: `main`

3. **Deploy**:
   - Clique em "Deploy site"
   - Aguarde o deploy finalizar (1-2 minutos)
   - Seu dashboard estará disponível em: `https://[seu-site].netlify.app`

4. **Configurar Domínio Personalizado** (Opcional):
   - Em "Site settings" → "Domain management"
   - Adicione seu domínio customizado

## 🔑 APIs Integradas

O dashboard utiliza as seguintes APIs (já configuradas no código):

1. **Google Maps API** - Street View e Satellite View
   - ✅ GRÁTIS até 28.000 requisições/mês
   
2. **OpenAI API** - GPT-4 para análises e recomendações
   - 💰 ~$5-20/mês dependendo do uso
   
3. **RapidAPI (Zillow)** - Dados de propriedades e comparáveis
   - ✅ Plano BASIC gratuito disponível
   
4. **SpotCrime API** - Dados de criminalidade
   - ✅ GRÁTIS
   
5. **FEMA API** - Histórico de desastres
   - ✅ GRÁTIS
   
6. **GreatSchools API** - Informações de escolas
   - ✅ GRÁTIS

## 📁 Estrutura de Arquivos

```
gt-lands-dashboard/
├── dashboard-v20-simple.html  # TELA 1 - Interface principal
├── workflow-simple.js          # Gerenciamento de workflow e carrossel
├── analysis.js                 # 11 ferramentas de análise
├── logo.png                    # Logo GT Lands
├── sold-icon.png              # Ícone de propriedade vendida
├── example.csv                # Arquivo CSV de exemplo
└── README.md                  # Este arquivo
```

## 📊 Formato do CSV

O arquivo CSV deve conter as seguintes colunas:

```csv
Parcel,Acres,Type,Name,Address,City,County,Amount,LegalDesc
123-456-789,0.25,SFR,John Doe,123 Main St,Miami,Miami-Dade,$5000,LOT 1 BLOCK 2
```

### Colunas Obrigatórias:
- **Parcel**: Número do parcel
- **Acres**: Área em acres
- **Type**: Tipo de propriedade (SFR, Condo, Land, etc.)
- **Name**: Nome do proprietário
- **Address**: Endereço completo
- **City**: Cidade
- **County**: Condado
- **Amount**: Valor do tax lien
- **LegalDesc**: Descrição legal da propriedade

## 🎨 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, Tailwind CSS
- **JavaScript**: Vanilla JS (ES6+)
- **Mapas**: Leaflet.js
- **APIs**: Google Maps, OpenAI, RapidAPI, SpotCrime, FEMA, GreatSchools

## 📝 Como Usar

1. **Importar Propriedades**:
   - Clique em "IPP - Importar Propriedades Para Pesquisa"
   - Selecione seu arquivo CSV
   - As propriedades serão carregadas na tabela e no mapa

2. **Filtrar e Selecionar**:
   - Use os filtros no topo da página
   - Marque os checkboxes das propriedades de interesse
   - Ou use "Select All Filtered" para selecionar todas as filtradas

3. **Realizar Análise**:
   - Clique em "Realizar Pesquisas" (mínimo 1 propriedade selecionada)
   - A TELA 2 abrirá com o carrossel de imagens
   - Use as 11 ferramentas de análise disponíveis
   - Navegue entre propriedades usando as setas

4. **Gerenciar Dados**:
   - "Delete Selected": Remove propriedades selecionadas
   - "Delete Filtered": Remove propriedades filtradas
   - "Clear All": Limpa todos os dados

## 🔒 Segurança

⚠️ **IMPORTANTE**: Este repositório contém API keys hardcoded no código para facilitar o deploy. 

**Recomendações de Segurança**:
- Não compartilhe este repositório publicamente
- Considere tornar o repositório privado no GitHub
- Monitore o uso das APIs para evitar custos inesperados
- Para produção, considere usar variáveis de ambiente

## 📞 Suporte

Para questões ou suporte, entre em contato com GT Capital Global.

## 📄 Licença

© 2024 GT Capital Global. Todos os direitos reservados.

---

**Desenvolvido por GT Capital Global** 🏢

