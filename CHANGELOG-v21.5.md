# GT Lands Dashboard - Changelog v21.5

**Data:** 10 de Novembro de 2025  
**Versão:** 21.5  
**Tipo:** Melhoria de Segurança

---

## 🔒 Mascaramento de Senha para API Keys

### Resumo
Implementação de mascaramento de senha em todos os campos de API Key na página de configurações, aumentando a segurança e privacidade das credenciais do usuário.

### Alterações Implementadas

#### 1. **Campos de API Key com Mascaramento**
- Todos os 7 campos de API Key agora utilizam `type="password"` por padrão
- API Keys são exibidas como pontos (••••••••••••••••) em vez de texto plano
- Melhora significativa na segurança visual das credenciais

#### 2. **Botões de Mostrar/Esconder**
- Adicionado botão 👁️ ao lado de cada campo de API Key
- Funcionalidade de toggle para revelar/ocultar a senha
- Ícone muda para 🚫 quando a senha está visível
- Ícone volta para 👁️ quando a senha está oculta

#### 3. **Estrutura HTML Atualizada**
```html
<div class="input-wrapper">
    <input type="password" id="apiKeyField" placeholder="...">
    <button type="button" class="toggle-password" onclick="togglePassword('apiKeyField')">👁️</button>
</div>
```

#### 4. **Estilos CSS Adicionados**
- `.input-wrapper`: Container flexível para input + botão
- `.toggle-password`: Botão posicionado absolutamente à direita do input
- Efeitos de hover e transições suaves
- Padding ajustado no input para acomodar o botão

#### 5. **Função JavaScript**
```javascript
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🚫';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}
```

### APIs Afetadas
1. ✅ Google Maps API
2. ✅ OpenAI API
3. ✅ Google Gemini API
4. ✅ Perplexity (Sonar) API
5. ✅ Zillow API (RapidAPI)
6. ✅ Realtor.com API (RapidAPI)
7. ✅ Realty Mole API

### Testes Realizados
- ✅ Campos exibem senha mascarada por padrão
- ✅ Botão de toggle funciona corretamente
- ✅ Ícone muda conforme estado (👁️ ↔ 🚫)
- ✅ Estilo visual consistente em todos os campos
- ✅ Compatibilidade com funcionalidades existentes (salvar, testar, carregar do Google Sheets)

### Arquivos Modificados
- `settings.html` - Adicionado CSS, HTML e JavaScript para mascaramento
- `todo.md` - Atualizado com tarefas concluídas da v21.5

### Arquivos Novos
- `google-apps-script-api-keys-v2.js` - Versão atualizada do script do Google Apps Script

### Benefícios de Segurança
1. **Privacidade Visual**: API Keys não ficam expostas em texto plano na tela
2. **Proteção contra Shoulder Surfing**: Dificulta visualização não autorizada
3. **Controle do Usuário**: Usuário decide quando revelar as credenciais
4. **Experiência Profissional**: Interface mais segura e confiável

### Compatibilidade
- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivos móveis (responsive design mantido)
- ✅ Integração com Google Sheets mantida
- ✅ Todas as funcionalidades anteriores preservadas

### Deploy
- **GitHub**: Commit `4d5cb76` - "v21.5: Adicionar mascaramento de senha para campos de API Key"
- **Repositório**: https://github.com/gtcapitalglobal/gt-lands-dashboard
- **Netlify**: Deploy automático (se configurado) ou manual disponível

---

## Próximas Versões Planejadas

### v21.6 - Ativação de APIs do Google Maps
- Ativar Street View Static API
- Ativar Geocoding API
- Testar todas as 4 APIs do Google Maps

### v22.0 - Integração de Protótipos
- Integrar TELA 2 (screen2-prototype.html)
- Integrar Comps + BID Calculator (comps-bid-prototype.html)
- Criar navegação entre telas

### v23.0 - Testes de APIs Imobiliárias
- Testar Zillow API com dados reais
- Testar Realtor.com API com dados reais
- Testar Realty Mole API com dados reais

---

**Desenvolvido por:** Manus AI  
**Cliente:** GT Lands (Gustavo)  
**Status:** ✅ Concluído e Publicado

