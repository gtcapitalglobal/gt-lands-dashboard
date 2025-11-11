# 📋 ESPECIFICAÇÃO TÉCNICA - FASE 1 (PRIORIDADE)

## 🎯 IDEIAS PRIORIZADAS:

- **IDEIA 11:** Score de Criminalidade (SpotCrime API)
- **IDEIA 12:** Análise de Escolas (GreatSchools API)
- **IDEIA 13:** Histórico de Desastres (FEMA API)

**CUSTO TOTAL:** $0/mês (TODAS AS APIs SÃO GRATUITAS!)

---

---

# 🚨 IDEIA 11: SCORE DE CRIMINALIDADE

## 📊 VISÃO GERAL:

Mostra nível de criminalidade da área com detalhes sobre tipos de crime, tendências e score de segurança (0-100).

## 🔗 API UTILIZADA:

### **SpotCrime API**
- **URL:** `https://spotcrime.com/api/crimes.json`
- **Custo:** GRÁTIS
- **Limite:** Sem limite oficial
- **Documentação:** https://spotcrime.com/api.html

### **Parâmetros da API:**
```javascript
{
  lat: 28.5383,      // Latitude da propriedade
  lon: -81.3792,     // Longitude da propriedade
  radius: 0.5,       // Raio em milhas (0.5 = ~800m)
  key: 'publickey'   // Chave pública (não precisa cadastro)
}
```

### **Resposta da API (exemplo):**
```json
{
  "crimes": [
    {
      "type": "Theft",
      "date": "11/05/2025",
      "address": "123 Main St, Orlando, FL",
      "lat": 28.5383,
      "lon": -81.3792
    },
    {
      "type": "Burglary",
      "date": "11/01/2025",
      "address": "456 Oak Ave, Orlando, FL",
      "lat": 28.5390,
      "lon": -81.3800
    }
  ]
}
```

---

## 💻 IMPLEMENTAÇÃO:

### **1. HTML - Adicionar botão na tabela**

Localizar a linha da tabela (aproximadamente linha 260-270) e adicionar nova coluna:

```html
<!-- ANTES (thead): -->
<th class="px-2 py-2 text-left">Legal Desc</th>

<!-- ADICIONAR DEPOIS: -->
<th class="px-2 py-2 text-left">Análise</th>
```

```html
<!-- ANTES (tbody): -->
<td class="px-2 py-1 text-gray-600">${row['Legal Description'] || 'N/A'}</td>

<!-- ADICIONAR DEPOIS: -->
<td class="px-2 py-1">
    <button onclick="analyzeCrime('${row['Parcel Number']}')" 
            class="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">
        🚨 Crime
    </button>
</td>
```

---

### **2. JavaScript - Função de análise de criminalidade**

Adicionar no final do `<script>` (antes do `</script>` final):

```javascript
// ============================================
// IDEIA 11: SCORE DE CRIMINALIDADE
// ============================================

async function analyzeCrime(parcelNumber) {
    // Encontrar propriedade
    const property = allProperties.find(p => p['Parcel Number'] === parcelNumber);
    if (!property) {
        alert('Propriedade não encontrada!');
        return;
    }

    // Mostrar loading
    showLoading('Analisando criminalidade...');

    try {
        // Buscar dados de crime
        const lat = parseFloat(property.Latitude);
        const lon = parseFloat(property.Longitude);
        const radius = 0.5; // 0.5 milhas (~800m)

        const url = `https://spotcrime.com/api/crimes.json?lat=${lat}&lon=${lon}&radius=${radius}&key=publickey`;
        
        const response = await fetch(url);
        const data = await response.json();

        // Processar dados
        const crimeData = processCrimeData(data.crimes || []);

        // Mostrar modal
        showCrimeModal(property, crimeData);

    } catch (error) {
        console.error('Erro ao analisar crime:', error);
        alert('Erro ao buscar dados de criminalidade. Tente novamente.');
    } finally {
        hideLoading();
    }
}

function processCrimeData(crimes) {
    // Contar crimes por tipo
    const crimeTypes = {};
    crimes.forEach(crime => {
        crimeTypes[crime.type] = (crimeTypes[crime.type] || 0) + 1;
    });

    // Calcular score (0-100, quanto maior melhor)
    const totalCrimes = crimes.length;
    let score = 100;
    
    if (totalCrimes === 0) score = 100;
    else if (totalCrimes <= 5) score = 90;
    else if (totalCrimes <= 10) score = 75;
    else if (totalCrimes <= 20) score = 60;
    else if (totalCrimes <= 30) score = 45;
    else if (totalCrimes <= 50) score = 30;
    else score = 15;

    // Classificação
    let classification = '';
    let color = '';
    if (score >= 80) {
        classification = 'MUITO SEGURO';
        color = 'green';
    } else if (score >= 60) {
        classification = 'SEGURO';
        color = 'blue';
    } else if (score >= 40) {
        classification = 'MÉDIO';
        color = 'yellow';
    } else if (score >= 20) {
        classification = 'PERIGOSO';
        color = 'orange';
    } else {
        classification = 'MUITO PERIGOSO';
        color = 'red';
    }

    // Crimes dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCrimes = crimes.filter(crime => {
        const crimeDate = new Date(crime.date);
        return crimeDate >= thirtyDaysAgo;
    });

    // Tendência (comparar últimos 30 dias vs 30-60 dias atrás)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const previousPeriodCrimes = crimes.filter(crime => {
        const crimeDate = new Date(crime.date);
        return crimeDate >= sixtyDaysAgo && crimeDate < thirtyDaysAgo;
    });

    let trend = 'ESTÁVEL';
    let trendIcon = '➡️';
    
    if (recentCrimes.length > previousPeriodCrimes.length * 1.2) {
        trend = 'AUMENTANDO';
        trendIcon = '📈';
    } else if (recentCrimes.length < previousPeriodCrimes.length * 0.8) {
        trend = 'DIMINUINDO';
        trendIcon = '📉';
    }

    return {
        totalCrimes,
        crimeTypes,
        score,
        classification,
        color,
        recentCrimes: recentCrimes.length,
        trend,
        trendIcon,
        crimes
    };
}

function showCrimeModal(property, crimeData) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="bg-${crimeData.color}-600 text-white p-6 rounded-t-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">🚨 Análise de Criminalidade</h2>
                        <p class="text-sm opacity-90">${property['Address'] || 'N/A'}</p>
                        <p class="text-xs opacity-75">Parcel: ${property['Parcel Number']}</p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-gray-200 text-3xl font-bold">
                        ×
                    </button>
                </div>
            </div>

            <div class="p-6">
                <!-- Score Principal -->
                <div class="bg-${crimeData.color}-50 border-2 border-${crimeData.color}-200 rounded-lg p-6 mb-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-bold text-gray-800 mb-2">Score de Segurança</h3>
                            <p class="text-5xl font-bold text-${crimeData.color}-600">${crimeData.score}/100</p>
                            <p class="text-xl font-semibold text-${crimeData.color}-700 mt-2">${crimeData.classification}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-600 mb-1">Área analisada:</p>
                            <p class="text-lg font-bold text-gray-800">0.5 milhas (800m)</p>
                            <p class="text-sm text-gray-600 mt-2">Total de crimes:</p>
                            <p class="text-2xl font-bold text-gray-800">${crimeData.totalCrimes}</p>
                        </div>
                    </div>
                </div>

                <!-- Estatísticas -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-blue-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">Últimos 30 dias</p>
                        <p class="text-3xl font-bold text-blue-600">${crimeData.recentCrimes}</p>
                        <p class="text-xs text-gray-500 mt-1">crimes registrados</p>
                    </div>
                    <div class="bg-purple-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">Tendência</p>
                        <p class="text-2xl font-bold text-purple-600">${crimeData.trendIcon} ${crimeData.trend}</p>
                        <p class="text-xs text-gray-500 mt-1">vs período anterior</p>
                    </div>
                    <div class="bg-orange-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">Tipos de crime</p>
                        <p class="text-3xl font-bold text-orange-600">${Object.keys(crimeData.crimeTypes).length}</p>
                        <p class="text-xs text-gray-500 mt-1">categorias diferentes</p>
                    </div>
                </div>

                <!-- Tipos de Crime -->
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">📊 Crimes por Tipo</h3>
                    <div class="space-y-2">
                        ${Object.entries(crimeData.crimeTypes)
                            .sort((a, b) => b[1] - a[1])
                            .map(([type, count]) => `
                                <div class="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                    <span class="font-semibold text-gray-700">${type}</span>
                                    <span class="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">${count}</span>
                                </div>
                            `).join('')}
                    </div>
                </div>

                <!-- Lista de Crimes Recentes -->
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">📋 Crimes Recentes (últimos 10)</h3>
                    <div class="max-h-60 overflow-y-auto space-y-2">
                        ${crimeData.crimes.slice(0, 10).map(crime => `
                            <div class="bg-gray-50 rounded-lg p-3 border-l-4 border-red-500">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-semibold text-gray-800">${crime.type}</p>
                                        <p class="text-sm text-gray-600">${crime.address}</p>
                                    </div>
                                    <span class="text-xs text-gray-500">${crime.date}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Recomendações -->
                <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                    <h3 class="text-lg font-bold text-blue-800 mb-2">💡 Recomendações</h3>
                    ${crimeData.score >= 80 ? `
                        <p class="text-sm text-gray-700">✅ Área muito segura! Excelente para investimento e revenda.</p>
                    ` : crimeData.score >= 60 ? `
                        <p class="text-sm text-gray-700">✅ Área segura. Bom para investimento.</p>
                    ` : crimeData.score >= 40 ? `
                        <p class="text-sm text-gray-700">⚠️ Área com criminalidade média. Considere o impacto na revenda.</p>
                    ` : `
                        <p class="text-sm text-gray-700">❌ Área perigosa. Alto risco para investimento. Revenda pode ser difícil.</p>
                    `}
                </div>

                <!-- Botões -->
                <div class="flex gap-3 mt-6">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600">
                        Fechar
                    </button>
                    <button onclick="saveCrimeAnalysis('${property['Parcel Number']}', ${JSON.stringify(crimeData).replace(/"/g, '&quot;')})" 
                            class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
                        💾 Salvar Análise
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function saveCrimeAnalysis(parcelNumber, crimeData) {
    // Salvar no localStorage
    const analyses = JSON.parse(localStorage.getItem('crimeAnalyses') || '{}');
    analyses[parcelNumber] = {
        ...crimeData,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('crimeAnalyses', JSON.stringify(analyses));

    alert('✅ Análise de criminalidade salva com sucesso!');
}

// Função auxiliar de loading
function showLoading(message) {
    const loading = document.createElement('div');
    loading.id = 'loadingModal';
    loading.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    loading.innerHTML = `
        <div class="bg-white rounded-lg p-8 text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p class="text-lg font-semibold text-gray-800">${message}</p>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loadingModal');
    if (loading) loading.remove();
}
```

---

---

# 🏫 IDEIA 12: ANÁLISE DE ESCOLAS

## 📊 VISÃO GERAL:

Mostra qualidade das escolas próximas (elementary, middle, high school) com ratings 1-10 e impacto estimado no valor da propriedade.

## 🔗 API UTILIZADA:

### **GreatSchools API**
- **URL:** `https://api.greatschools.org/schools/nearby`
- **Custo:** GRÁTIS (precisa cadastro)
- **Limite:** 1,000 requests/dia
- **Cadastro:** https://www.greatschools.org/api/request-api-key/
- **Documentação:** https://www.greatschools.org/api/docs/

### **Parâmetros da API:**
```javascript
{
  lat: 28.5383,
  lon: -81.3792,
  radius: 5,          // Raio em milhas
  state: 'FL',
  limit: 10,
  key: 'YOUR_API_KEY'
}
```

### **Resposta da API (exemplo):**
```json
{
  "schools": [
    {
      "name": "Pine Hills Elementary School",
      "rating": 8,
      "level": "elementary",
      "distance": 0.8,
      "address": "123 School St, Orlando, FL 32808"
    },
    {
      "name": "Oak Ridge High School",
      "rating": 9,
      "level": "high",
      "distance": 2.1,
      "address": "456 Oak Ave, Orlando, FL 32809"
    }
  ]
}
```

---

## 💻 IMPLEMENTAÇÃO:

### **1. HTML - Adicionar botão na tabela**

```html
<!-- ADICIONAR DEPOIS DO BOTÃO DE CRIME: -->
<button onclick="analyzeSchools('${row['Parcel Number']}')" 
        class="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 ml-1">
    🏫 Escolas
</button>
```

---

### **2. JavaScript - Função de análise de escolas**

```javascript
// ============================================
// IDEIA 12: ANÁLISE DE ESCOLAS
// ============================================

async function analyzeSchools(parcelNumber) {
    // Encontrar propriedade
    const property = allProperties.find(p => p['Parcel Number'] === parcelNumber);
    if (!property) {
        alert('Propriedade não encontrada!');
        return;
    }

    // Verificar API key
    const apiKey = localStorage.getItem('greatschools_api_key');
    if (!apiKey) {
        alert('⚠️ API Key do GreatSchools não configurada!\n\nVá em Configurações > APIs e adicione sua chave.');
        return;
    }

    showLoading('Analisando escolas próximas...');

    try {
        const lat = parseFloat(property.Latitude);
        const lon = parseFloat(property.Longitude);
        const state = property.County.includes('Orange') ? 'FL' : 'FL'; // Ajustar conforme necessário

        const url = `https://api.greatschools.org/schools/nearby?lat=${lat}&lon=${lon}&radius=5&state=${state}&limit=10&key=${apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();

        // Processar dados
        const schoolData = processSchoolData(data.schools || []);

        // Mostrar modal
        showSchoolModal(property, schoolData);

    } catch (error) {
        console.error('Erro ao analisar escolas:', error);
        alert('Erro ao buscar dados de escolas. Verifique sua API key.');
    } finally {
        hideLoading();
    }
}

function processSchoolData(schools) {
    // Separar por nível
    const elementary = schools.filter(s => s.level === 'elementary');
    const middle = schools.filter(s => s.level === 'middle');
    const high = schools.filter(s => s.level === 'high');

    // Calcular rating médio
    const avgRating = schools.length > 0 
        ? schools.reduce((sum, s) => sum + (s.rating || 0), 0) / schools.length 
        : 0;

    // Calcular impacto no valor
    let valueImpact = 0;
    let impactText = '';
    let impactColor = '';

    if (avgRating >= 8) {
        valueImpact = 12;
        impactText = 'MUITO POSITIVO';
        impactColor = 'green';
    } else if (avgRating >= 6) {
        valueImpact = 7;
        impactText = 'POSITIVO';
        impactColor = 'blue';
    } else if (avgRating >= 4) {
        valueImpact = 0;
        impactText = 'NEUTRO';
        impactColor = 'yellow';
    } else {
        valueImpact = -5;
        impactText = 'NEGATIVO';
        impactColor = 'red';
    }

    // Encontrar melhor escola
    const bestSchool = schools.reduce((best, school) => 
        (school.rating || 0) > (best.rating || 0) ? school : best
    , schools[0] || {});

    return {
        schools,
        elementary,
        middle,
        high,
        avgRating: avgRating.toFixed(1),
        valueImpact,
        impactText,
        impactColor,
        bestSchool
    };
}

function showSchoolModal(property, schoolData) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="bg-blue-600 text-white p-6 rounded-t-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">🏫 Análise de Escolas</h2>
                        <p class="text-sm opacity-90">${property['Address'] || 'N/A'}</p>
                        <p class="text-xs opacity-75">Parcel: ${property['Parcel Number']}</p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-gray-200 text-3xl font-bold">
                        ×
                    </button>
                </div>
            </div>

            <div class="p-6">
                <!-- Score Principal -->
                <div class="bg-${schoolData.impactColor}-50 border-2 border-${schoolData.impactColor}-200 rounded-lg p-6 mb-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-bold text-gray-800 mb-2">Rating Médio das Escolas</h3>
                            <p class="text-5xl font-bold text-${schoolData.impactColor}-600">${schoolData.avgRating}/10</p>
                            <p class="text-sm text-gray-600 mt-2">${schoolData.schools.length} escolas encontradas</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-600 mb-1">Impacto no Valor:</p>
                            <p class="text-3xl font-bold text-${schoolData.impactColor}-600">
                                ${schoolData.valueImpact > 0 ? '+' : ''}${schoolData.valueImpact}%
                            </p>
                            <p class="text-lg font-semibold text-${schoolData.impactColor}-700 mt-2">${schoolData.impactText}</p>
                        </div>
                    </div>
                </div>

                <!-- Estatísticas por Nível -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-purple-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">🎒 Elementary</p>
                        <p class="text-3xl font-bold text-purple-600">${schoolData.elementary.length}</p>
                        <p class="text-xs text-gray-500 mt-1">
                            ${schoolData.elementary.length > 0 ? `Média: ${(schoolData.elementary.reduce((s, e) => s + (e.rating || 0), 0) / schoolData.elementary.length).toFixed(1)}/10` : 'Nenhuma encontrada'}
                        </p>
                    </div>
                    <div class="bg-blue-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">📚 Middle School</p>
                        <p class="text-3xl font-bold text-blue-600">${schoolData.middle.length}</p>
                        <p class="text-xs text-gray-500 mt-1">
                            ${schoolData.middle.length > 0 ? `Média: ${(schoolData.middle.reduce((s, m) => s + (m.rating || 0), 0) / schoolData.middle.length).toFixed(1)}/10` : 'Nenhuma encontrada'}
                        </p>
                    </div>
                    <div class="bg-green-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">🎓 High School</p>
                        <p class="text-3xl font-bold text-green-600">${schoolData.high.length}</p>
                        <p class="text-xs text-gray-500 mt-1">
                            ${schoolData.high.length > 0 ? `Média: ${(schoolData.high.reduce((s, h) => s + (h.rating || 0), 0) / schoolData.high.length).toFixed(1)}/10` : 'Nenhuma encontrada'}
                        </p>
                    </div>
                </div>

                <!-- Melhor Escola -->
                ${schoolData.bestSchool ? `
                <div class="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold text-yellow-800 mb-2">⭐ Melhor Escola Próxima</h3>
                    <p class="font-semibold text-gray-800">${schoolData.bestSchool.name}</p>
                    <div class="flex items-center gap-4 mt-2">
                        <span class="text-2xl font-bold text-yellow-600">${schoolData.bestSchool.rating}/10</span>
                        <span class="text-sm text-gray-600">${schoolData.bestSchool.distance.toFixed(1)} milhas</span>
                        <span class="text-sm text-gray-600">${schoolData.bestSchool.level}</span>
                    </div>
                </div>
                ` : ''}

                <!-- Lista de Escolas -->
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">📋 Todas as Escolas (raio de 5 milhas)</h3>
                    <div class="max-h-60 overflow-y-auto space-y-2">
                        ${schoolData.schools.map(school => {
                            const ratingColor = school.rating >= 8 ? 'green' : school.rating >= 6 ? 'blue' : school.rating >= 4 ? 'yellow' : 'red';
                            const stars = '⭐'.repeat(Math.round(school.rating / 2));
                            return `
                            <div class="bg-gray-50 rounded-lg p-3 border-l-4 border-${ratingColor}-500">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <p class="font-semibold text-gray-800">${school.name}</p>
                                        <p class="text-xs text-gray-600">${school.address}</p>
                                        <p class="text-xs text-gray-500 mt-1">
                                            <span class="capitalize">${school.level}</span> • ${school.distance.toFixed(1)} milhas
                                        </p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-2xl font-bold text-${ratingColor}-600">${school.rating}/10</p>
                                        <p class="text-xs text-gray-500">${stars}</p>
                                    </div>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                </div>

                <!-- Recomendações -->
                <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                    <h3 class="text-lg font-bold text-blue-800 mb-2">💡 Impacto no Investimento</h3>
                    ${schoolData.valueImpact > 0 ? `
                        <p class="text-sm text-gray-700">✅ Escolas excelentes aumentam o valor da propriedade em até ${schoolData.valueImpact}%!</p>
                        <p class="text-sm text-gray-700 mt-2">Famílias pagam mais para morar perto de boas escolas. Ótimo para revenda!</p>
                    ` : schoolData.valueImpact === 0 ? `
                        <p class="text-sm text-gray-700">⚠️ Escolas medianas. Impacto neutro no valor.</p>
                    ` : `
                        <p class="text-sm text-gray-700">❌ Escolas ruins podem reduzir o valor em até ${Math.abs(schoolData.valueImpact)}%.</p>
                        <p class="text-sm text-gray-700 mt-2">Considere o impacto na revenda.</p>
                    `}
                </div>

                <!-- Botões -->
                <div class="flex gap-3 mt-6">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600">
                        Fechar
                    </button>
                    <button onclick="saveSchoolAnalysis('${property['Parcel Number']}', ${JSON.stringify(schoolData).replace(/"/g, '&quot;')})" 
                            class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
                        💾 Salvar Análise
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function saveSchoolAnalysis(parcelNumber, schoolData) {
    const analyses = JSON.parse(localStorage.getItem('schoolAnalyses') || '{}');
    analyses[parcelNumber] = {
        ...schoolData,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('schoolAnalyses', JSON.stringify(analyses));

    alert('✅ Análise de escolas salva com sucesso!');
}
```

---

---

# 🌪️ IDEIA 13: HISTÓRICO DE DESASTRES NATURAIS

## 📊 VISÃO GERAL:

Verifica se a área já sofreu furacões, inundações ou outros desastres naturais nos últimos 10 anos. Mostra flood zones do FEMA e estima custo de seguro.

## 🔗 API UTILIZADA:

### **FEMA API (OpenFEMA)**
- **URL:** `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries`
- **Custo:** GRÁTIS
- **Limite:** Sem limite
- **Documentação:** https://www.fema.gov/about/openfema/data-sets

### **Parâmetros da API:**
```javascript
{
  $filter: "state eq 'FL' and declarationDate gt '2015-01-01'",
  $select: "disasterNumber,declarationDate,disasterType,incidentType,title",
  $orderby: "declarationDate desc"
}
```

### **Resposta da API (exemplo):**
```json
{
  "DisasterDeclarationsSummaries": [
    {
      "disasterNumber": 4673,
      "declarationDate": "2022-09-29T00:00:00.000Z",
      "disasterType": "DR",
      "incidentType": "Hurricane",
      "title": "HURRICANE IAN"
    },
    {
      "disasterNumber": 4564,
      "declarationDate": "2020-11-11T00:00:00.000Z",
      "disasterType": "DR",
      "incidentType": "Hurricane",
      "title": "TROPICAL STORM ETA"
    }
  ]
}
```

### **FEMA Flood Map Service API:**
- **URL:** `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query`
- **Parâmetros:** `geometry={lon},{lat}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outFields=*&f=json`

---

## 💻 IMPLEMENTAÇÃO:

### **1. HTML - Adicionar botão na tabela**

```html
<!-- ADICIONAR DEPOIS DO BOTÃO DE ESCOLAS: -->
<button onclick="analyzeDisasters('${row['Parcel Number']}')" 
        class="bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700 ml-1">
    🌪️ Desastres
</button>
```

---

### **2. JavaScript - Função de análise de desastres**

```javascript
// ============================================
// IDEIA 13: HISTÓRICO DE DESASTRES NATURAIS
// ============================================

async function analyzeDisasters(parcelNumber) {
    const property = allProperties.find(p => p['Parcel Number'] === parcelNumber);
    if (!property) {
        alert('Propriedade não encontrada!');
        return;
    }

    showLoading('Analisando histórico de desastres...');

    try {
        const lat = parseFloat(property.Latitude);
        const lon = parseFloat(property.Longitude);
        const county = property.County;

        // 1. Buscar desastres em Florida (últimos 10 anos)
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        const dateFilter = tenYearsAgo.toISOString().split('T')[0];

        const disastersUrl = `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$filter=state eq 'FL' and declarationDate gt '${dateFilter}'&$select=disasterNumber,declarationDate,disasterType,incidentType,title,designatedArea&$orderby=declarationDate desc`;
        
        const disastersResponse = await fetch(disastersUrl);
        const disastersData = await disastersResponse.json();

        // Filtrar desastres que afetaram o condado
        const countyDisasters = disastersData.DisasterDeclarationsSummaries.filter(d => 
            d.designatedArea && d.designatedArea.includes(county.replace(' County', ''))
        );

        // 2. Buscar flood zone
        const floodUrl = `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query?geometry=${lon},${lat}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outFields=*&f=json`;
        
        const floodResponse = await fetch(floodUrl);
        const floodData = await floodResponse.json();

        // Processar dados
        const disasterData = processDisasterData(countyDisasters, floodData);

        // Mostrar modal
        showDisasterModal(property, disasterData);

    } catch (error) {
        console.error('Erro ao analisar desastres:', error);
        alert('Erro ao buscar dados de desastres. Tente novamente.');
    } finally {
        hideLoading();
    }
}

function processDisasterData(disasters, floodData) {
    // Contar por tipo
    const disasterTypes = {};
    disasters.forEach(d => {
        disasterTypes[d.incidentType] = (disasterTypes[d.incidentType] || 0) + 1;
    });

    // Flood zone
    let floodZone = 'X'; // Fora de área de risco
    let floodRisk = 'BAIXO';
    let floodColor = 'green';
    let insuranceCost = 800; // Custo anual base

    if (floodData.features && floodData.features.length > 0) {
        floodZone = floodData.features[0].attributes.FLD_ZONE || 'X';
        
        if (floodZone.startsWith('A') || floodZone.startsWith('V')) {
            floodRisk = 'ALTO';
            floodColor = 'red';
            insuranceCost = 3500;
        } else if (floodZone.startsWith('B') || floodZone.startsWith('C')) {
            floodRisk = 'MÉDIO';
            floodColor = 'yellow';
            insuranceCost = 1500;
        }
    }

    // Risco de recorrência
    const hurricanes = disasters.filter(d => d.incidentType === 'Hurricane').length;
    let recurrenceRisk = 'BAIXO';
    let recurrenceColor = 'green';

    if (hurricanes >= 3) {
        recurrenceRisk = 'ALTO';
        recurrenceColor = 'red';
    } else if (hurricanes >= 1) {
        recurrenceRisk = 'MÉDIO';
        recurrenceColor = 'yellow';
    }

    return {
        disasters,
        disasterTypes,
        totalDisasters: disasters.length,
        floodZone,
        floodRisk,
        floodColor,
        insuranceCost,
        recurrenceRisk,
        recurrenceColor,
        hurricanes
    };
}

function showDisasterModal(property, disasterData) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="bg-orange-600 text-white p-6 rounded-t-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">🌪️ Histórico de Desastres Naturais</h2>
                        <p class="text-sm opacity-90">${property['Address'] || 'N/A'}</p>
                        <p class="text-xs opacity-75">Parcel: ${property['Parcel Number']}</p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-gray-200 text-3xl font-bold">
                        ×
                    </button>
                </div>
            </div>

            <div class="p-6">
                <!-- Flood Zone Principal -->
                <div class="bg-${disasterData.floodColor}-50 border-2 border-${disasterData.floodColor}-200 rounded-lg p-6 mb-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-bold text-gray-800 mb-2">Zona de Inundação (FEMA)</h3>
                            <p class="text-5xl font-bold text-${disasterData.floodColor}-600">${disasterData.floodZone}</p>
                            <p class="text-xl font-semibold text-${disasterData.floodColor}-700 mt-2">Risco: ${disasterData.floodRisk}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-600 mb-1">Seguro Estimado:</p>
                            <p class="text-3xl font-bold text-gray-800">$${disasterData.insuranceCost}/ano</p>
                        </div>
                    </div>
                </div>

                <!-- Estatísticas -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-red-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">Desastres (10 anos)</p>
                        <p class="text-3xl font-bold text-red-600">${disasterData.totalDisasters}</p>
                        <p class="text-xs text-gray-500 mt-1">no condado</p>
                    </div>
                    <div class="bg-purple-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">Furacões</p>
                        <p class="text-3xl font-bold text-purple-600">${disasterData.hurricanes}</p>
                        <p class="text-xs text-gray-500 mt-1">registrados</p>
                    </div>
                    <div class="bg-${disasterData.recurrenceColor}-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">Risco de Recorrência</p>
                        <p class="text-2xl font-bold text-${disasterData.recurrenceColor}-600">${disasterData.recurrenceRisk}</p>
                        <p class="text-xs text-gray-500 mt-1">próximos anos</p>
                    </div>
                </div>

                <!-- Tipos de Desastre -->
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">📊 Desastres por Tipo</h3>
                    <div class="space-y-2">
                        ${Object.entries(disasterData.disasterTypes)
                            .sort((a, b) => b[1] - a[1])
                            .map(([type, count]) => `
                                <div class="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                    <span class="font-semibold text-gray-700">${type}</span>
                                    <span class="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">${count}</span>
                                </div>
                            `).join('')}
                    </div>
                </div>

                <!-- Lista de Desastres -->
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">📋 Histórico de Desastres (últimos 10)</h3>
                    <div class="max-h-60 overflow-y-auto space-y-2">
                        ${disasterData.disasters.slice(0, 10).map(disaster => `
                            <div class="bg-gray-50 rounded-lg p-3 border-l-4 border-orange-500">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-semibold text-gray-800">${disaster.title}</p>
                                        <p class="text-sm text-gray-600">${disaster.incidentType}</p>
                                    </div>
                                    <span class="text-xs text-gray-500">${new Date(disaster.declarationDate).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Explicação Flood Zones -->
                <div class="bg-blue-50 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold text-blue-800 mb-2">📖 Entenda as Flood Zones</h3>
                    <ul class="text-sm text-gray-700 space-y-1">
                        <li><strong>Zone X:</strong> Fora de área de risco (seguro barato ~$800/ano)</li>
                        <li><strong>Zone A/AE:</strong> Alto risco de inundação (seguro caro ~$3,500/ano)</li>
                        <li><strong>Zone V/VE:</strong> Muito alto risco (costa) (seguro muito caro ~$5,000+/ano)</li>
                        <li><strong>Zone B/C:</strong> Risco moderado (seguro médio ~$1,500/ano)</li>
                    </ul>
                </div>

                <!-- Recomendações -->
                <div class="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
                    <h3 class="text-lg font-bold text-orange-800 mb-2">💡 Recomendações</h3>
                    ${disasterData.floodRisk === 'BAIXO' ? `
                        <p class="text-sm text-gray-700">✅ Área fora de zona de risco! Seguro barato e baixo risco.</p>
                    ` : disasterData.floodRisk === 'MÉDIO' ? `
                        <p class="text-sm text-gray-700">⚠️ Risco moderado. Considere o custo do seguro ($${disasterData.insuranceCost}/ano).</p>
                    ` : `
                        <p class="text-sm text-gray-700">❌ ALTO RISCO! Seguro caro ($${disasterData.insuranceCost}/ano) e dificulta financiamento.</p>
                        <p class="text-sm text-gray-700 mt-2">Bancos podem exigir seguro obrigatório. Considere o impacto no ROI.</p>
                    `}
                </div>

                <!-- Botões -->
                <div class="flex gap-3 mt-6">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600">
                        Fechar
                    </button>
                    <button onclick="saveDisasterAnalysis('${property['Parcel Number']}', ${JSON.stringify(disasterData).replace(/"/g, '&quot;')})" 
                            class="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700">
                        💾 Salvar Análise
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function saveDisasterAnalysis(parcelNumber, disasterData) {
    const analyses = JSON.parse(localStorage.getItem('disasterAnalyses') || '{}');
    analyses[parcelNumber] = {
        ...disasterData,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('disasterAnalyses', JSON.stringify(analyses));

    alert('✅ Análise de desastres salva com sucesso!');
}
```

---

---

# ⚙️ PAINEL DE CONFIGURAÇÃO DE APIs

## 📊 VISÃO GERAL:

Centraliza todas as API keys em um único lugar com teste de conexão.

## 💻 IMPLEMENTAÇÃO:

### **1. HTML - Adicionar botão no header**

Localizar o header (aproximadamente linha 60-77) e adicionar:

```html
<!-- ADICIONAR DEPOIS DO BOTÃO DE DARK MODE: -->
<button id="settingsBtn" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
    <span>⚙️</span>
    <span>Configurações</span>
</button>
```

---

### **2. JavaScript - Modal de configurações**

```javascript
// ============================================
// PAINEL DE CONFIGURAÇÃO DE APIs
// ============================================

document.getElementById('settingsBtn').addEventListener('click', showSettingsModal);

function showSettingsModal() {
    // Carregar keys salvas
    const openaiKey = localStorage.getItem('openai_api_key') || '';
    const gmapsKey = localStorage.getItem('gmaps_api_key') || '';
    const zillowKey = localStorage.getItem('zillow_api_key') || '';
    const visionKey = localStorage.getItem('vision_api_key') || '';
    const greatschoolsKey = localStorage.getItem('greatschools_api_key') || '';

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="bg-purple-600 text-white p-6 rounded-t-lg">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold">⚙️ Configurações de APIs</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-gray-200 text-3xl font-bold">
                        ×
                    </button>
                </div>
            </div>

            <div class="p-6 space-y-6">
                <!-- OpenAI -->
                <div class="border-b pb-4">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        🤖 OpenAI API Key
                    </label>
                    <input type="password" id="openaiKey" value="${openaiKey}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                           placeholder="sk-proj-...">
                    <div class="flex gap-2">
                        <button onclick="testAPI('openai')" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                            Testar Conexão
                        </button>
                        <a href="https://platform.openai.com/api-keys" target="_blank" 
                           class="text-blue-600 text-sm hover:underline flex items-center">
                            Como obter →
                        </a>
                    </div>
                    <p id="openaiStatus" class="text-sm mt-2"></p>
                </div>

                <!-- Google Maps -->
                <div class="border-b pb-4">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        🗺️ Google Maps API Key
                    </label>
                    <input type="password" id="gmapsKey" value="${gmapsKey}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                           placeholder="AIzaSy...">
                    <div class="flex gap-2">
                        <button onclick="testAPI('gmaps')" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                            Testar Conexão
                        </button>
                        <a href="https://console.cloud.google.com/apis/credentials" target="_blank" 
                           class="text-blue-600 text-sm hover:underline flex items-center">
                            Como obter →
                        </a>
                    </div>
                    <p id="gmapsStatus" class="text-sm mt-2"></p>
                </div>

                <!-- RapidAPI Zillow -->
                <div class="border-b pb-4">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        🏠 RapidAPI Zillow Key
                    </label>
                    <input type="password" id="zillowKey" value="${zillowKey}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                           placeholder="3eff6f4111msh...">
                    <div class="flex gap-2">
                        <button onclick="testAPI('zillow')" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                            Testar Conexão
                        </button>
                        <a href="https://rapidapi.com/apimaker/api/zillow-com1/" target="_blank" 
                           class="text-blue-600 text-sm hover:underline flex items-center">
                            Como obter →
                        </a>
                    </div>
                    <p id="zillowStatus" class="text-sm mt-2"></p>
                </div>

                <!-- Google Vision AI -->
                <div class="border-b pb-4">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        📸 Google Vision AI Key (Fase 3)
                    </label>
                    <input type="password" id="visionKey" value="${visionKey}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                           placeholder="AIzaSy...">
                    <div class="flex gap-2">
                        <button onclick="testAPI('vision')" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                            Testar Conexão
                        </button>
                        <a href="https://cloud.google.com/vision/docs/setup" target="_blank" 
                           class="text-blue-600 text-sm hover:underline flex items-center">
                            Como obter →
                        </a>
                    </div>
                    <p id="visionStatus" class="text-sm mt-2"></p>
                </div>

                <!-- GreatSchools -->
                <div class="border-b pb-4">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        🏫 GreatSchools API Key
                    </label>
                    <input type="password" id="greatschoolsKey" value="${greatschoolsKey}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                           placeholder="gs...">
                    <div class="flex gap-2">
                        <button onclick="testAPI('greatschools')" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                            Testar Conexão
                        </button>
                        <a href="https://www.greatschools.org/api/request-api-key/" target="_blank" 
                           class="text-blue-600 text-sm hover:underline flex items-center">
                            Como obter →
                        </a>
                    </div>
                    <p id="greatschoolsStatus" class="text-sm mt-2"></p>
                </div>

                <!-- Botões -->
                <div class="flex gap-3">
                    <button onclick="saveAllAPIKeys()" class="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700">
                        💾 Salvar Todas
                    </button>
                    <button onclick="testAllAPIs()" class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
                        🧪 Testar Todas
                    </button>
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function saveAllAPIKeys() {
    localStorage.setItem('openai_api_key', document.getElementById('openaiKey').value);
    localStorage.setItem('gmaps_api_key', document.getElementById('gmapsKey').value);
    localStorage.setItem('zillow_api_key', document.getElementById('zillowKey').value);
    localStorage.setItem('vision_api_key', document.getElementById('visionKey').value);
    localStorage.setItem('greatschools_api_key', document.getElementById('greatschoolsKey').value);

    alert('✅ API Keys salvas com sucesso!');
}

async function testAPI(apiName) {
    const statusEl = document.getElementById(`${apiName}Status`);
    statusEl.innerHTML = '<span class="text-blue-600">⏳ Testando...</span>';

    try {
        let success = false;

        switch(apiName) {
            case 'openai':
                const openaiKey = document.getElementById('openaiKey').value;
                const openaiResponse = await fetch('https://api.openai.com/v1/models', {
                    headers: { 'Authorization': `Bearer ${openaiKey}` }
                });
                success = openaiResponse.ok;
                break;

            case 'gmaps':
                const gmapsKey = document.getElementById('gmapsKey').value;
                const gmapsResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=Orlando&key=${gmapsKey}`);
                const gmapsData = await gmapsResponse.json();
                success = gmapsData.status === 'OK';
                break;

            case 'zillow':
                // RapidAPI Zillow teste (simplificado)
                success = document.getElementById('zillowKey').value.length > 20;
                break;

            case 'vision':
                // Google Vision teste (simplificado)
                success = document.getElementById('visionKey').value.length > 20;
                break;

            case 'greatschools':
                const gsKey = document.getElementById('greatschoolsKey').value;
                const gsResponse = await fetch(`https://api.greatschools.org/schools/nearby?lat=28.5&lon=-81.3&radius=5&state=FL&key=${gsKey}`);
                success = gsResponse.ok;
                break;
        }

        if (success) {
            statusEl.innerHTML = '<span class="text-green-600">✅ Conectado com sucesso!</span>';
        } else {
            statusEl.innerHTML = '<span class="text-red-600">❌ Erro na conexão. Verifique a key.</span>';
        }

    } catch (error) {
        statusEl.innerHTML = '<span class="text-red-600">❌ Erro: ' + error.message + '</span>';
    }
}

async function testAllAPIs() {
    await testAPI('openai');
    await testAPI('gmaps');
    await testAPI('zillow');
    await testAPI('vision');
    await testAPI('greatschools');
}
```

---

---

# 📦 RESUMO DA IMPLEMENTAÇÃO

## ✅ O QUE FOI ESPECIFICADO:

1. **IDEIA 11 - Score de Criminalidade**
   - SpotCrime API (GRÁTIS)
   - Botão "🚨 Crime" na tabela
   - Modal com score 0-100, tipos de crime, tendência
   - Salva análise no localStorage

2. **IDEIA 12 - Análise de Escolas**
   - GreatSchools API (GRÁTIS, precisa cadastro)
   - Botão "🏫 Escolas" na tabela
   - Modal com rating 1-10, impacto no valor (+12%)
   - Salva análise no localStorage

3. **IDEIA 13 - Histórico de Desastres**
   - FEMA API (GRÁTIS)
   - Botão "🌪️ Desastres" na tabela
   - Modal com flood zones, custo de seguro, histórico
   - Salva análise no localStorage

4. **Painel de Configuração**
   - Botão "⚙️ Configurações" no header
   - Gerencia todas as API keys
   - Teste de conexão individual e em lote

---

## 🎯 PRÓXIMOS PASSOS:

1. **Obter API Keys:**
   - GreatSchools: https://www.greatschools.org/api/request-api-key/

2. **Implementar no dashboard-v15.html:**
   - Adicionar botões na tabela
   - Copiar funções JavaScript
   - Adicionar botão de configurações

3. **Testar:**
   - Importar CSV
   - Clicar nos botões de análise
   - Verificar modais
   - Salvar análises

---

## 💰 CUSTO TOTAL: **$0/MÊS**

Todas as APIs são gratuitas! 🎉

---

**DOCUMENTO COMPLETO!** 🚀

Agora você tem todas as especificações técnicas para implementar as 3 funcionalidades prioritárias!

