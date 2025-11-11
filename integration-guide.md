# 📘 Guia de Integração - Protótipos no Dashboard v21

## 🎯 Objetivo

Este guia explica como integrar os protótipos **TELA 2** e **Comps + BID** no dashboard principal (dashboard-v21.html).

---

## 📦 Arquivos Criados

1. **screen2-prototype.html** - TELA 2 com carrossel de imagens
2. **comps-bid-prototype.html** - Análise de Comps e cálculo de BID
3. **integration-guide.md** - Este guia

---

## 🚀 Integração da TELA 2

### **Passo 1: Adicionar HTML da TELA 2**

Adicione este código **ANTES** do fechamento do `</body>` no dashboard-v21.html:

```html
<!-- TELA 2: Análise de Propriedade -->
<div id="screen2" class="hidden fixed inset-0 bg-gray-100 z-50 overflow-y-auto">
    <!-- Copie TODO o conteúdo do <body> do screen2-prototype.html aqui -->
    <!-- EXCETO as tags <script> -->
</div>
```

### **Passo 2: Adicionar CSS da TELA 2**

Copie o conteúdo do `<style>` do screen2-prototype.html e adicione no `<style>` do dashboard-v21.html.

### **Passo 3: Adicionar JavaScript da TELA 2**

Copie o conteúdo do `<script>` do screen2-prototype.html e adicione **ANTES** do fechamento do `</script>` principal do dashboard-v21.html.

### **Passo 4: Criar Função para Abrir TELA 2**

Adicione esta função no JavaScript do dashboard-v21.html:

```javascript
function openScreen2(selectedProperties) {
    // selectedProperties = array de propriedades selecionadas
    
    // Atualizar dados globais
    window.screen2Properties = selectedProperties;
    window.screen2CurrentIndex = 0;
    
    // Carregar primeira propriedade
    loadPropertyInScreen2(0);
    
    // Mostrar TELA 2
    document.getElementById('screen2').classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Bloquear scroll do body
}

function closeScreen2() {
    document.getElementById('screen2').classList.add('hidden');
    document.body.style.overflow = 'auto'; // Restaurar scroll
}
```

### **Passo 5: Conectar Botão "Realizar Pesquisas"**

Modifique o botão "Realizar Pesquisas" para abrir a TELA 2:

```javascript
document.getElementById('startResearchBtn').addEventListener('click', () => {
    const selectedProperties = getSelectedProperties(); // Função que retorna propriedades selecionadas
    
    if (selectedProperties.length === 0) {
        alert('Selecione pelo menos 1 propriedade!');
        return;
    }
    
    openScreen2(selectedProperties);
});
```

---

## 💰 Integração do Comps + BID

### **Opção 1: Modal (Recomendado)**

Adicione o modal do Comps + BID como um overlay:

```html
<!-- Modal Comps + BID -->
<div id="compsModal" class="hidden fixed inset-0 bg-black bg-opacity-70 z-50 overflow-y-auto">
    <div class="min-h-screen px-4 py-8">
        <div class="max-w-7xl mx-auto">
            <!-- Copie TODO o conteúdo do comps-bid-prototype.html aqui -->
            <!-- EXCETO <html>, <head>, <body> -->
            
            <!-- Adicione botão fechar -->
            <button onclick="closeCompsModal()" class="fixed top-4 right-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                ✕ Fechar
            </button>
        </div>
    </div>
</div>
```

### **Opção 2: Página Separada**

Mantenha o comps-bid-prototype.html como arquivo separado e abra em nova aba:

```javascript
function openCompsAnalysis(property) {
    // Salvar dados da propriedade no localStorage
    localStorage.setItem('currentProperty', JSON.stringify(property));
    
    // Abrir em nova aba
    window.open('comps-bid-prototype.html', '_blank');
}
```

### **Conectar Botão "🔍 Comps + BID"**

Na TELA 2, conecte o botão do GRUPO 2:

```javascript
// No screen2-prototype.html, modifique a função:
function analyzeComps() {
    const currentProperty = properties[currentPropertyIndex];
    openCompsAnalysis(currentProperty);
}
```

---

## 🔑 API Keys Necessárias

### **Google Maps API Key**

Para que o carrossel de imagens funcione, você precisa de uma API key do Google Maps.

**Como obter:**
1. Acesse: https://console.cloud.google.com/
2. Crie um projeto
3. Ative as APIs:
   - Maps JavaScript API
   - Maps Embed API
   - Street View Static API
4. Crie uma API key
5. Adicione restrições (opcional)

**Onde usar:**
No screen2-prototype.html, substitua `YOUR_API_KEY` pela sua key real:

```javascript
const streetViewUrl = `https://www.google.com/maps/embed/v1/streetview?key=SUA_API_KEY_AQUI&location=${prop.lat},${prop.lng}&heading=0&pitch=0&fov=90`;
```

**Custo:**
- GRÁTIS até $200/mês de crédito
- Depois: ~$7 por 1.000 visualizações

---

## 📋 Checklist de Integração

### TELA 2:
- [ ] HTML copiado para dashboard-v21.html
- [ ] CSS copiado para <style>
- [ ] JavaScript copiado para <script>
- [ ] Função openScreen2() criada
- [ ] Botão "Realizar Pesquisas" conectado
- [ ] Google Maps API key configurada
- [ ] Testado com propriedades reais

### Comps + BID:
- [ ] Modal ou página separada escolhida
- [ ] HTML integrado (se modal)
- [ ] CSS integrado (se modal)
- [ ] JavaScript integrado (se modal)
- [ ] Função openCompsAnalysis() criada
- [ ] Botão "🔍 Comps + BID" conectado
- [ ] Testado cálculo de BID

---

## 🧪 Como Testar

### Testar TELA 2:
1. Abra dashboard-v21.html
2. Importe um CSV com propriedades
3. Selecione 2-3 propriedades (checkboxes)
4. Clique em "Realizar Pesquisas"
5. Deve abrir a TELA 2 em fullscreen
6. Teste navegação: ← → (setas)
7. Teste carrossel: Street View ↔ Satellite
8. Teste botões do GRUPO 1
9. Clique em "Passou na Eliminação"
10. Verifique se GRUPO 2 desbloqueou
11. Teste navegação entre propriedades

### Testar Comps + BID:
1. Na TELA 2, desbloqueie GRUPO 2
2. Clique em "🔍 Comps + BID"
3. Deve abrir modal ou nova aba
4. Clique em "Buscar Comps e Analisar"
5. Aguarde loading (2 segundos)
6. Verifique se 8 comps aparecem
7. Ajuste ROI slider (20%-50%)
8. Selecione tier de reforma (SOFT)
9. Clique em "Calcular BID Recomendado"
10. Verifique se BID Mínimo, Ideal e Máximo aparecem
11. Verifique projeção de lucro

---

## ⚠️ Pontos de Atenção

### TELA 2:
- **Google Maps API**: Sem API key, os iframes não carregam
- **Propriedades vazias**: Adicione validação para evitar erro
- **Coordenadas inválidas**: Verifique se lat/lng existem
- **Mobile**: Teste swipe em dispositivos móveis

### Comps + BID:
- **Dados mock**: Os comps são dados de exemplo, integre API real (Zillow, Redfin)
- **Cálculos**: Valide fórmulas de BID com especialista
- **Red Flags**: Integre APIs reais (FEMA, SpotCrime)
- **Salvamento**: Implemente localStorage ou banco de dados

---

## 🔗 Integrações Futuras

### APIs Recomendadas:

1. **RapidAPI Zillow** - Buscar comps reais
   - URL: https://rapidapi.com/apimaker/api/zillow-com1
   - Custo: $50-200/mês

2. **Google Vision AI** - Análise de imagens
   - URL: https://cloud.google.com/vision
   - Custo: $1-3/mês

3. **FEMA API** - Flood zones
   - URL: https://www.fema.gov/about/openfema/api
   - Custo: GRÁTIS

4. **SpotCrime API** - Crime info
   - URL: https://spotcrime.com/api
   - Custo: GRÁTIS (limitado)

---

## 📞 Suporte

Se tiver dúvidas ou problemas na integração:

1. Verifique o console do navegador (F12) para erros
2. Teste os protótipos standalone primeiro
3. Valide se todas as funções foram copiadas
4. Confirme se as IDs dos elementos estão corretas

---

## ✅ Resultado Final

Após a integração completa, você terá:

✅ Dashboard com TELA 2 integrada
✅ Carrossel de imagens (Street View + Satellite)
✅ Navegação entre propriedades
✅ Botões de análise (GRUPO 1 e 2)
✅ Sistema de checkpoint
✅ Análise de Comps completa
✅ Calculadora de BID funcional
✅ Projeção de lucro e ROI

---

**Boa integração! 🚀**

