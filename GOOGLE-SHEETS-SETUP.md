# 🔒 Configuração Segura de API Keys com Google Sheets

Este guia mostra como configurar o Google Sheets + Google Apps Script para gerenciar suas API keys de forma **100% segura**.

---

## 📋 **Passo 1: Preparar o Google Sheets**

### **1.1. Criar ou Abrir Google Sheets**
1. Abra o Google Sheets onde você colocou suas API keys
2. Ou crie um novo: https://sheets.new

### **1.2. Estrutura do Google Sheets**

Crie uma aba chamada **"API Keys"** com esta estrutura:

| **A: Nome da API** | **B: API Key** | **C: Status** |
|--------------------|----------------|---------------|
| Google Maps        | AIzaSyBr4Ut... | Ativa         |
| OpenAI             | sk-proj-e83... | Ativa         |
| Gemini             | AIzaSyAZbo...  | Ativa         |
| Perplexity         | pplx-...       | Inativa       |
| Zillow             | 3eff6f411m...  | Ativa         |
| Realtor.com        | 3eff6f411m...  | Ativa         |
| Realty Mole        | sua-key...     | Ativa         |

**IMPORTANTE:**
- **Coluna A:** Nome da API (exatamente como está na tabela acima)
- **Coluna B:** Sua API Key
- **Coluna C:** "Ativa" ou "Inativa" (só as ativas serão carregadas)

---

## 📝 **Passo 2: Configurar Google Apps Script**

### **2.1. Abrir Apps Script**
1. No Google Sheets, clique em **Extensions** → **Apps Script**
2. Uma nova aba vai abrir com o editor de código

### **2.2. Colar o Código**
1. **Delete** todo o código que está lá (função `myFunction()`)
2. **Copie** o código do arquivo `google-apps-script-api-keys.js`
3. **Cole** no editor
4. Clique em **💾 Save** (Ctrl+S)

### **2.3. IMPORTANTE: Mudar a Senha Secreta**

No código, procure esta linha:

```javascript
const SECRET_PASSWORD = 'GT_LANDS_2025_SECURE';
```

**MUDE** para uma senha forte e única! Exemplo:

```javascript
const SECRET_PASSWORD = 'MinhaS3nh@Sup3rS3gur@2025!';
```

⚠️ **GUARDE ESSA SENHA!** Você vai precisar dela no dashboard!

### **2.4. Testar o Código**

1. No topo, selecione a função **`testGetApiKeys`**
2. Clique em **▶️ Run**
3. **Primeira vez:** Vai pedir permissões
   - Clique em **"Review permissions"**
   - Escolha sua conta Google
   - Clique em **"Advanced"** → **"Go to GT Lands API Keys (unsafe)"**
   - Clique em **"Allow"**
4. Veja o resultado em **View** → **Logs**
5. Deve mostrar suas API keys!

---

## 🚀 **Passo 3: Publicar como Web App**

### **3.1. Fazer Deploy**
1. No Apps Script, clique em **Deploy** → **New deployment**
2. Clique no ícone de **⚙️** (engrenagem) ao lado de "Select type"
3. Escolha **"Web app"**

### **3.2. Configurações do Deploy**

Preencha assim:

- **Description:** `GT Lands API Keys Manager`
- **Execute as:** **Me** (sua conta)
- **Who has access:** **Anyone**

⚠️ **Não se preocupe!** Mesmo escolhendo "Anyone", só quem tiver a senha secreta consegue acessar!

### **3.3. Fazer Deploy**
1. Clique em **Deploy**
2. **Copie a URL** que aparece (algo como: `https://script.google.com/macros/s/AKfycby.../exec`)
3. **GUARDE ESSA URL!** Você vai precisar no dashboard!

---

## 🎯 **Passo 4: Configurar no Dashboard**

### **4.1. Abrir Configurações**
1. Abra o dashboard GT Lands
2. Clique em **⚙️ Configurações**

### **4.2. Configurar Google Sheets Integration**

Procure a seção **"🔒 Google Sheets Integration"** e preencha:

1. **Web App URL:** Cole a URL que você copiou no Passo 3.3
2. **Senha Secreta:** Cole a senha que você definiu no Passo 2.3
3. Clique em **"💾 Salvar Configuração"**
4. Clique em **"🔄 Carregar API Keys do Google Sheets"**

### **4.3. Testar**

Se tudo estiver correto, você verá:
- ✅ **Sucesso!** API Keys carregadas do Google Sheets!
- Todas as suas API keys serão carregadas automaticamente!

---

## 🔒 **Segurança**

### **✅ O Que Está Protegido:**
- ✅ Google Sheets fica **privado** (só você acessa)
- ✅ Apps Script requer **senha secreta**
- ✅ API keys **nunca ficam expostas** no código do dashboard
- ✅ Você pode **revogar acesso** a qualquer momento

### **🔐 Como Revogar Acesso:**
1. Vá no Apps Script
2. Clique em **Deploy** → **Manage deployments**
3. Clique em **🗑️ Archive** ao lado do deployment
4. Pronto! Ninguém mais consegue acessar

---

## 🆘 **Solução de Problemas**

### **❌ Erro: "Senha incorreta"**
- Verifique se a senha no dashboard é **exatamente igual** à senha no Apps Script
- Cuidado com espaços extras!

### **❌ Erro: "Aba 'API Keys' não encontrada"**
- Verifique se a aba se chama **exatamente** "API Keys" (com espaço e maiúsculas)
- Ou mude no código: `const SHEET_NAME = 'Sua Aba';`

### **❌ Erro: "Authorization required"**
- Execute a função `testGetApiKeys` no Apps Script
- Autorize as permissões

### **❌ Erro: "Script function not found"**
- Certifique-se de que salvou o código (Ctrl+S)
- Faça um novo deployment

---

## 📚 **Estrutura Recomendada do Google Sheets**

```
┌─────────────────────────────────────────────────────────┐
│ Aba: API Keys                                           │
├──────────────────┬──────────────────────┬───────────────┤
│ Nome da API      │ API Key              │ Status        │
├──────────────────┼──────────────────────┼───────────────┤
│ Google Maps      │ AIzaSyBr4Ut...       │ Ativa         │
│ OpenAI           │ sk-proj-e83ak...     │ Ativa         │
│ Gemini           │ AIzaSyAZbo...        │ Ativa         │
│ Perplexity       │ pplx-...             │ Inativa       │
│ Zillow           │ 3eff6f411m...        │ Ativa         │
│ Realtor.com      │ 3eff6f411m...        │ Ativa         │
│ Realty Mole      │ sua-key...           │ Ativa         │
└──────────────────┴──────────────────────┴───────────────┘
```

---

## 🎉 **Pronto!**

Agora suas API keys estão **100% seguras** e você pode:
- ✅ Gerenciar tudo pelo Google Sheets
- ✅ Atualizar API keys sem mexer no código
- ✅ Ativar/Desativar APIs mudando o status
- ✅ Acessar de qualquer dispositivo
- ✅ Ter backup automático no Google Drive

---

## 💡 **Dicas Extras**

### **Adicionar Nova API:**
1. Adicione uma nova linha no Google Sheets
2. Preencha: Nome | API Key | Ativa
3. Clique em "🔄 Carregar API Keys" no dashboard
4. Pronto!

### **Desativar API Temporariamente:**
1. Mude o status de "Ativa" para "Inativa"
2. Clique em "🔄 Carregar API Keys" no dashboard
3. A API não será mais carregada!

### **Compartilhar com Equipe:**
1. Compartilhe o Google Sheets com sua equipe
2. Compartilhe a senha secreta (por canal seguro!)
3. Todos terão acesso às mesmas API keys!

---

**Precisa de ajuda? Entre em contato!** 📧

