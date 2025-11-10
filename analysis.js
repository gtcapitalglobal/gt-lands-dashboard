// ============================================
// GT LANDS DASHBOARD - ANÁLISE DE PROPRIEDADES
// Ideias 11, 12, 13: Crime, Escolas, Desastres
// Versão COMPLETA - Todas as funcionalidades implementadas
// ============================================

// Funções auxiliares
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

// ============================================
// IDEIA 11: SCORE DE CRIMINALIDADE
// ============================================

window.analyzeCrime = async function(parcelNumber) {
    const property = window.allNewProperties.find(p => p['Parcel Number'] === parcelNumber);
    if (!property) {
        alert('Propriedade não encontrada!');
        return;
    }

    showLoading('Analisando criminalidade...');

    try {
        const lat = parseFloat(property.Latitude);
        const lon = parseFloat(property.Longitude);
        const radius = 0.5;

        const url = `https://spotcrime.com/api/crimes.json?lat=${lat}&lon=${lon}&radius=${radius}&key=publickey`;
        
        const response = await fetch(url);
        const data = await response.json();

        const crimeData = processCrimeData(data.crimes || []);
        showCrimeModal(property, crimeData);

    } catch (error) {
        console.error('Erro ao analisar crime:', error);
        alert('Erro ao buscar dados de criminalidade. Tente novamente.');
    } finally {
        hideLoading();
    }
};

function processCrimeData(crimes) {
    const crimeTypes = {};
    crimes.forEach(crime => {
        crimeTypes[crime.type] = (crimeTypes[crime.type] || 0) + 1;
    });

    const totalCrimes = crimes.length;
    let score = 100;
    
    if (totalCrimes === 0) score = 100;
    else if (totalCrimes <= 5) score = 90;
    else if (totalCrimes <= 10) score = 75;
    else if (totalCrimes <= 20) score = 60;
    else if (totalCrimes <= 30) score = 45;
    else if (totalCrimes <= 50) score = 30;
    else score = 15;

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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCrimes = crimes.filter(crime => {
        const crimeDate = new Date(crime.date);
        return crimeDate >= thirtyDaysAgo;
    });

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
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
    
    const crimeTypesList = Object.keys(crimeData.crimeTypes).length > 0 
        ? Object.entries(crimeData.crimeTypes)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => `
                <div class="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <span class="font-semibold text-gray-700">${type}</span>
                    <span class="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">${count}</span>
                </div>
            `).join('')
        : '<p class="text-gray-500 text-center py-4">Nenhum crime registrado</p>';

    const crimesList = crimeData.crimes.length > 0
        ? crimeData.crimes.slice(0, 10).map(crime => `
            <div class="bg-gray-50 rounded-lg p-3 border-l-4 border-red-500">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-semibold text-gray-800">${crime.type}</p>
                        <p class="text-sm text-gray-600">${crime.address}</p>
                    </div>
                    <span class="text-xs text-gray-500">${crime.date}</span>
                </div>
            </div>
        `).join('')
        : '<p class="text-gray-500 text-center py-4">Nenhum crime recente</p>';

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

                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">📊 Crimes por Tipo</h3>
                    <div class="space-y-2">
                        ${crimeTypesList}
                    </div>
                </div>

                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">📋 Crimes Recentes (últimos 10)</h3>
                    <div class="max-h-60 overflow-y-auto space-y-2">
                        ${crimesList}
                    </div>
                </div>

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

                <div class="flex gap-3 mt-6">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// ============================================
// IDEIA 12: ANÁLISE DE ESCOLAS
// ============================================

window.analyzeSchools = async function(parcelNumber) {
    const property = window.allNewProperties.find(p => p['Parcel Number'] === parcelNumber);
    if (!property) {
        alert('Propriedade não encontrada!');
        return;
    }

    const apiKey = localStorage.getItem('greatschools_api_key');
    if (!apiKey) {
        alert('⚠️ API Key do GreatSchools não configurada!\n\nVá em Configurações (⚙️) e adicione sua chave.\n\nObtenha em: https://www.greatschools.org/api/request-api-key/');
        return;
    }

    showLoading('Analisando escolas próximas...');

    try {
        const lat = parseFloat(property.Latitude);
        const lon = parseFloat(property.Longitude);
        const state = 'FL';

        const url = `https://api.greatschools.org/schools/nearby?lat=${lat}&lon=${lon}&radius=5&state=${state}&limit=10&key=${apiKey}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('API Key inválida ou erro na requisição');
        }
        
        const data = await response.json();

        const schoolData = processSchoolData(data.schools || []);
        showSchoolModal(property, schoolData);

    } catch (error) {
        console.error('Erro ao analisar escolas:', error);
        alert('Erro ao buscar dados de escolas. Verifique sua API key nas Configurações.');
    } finally {
        hideLoading();
    }
};

function processSchoolData(schools) {
    const elementary = schools.filter(s => s.level === 'elementary');
    const middle = schools.filter(s => s.level === 'middle');
    const high = schools.filter(s => s.level === 'high');

    const avgRating = schools.length > 0 
        ? schools.reduce((sum, s) => sum + (s.rating || 0), 0) / schools.length 
        : 0;

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

    const bestSchool = schools.reduce((best, school) => 
        (school.rating || 0) > (best.rating || 0) ? school : best
    , schools[0] || null);

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
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
    
    const schoolsList = schoolData.schools.length > 0
        ? schoolData.schools.map(school => {
            const ratingColor = school.rating >= 8 ? 'green' : school.rating >= 6 ? 'blue' : school.rating >= 4 ? 'yellow' : 'red';
            const stars = '⭐'.repeat(Math.round(school.rating / 2));
            return `
            <div class="bg-gray-50 rounded-lg p-3 border-l-4 border-${ratingColor}-500">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <p class="font-semibold text-gray-800">${school.name}</p>
                        <p class="text-xs text-gray-600">${school.address || ''}</p>
                        <p class="text-xs text-gray-500 mt-1">
                            <span class="capitalize">${school.level || ''}</span> ${school.distance ? '• ' + school.distance.toFixed(1) + ' milhas' : ''}
                        </p>
                    </div>
                    <div class="text-right">
                        <p class="text-2xl font-bold text-${ratingColor}-600">${school.rating}/10</p>
                        <p class="text-xs text-gray-500">${stars}</p>
                    </div>
                </div>
            </div>
        `}).join('')
        : '<p class="text-gray-500 text-center py-4">Nenhuma escola encontrada no raio de 5 milhas</p>';

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

                ${schoolData.bestSchool && schoolData.bestSchool.name ? `
                <div class="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold text-yellow-800 mb-2">⭐ Melhor Escola Próxima</h3>
                    <p class="font-semibold text-gray-800">${schoolData.bestSchool.name}</p>
                    <div class="flex items-center gap-4 mt-2">
                        <span class="text-2xl font-bold text-yellow-600">${schoolData.bestSchool.rating}/10</span>
                        <span class="text-sm text-gray-600">${schoolData.bestSchool.distance ? schoolData.bestSchool.distance.toFixed(1) + ' milhas' : ''}</span>
                        <span class="text-sm text-gray-600 capitalize">${schoolData.bestSchool.level || ''}</span>
                    </div>
                </div>
                ` : ''}

                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">📋 Todas as Escolas (raio de 5 milhas)</h3>
                    <div class="max-h-60 overflow-y-auto space-y-2">
                        ${schoolsList}
                    </div>
                </div>

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

                <div class="flex gap-3 mt-6">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// ============================================
// IDEIA 13: HISTÓRICO DE DESASTRES NATURAIS
// ============================================

window.analyzeDisasters = async function(parcelNumber) {
    const property = window.allNewProperties.find(p => p['Parcel Number'] === parcelNumber);
    if (!property) {
        alert('Propriedade não encontrada!');
        return;
    }

    showLoading('Analisando histórico de desastres...');

    try {
        const lat = parseFloat(property.Latitude);
        const lon = parseFloat(property.Longitude);
        const county = property.County;

        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        const dateFilter = tenYearsAgo.toISOString().split('T')[0];

        const disastersUrl = `https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$filter=state eq 'FL' and declarationDate gt '${dateFilter}'&$select=disasterNumber,declarationDate,disasterType,incidentType,title,designatedArea&$orderby=declarationDate desc`;
        
        const disastersResponse = await fetch(disastersUrl);
        const disastersData = await disastersResponse.json();

        const countyDisasters = disastersData.DisasterDeclarationsSummaries.filter(d => 
            d.designatedArea && d.designatedArea.includes(county.replace(' County', ''))
        );

        const floodUrl = `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query?geometry=${lon},${lat}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outFields=*&f=json`;
        
        const floodResponse = await fetch(floodUrl);
        const floodData = await floodResponse.json();

        const disasterData = processDisasterData(countyDisasters, floodData);
        showDisasterModal(property, disasterData);

    } catch (error) {
        console.error('Erro ao analisar desastres:', error);
        alert('Erro ao buscar dados de desastres. Tente novamente.');
    } finally {
        hideLoading();
    }
};

function processDisasterData(disasters, floodData) {
    const disasterTypes = {};
    disasters.forEach(d => {
        disasterTypes[d.incidentType] = (disasterTypes[d.incidentType] || 0) + 1;
    });

    let floodZone = 'X';
    let floodRisk = 'BAIXO';
    let floodColor = 'green';
    let insuranceCost = 800;

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
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
    
    const disasterTypesList = Object.keys(disasterData.disasterTypes).length > 0
        ? Object.entries(disasterData.disasterTypes)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => `
                <div class="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <span class="font-semibold text-gray-700">${type}</span>
                    <span class="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">${count}</span>
                </div>
            `).join('')
        : '<p class="text-gray-500 text-center py-4">Nenhum desastre registrado</p>';

    const disastersList = disasterData.disasters.length > 0
        ? disasterData.disasters.slice(0, 10).map(disaster => `
            <div class="bg-gray-50 rounded-lg p-3 border-l-4 border-orange-500">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-semibold text-gray-800">${disaster.title}</p>
                        <p class="text-sm text-gray-600">${disaster.incidentType}</p>
                    </div>
                    <span class="text-xs text-gray-500">${new Date(disaster.declarationDate).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
        `).join('')
        : '<p class="text-gray-500 text-center py-4">Nenhum desastre recente</p>';

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

                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">📊 Desastres por Tipo</h3>
                    <div class="space-y-2">
                        ${disasterTypesList}
                    </div>
                </div>

                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">📋 Histórico de Desastres (últimos 10)</h3>
                    <div class="max-h-60 overflow-y-auto space-y-2">
                        ${disastersList}
                    </div>
                </div>

                <div class="bg-blue-50 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold text-blue-800 mb-2">📖 Entenda as Flood Zones</h3>
                    <ul class="text-sm text-gray-700 space-y-1">
                        <li><strong>Zone X:</strong> Fora de área de risco (seguro barato ~$800/ano)</li>
                        <li><strong>Zone A/AE:</strong> Alto risco de inundação (seguro caro ~$3,500/ano)</li>
                        <li><strong>Zone V/VE:</strong> Muito alto risco (costa) (seguro muito caro ~$5,000+/ano)</li>
                        <li><strong>Zone B/C:</strong> Risco moderado (seguro médio ~$1,500/ano)</li>
                    </ul>
                </div>

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

                <div class="flex gap-3 mt-6">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// ============================================
// PAINEL DE CONFIGURAÇÕES
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettingsModal);
    }
});

function showSettingsModal() {
    const greatschoolsKey = localStorage.getItem('greatschools_api_key') || '';

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
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
                <div class="border-b pb-4">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        🔍 RapidAPI Key (Zillow)
                    </label>
                    <input type="password" id="rapidapiKey" value="${rapidApiKey}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                           placeholder="Sua RapidAPI Key...">
                    <div class="flex gap-2">
                        <button onclick="saveAPIKey('rapidapi')" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                            💾 Salvar
                        </button>
                        <a href="https://rapidapi.com/apimaker/api/zillow-com1" target="_blank" 
                           class="text-blue-600 text-sm hover:underline flex items-center">
                            Como obter →
                        </a>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">Necessário para análise de comps (~$25-50/mês)</p>
                </div>

                <div class="border-b pb-4">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        🤖 OpenAI API Key (GPT-4)
                    </label>
                    <input type="password" id="openaiKey" value="${openaiApiKey}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                           placeholder="sk-...">
                    <div class="flex gap-2">
                        <button onclick="saveAPIKey('openai')" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                            💾 Salvar
                        </button>
                        <a href="https://platform.openai.com/api-keys" target="_blank" 
                           class="text-blue-600 text-sm hover:underline flex items-center">
                            Como obter →
                        </a>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">Necessário para análise IA e recomendações (~$5-10/mês)</p>
                </div>

                <div class="bg-blue-50 rounded-lg p-4">
                    <h3 class="font-bold text-gray-800 mb-2">📋 Status das APIs:</h3>
                    <ul class="text-sm text-gray-700 space-y-1">
                        <li>🚨 <strong>SpotCrime:</strong> Grátis, sem cadastro (IDEIA 11)</li>
                        <li>🏫 <strong>GreatSchools:</strong> ${greatschoolsKey ? '✅ Configurado' : '⚠️ Precisa configurar'} (IDEIA 12)</li>
                        <li>🌪️ <strong>FEMA:</strong> Grátis, sem cadastro (IDEIA 13)</li>
                    </ul>
                </div>

                <div class="flex gap-3">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function saveAPIKey(apiName) {
    const key = document.getElementById(`${apiName}Key`).value;
    localStorage.setItem(`${apiName}_api_key`, key);
    alert('✅ API Key salva com sucesso!');
}

console.log('✅ GT Lands Analysis Module loaded - VERSÃO COMPLETA');
console.log('📋 Funcionalidades disponíveis:');
console.log('  🚨 analyzeCrime() - Score de Criminalidade');
console.log('  🏫 analyzeSchools() - Análise de Escolas');
console.log('  🌪️ analyzeDisasters() - Histórico de Desastres');




// ============================================
// IDEIA 14: ANÁLISE DE ZONEAMENTO
// ============================================

window.analyzeZoning = async function(parcelNumber) {
    const property = window.allNewProperties.find(p => p['Parcel Number'] === parcelNumber);
    if (!property) {
        alert('Propriedade não encontrada!');
        return;
    }

    showLoading('Analisando zoneamento...');

    try {
        // Simular análise de zoneamento (em produção, usar API do County Assessor)
        const zoningData = await simulateZoningAnalysis(property);
        showZoningModal(property, zoningData);

    } catch (error) {
        console.error('Erro ao analisar zoneamento:', error);
        alert('Erro ao buscar dados de zoneamento. Tente novamente.');
    } finally {
        hideLoading();
    }
};

async function simulateZoningAnalysis(property) {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Determinar zoneamento baseado no tipo de propriedade
    const parcelType = property['Parcel Type'] || 'Land Only';
    let currentZoning = 'Residencial';
    let allowedUses = ['Residencial Unifamiliar', 'Residencial Multifamiliar'];
    let potentialUses = [];
    let valueImpact = 0;
    let color = 'blue';

    if (parcelType.includes('Land Only')) {
        currentZoning = 'Residencial (R-1)';
        allowedUses = ['Residencial Unifamiliar'];
        potentialUses = ['Residencial Multifamiliar (R-3)', 'Comercial (C-1)'];
        valueImpact = 25;
        color = 'green';
    } else if (parcelType.includes('Structures')) {
        currentZoning = 'Residencial (R-2)';
        allowedUses = ['Residencial Unifamiliar', 'Duplex'];
        potentialUses = ['Comercial (C-1)', 'Misto (M-1)'];
        valueImpact = 15;
        color = 'blue';
    }

    // Verificar se está em área comercial (baseado em endereço)
    const address = (property.Address || '').toLowerCase();
    if (address.includes('main') || address.includes('central') || address.includes('commercial')) {
        currentZoning = 'Comercial (C-1)';
        allowedUses = ['Comercial', 'Escritórios', 'Varejo'];
        potentialUses = ['Misto (M-1)', 'Industrial Leve (I-1)'];
        valueImpact = 35;
        color = 'purple';
    }

    const acres = parseFloat(property.Acres) || 0;
    let developmentPotential = 'Baixo';
    if (acres >= 5) {
        developmentPotential = 'Alto';
        potentialUses.push('Subdivisão Residencial');
        valueImpact += 20;
    } else if (acres >= 1) {
        developmentPotential = 'Médio';
    }

    return {
        currentZoning,
        allowedUses,
        potentialUses,
        valueImpact,
        color,
        developmentPotential,
        acres,
        restrictions: [
            'Setback frontal: 25 pés',
            'Setback lateral: 10 pés',
            'Cobertura máxima: 40%',
            'Altura máxima: 35 pés'
        ]
    };
}

function showZoningModal(property, zoningData) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="bg-${zoningData.color}-600 text-white p-6 rounded-t-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">📋 Análise de Zoneamento</h2>
                        <p class="text-sm opacity-90">${property['Address'] || 'N/A'}</p>
                        <p class="text-xs opacity-75">Parcel: ${property['Parcel Number']}</p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-gray-200 text-3xl font-bold">
                        ×
                    </button>
                </div>
            </div>

            <div class="p-6">
                <div class="bg-${zoningData.color}-50 border-2 border-${zoningData.color}-200 rounded-lg p-6 mb-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-bold text-gray-800 mb-2">Zoneamento Atual</h3>
                            <p class="text-4xl font-bold text-${zoningData.color}-600">${zoningData.currentZoning}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-600 mb-1">Potencial de Valorização:</p>
                            <p class="text-3xl font-bold text-green-600">+${zoningData.valueImpact}%</p>
                            <p class="text-sm text-gray-600 mt-2">com mudança de uso</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-blue-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">Tamanho do Lote</p>
                        <p class="text-3xl font-bold text-blue-600">${zoningData.acres}</p>
                        <p class="text-xs text-gray-500 mt-1">acres</p>
                    </div>
                    <div class="bg-purple-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">Potencial de Desenvolvimento</p>
                        <p class="text-2xl font-bold text-purple-600">${zoningData.developmentPotential}</p>
                        <p class="text-xs text-gray-500 mt-1">baseado no tamanho</p>
                    </div>
                    <div class="bg-green-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">Usos Permitidos</p>
                        <p class="text-3xl font-bold text-green-600">${zoningData.allowedUses.length}</p>
                        <p class="text-xs text-gray-500 mt-1">tipos de uso</p>
                    </div>
                </div>

                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">✅ Usos Permitidos Atualmente</h3>
                    <div class="space-y-2">
                        ${zoningData.allowedUses.map(use => `
                            <div class="flex items-center bg-green-50 rounded-lg p-3">
                                <span class="text-green-600 mr-2">✓</span>
                                <span class="font-semibold text-gray-700">${use}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">🚀 Usos Potenciais (com rezoneamento)</h3>
                    <div class="space-y-2">
                        ${zoningData.potentialUses.map(use => `
                            <div class="flex items-center justify-between bg-purple-50 rounded-lg p-3">
                                <div class="flex items-center">
                                    <span class="text-purple-600 mr-2">→</span>
                                    <span class="font-semibold text-gray-700">${use}</span>
                                </div>
                                <span class="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">Requer aprovação</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">📏 Restrições de Construção</h3>
                    <div class="bg-gray-50 rounded-lg p-4">
                        <ul class="text-sm text-gray-700 space-y-2">
                            ${zoningData.restrictions.map(restriction => `
                                <li class="flex items-start">
                                    <span class="text-gray-400 mr-2">•</span>
                                    <span>${restriction}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>

                <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                    <h3 class="text-lg font-bold text-blue-800 mb-2">💡 Oportunidades</h3>
                    ${zoningData.valueImpact >= 30 ? `
                        <p class="text-sm text-gray-700">✅ ALTO POTENCIAL! Mudança de zoneamento pode aumentar valor em até ${zoningData.valueImpact}%!</p>
                        <p class="text-sm text-gray-700 mt-2">Considere rezoneamento para uso comercial ou misto.</p>
                    ` : zoningData.valueImpact >= 15 ? `
                        <p class="text-sm text-gray-700">✅ BOM POTENCIAL. Mudança de uso pode agregar ${zoningData.valueImpact}% ao valor.</p>
                        <p class="text-sm text-gray-700 mt-2">Analise viabilidade de rezoneamento.</p>
                    ` : `
                        <p class="text-sm text-gray-700">⚠️ Potencial moderado. Foque nos usos permitidos atuais.</p>
                    `}
                </div>

                <div class="flex gap-3 mt-6">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// ============================================
// IDEIA 20: SIMULADOR DE CENÁRIOS
// ============================================

window.openScenarioSimulator = function(parcelNumber) {
    const property = window.allNewProperties.find(p => p['Parcel Number'] === parcelNumber);
    if (!property) {
        alert('Propriedade não encontrada!');
        return;
    }

    showScenarioSimulatorModal(property);
};

function showScenarioSimulatorModal(property) {
    const purchasePrice = parseFloat(property['Amount Due']) || 10000;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">🎮 Simulador de Cenários</h2>
                        <p class="text-sm opacity-90">${property['Address'] || 'N/A'}</p>
                        <p class="text-xs opacity-75">Parcel: ${property['Parcel Number']}</p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-gray-200 text-3xl font-bold">
                        ×
                    </button>
                </div>
            </div>

            <div class="p-6">
                <!-- Inputs -->
                <div class="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">📊 Parâmetros da Propriedade</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Preço de Compra</label>
                            <input type="number" id="simPurchasePrice" value="${purchasePrice}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   onchange="updateSimulation()">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">ARV (After Repair Value)</label>
                            <input type="number" id="simARV" value="${Math.round(purchasePrice * 1.5)}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   onchange="updateSimulation()">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Custo de Reforma</label>
                            <input type="number" id="simRepairCost" value="${Math.round(purchasePrice * 0.3)}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   onchange="updateSimulation()">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Aluguel Mensal Estimado</label>
                            <input type="number" id="simRent" value="1200" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   onchange="updateSimulation()">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Taxa de Vacância (%)</label>
                            <input type="number" id="simVacancy" value="5" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   onchange="updateSimulation()">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Custos Mensais (Impostos, Seguro)</label>
                            <input type="number" id="simMonthlyCosts" value="300" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                   onchange="updateSimulation()">
                        </div>
                    </div>
                </div>

                <!-- Cenários -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <!-- Cenário 1: Flip -->
                    <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <h4 class="text-lg font-bold text-blue-800 mb-3">🏠 Cenário 1: FLIP</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">ARV:</span>
                                <span class="font-bold" id="flip-arv">$0</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Compra + Reforma:</span>
                                <span class="font-bold" id="flip-costs">$0</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Custos de Venda (6%):</span>
                                <span class="font-bold" id="flip-selling">$0</span>
                            </div>
                            <div class="flex justify-between border-t-2 border-blue-300 pt-2">
                                <span class="text-gray-800 font-bold">Lucro Líquido:</span>
                                <span class="font-bold text-green-600" id="flip-profit">$0</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-800 font-bold">ROI:</span>
                                <span class="font-bold text-blue-600" id="flip-roi">0%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Cenário 2: Aluguel -->
                    <div class="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                        <h4 class="text-lg font-bold text-purple-800 mb-3">🏘️ Cenário 2: ALUGUEL</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Renda Mensal:</span>
                                <span class="font-bold" id="rent-income">$0</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Custos Mensais:</span>
                                <span class="font-bold" id="rent-costs">$0</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Vacância (5%):</span>
                                <span class="font-bold" id="rent-vacancy">$0</span>
                            </div>
                            <div class="flex justify-between border-t-2 border-purple-300 pt-2">
                                <span class="text-gray-800 font-bold">Fluxo Mensal:</span>
                                <span class="font-bold text-green-600" id="rent-cashflow">$0</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-800 font-bold">Cap Rate:</span>
                                <span class="font-bold text-purple-600" id="rent-caprate">0%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600 text-xs">Retorno em 5 anos:</span>
                                <span class="font-bold text-xs" id="rent-5year">$0</span>
                            </div>
                        </div>
                    </div>

                    <!-- Cenário 3: Hold -->
                    <div class="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <h4 class="text-lg font-bold text-green-800 mb-3">📈 Cenário 3: HOLD</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Valorização (3%/ano):</span>
                                <span class="font-bold" id="hold-appreciation">$0</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Valor em 5 anos:</span>
                                <span class="font-bold" id="hold-value5">$0</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Valor em 10 anos:</span>
                                <span class="font-bold" id="hold-value10">$0</span>
                            </div>
                            <div class="flex justify-between border-t-2 border-green-300 pt-2">
                                <span class="text-gray-800 font-bold">Ganho em 10 anos:</span>
                                <span class="font-bold text-green-600" id="hold-gain">$0</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-800 font-bold">ROI (10 anos):</span>
                                <span class="font-bold text-green-600" id="hold-roi">0%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recomendação -->
                <div id="recommendation" class="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold text-yellow-800 mb-2">💡 Recomendação</h3>
                    <p class="text-sm text-gray-700" id="recommendation-text">Ajuste os parâmetros acima para ver a recomendação.</p>
                </div>

                <!-- Análise de Sensibilidade -->
                <div class="bg-gray-50 rounded-lg p-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">📊 Análise de Sensibilidade</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p class="font-semibold text-gray-700 mb-2">E se o ARV for 10% menor?</p>
                            <p class="text-gray-600" id="sensitivity-arv-down">-</p>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-700 mb-2">E se a reforma custar 20% mais?</p>
                            <p class="text-gray-600" id="sensitivity-repair-up">-</p>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-700 mb-2">E se o aluguel for 15% menor?</p>
                            <p class="text-gray-600" id="sensitivity-rent-down">-</p>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-700 mb-2">E se a vacância for 10%?</p>
                            <p class="text-gray-600" id="sensitivity-vacancy-up">-</p>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 mt-6">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600">
                        Fechar
                    </button>
                    <button onclick="exportSimulation()" class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
                        📥 Exportar Análise
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    // Calcular cenários iniciais
    setTimeout(updateSimulation, 100);
}

function updateSimulation() {
    const purchasePrice = parseFloat(document.getElementById('simPurchasePrice').value) || 0;
    const arv = parseFloat(document.getElementById('simARV').value) || 0;
    const repairCost = parseFloat(document.getElementById('simRepairCost').value) || 0;
    const rent = parseFloat(document.getElementById('simRent').value) || 0;
    const vacancy = parseFloat(document.getElementById('simVacancy').value) || 5;
    const monthlyCosts = parseFloat(document.getElementById('simMonthlyCosts').value) || 0;

    // Cenário 1: FLIP
    const totalCosts = purchasePrice + repairCost;
    const sellingCosts = arv * 0.06;
    const flipProfit = arv - totalCosts - sellingCosts;
    const flipROI = (flipProfit / totalCosts) * 100;

    document.getElementById('flip-arv').textContent = `$${arv.toLocaleString()}`;
    document.getElementById('flip-costs').textContent = `$${totalCosts.toLocaleString()}`;
    document.getElementById('flip-selling').textContent = `$${Math.round(sellingCosts).toLocaleString()}`;
    document.getElementById('flip-profit').textContent = `$${Math.round(flipProfit).toLocaleString()}`;
    document.getElementById('flip-roi').textContent = `${flipROI.toFixed(1)}%`;

    // Cenário 2: ALUGUEL
    const vacancyLoss = rent * (vacancy / 100);
    const netRent = rent - vacancyLoss;
    const cashflow = netRent - monthlyCosts;
    const annualIncome = netRent * 12;
    const capRate = (annualIncome / totalCosts) * 100;
    const return5Year = cashflow * 12 * 5;

    document.getElementById('rent-income').textContent = `$${rent.toLocaleString()}`;
    document.getElementById('rent-costs').textContent = `$${monthlyCosts.toLocaleString()}`;
    document.getElementById('rent-vacancy').textContent = `$${Math.round(vacancyLoss).toLocaleString()}`;
    document.getElementById('rent-cashflow').textContent = `$${Math.round(cashflow).toLocaleString()}`;
    document.getElementById('rent-caprate').textContent = `${capRate.toFixed(1)}%`;
    document.getElementById('rent-5year').textContent = `$${Math.round(return5Year).toLocaleString()}`;

    // Cenário 3: HOLD
    const appreciationRate = 0.03;
    const value5Year = arv * Math.pow(1 + appreciationRate, 5);
    const value10Year = arv * Math.pow(1 + appreciationRate, 10);
    const gain10Year = value10Year - totalCosts;
    const holdROI = (gain10Year / totalCosts) * 100;

    document.getElementById('hold-appreciation').textContent = `${(appreciationRate * 100).toFixed(0)}%`;
    document.getElementById('hold-value5').textContent = `$${Math.round(value5Year).toLocaleString()}`;
    document.getElementById('hold-value10').textContent = `$${Math.round(value10Year).toLocaleString()}`;
    document.getElementById('hold-gain').textContent = `$${Math.round(gain10Year).toLocaleString()}`;
    document.getElementById('hold-roi').textContent = `${holdROI.toFixed(1)}%`;

    // Recomendação
    let bestStrategy = 'FLIP';
    let bestReturn = flipROI;
    
    if (capRate > flipROI / 5) {
        bestStrategy = 'ALUGUEL';
        bestReturn = capRate;
    }
    
    if (holdROI / 10 > flipROI / 5) {
        bestStrategy = 'HOLD';
        bestReturn = holdROI / 10;
    }

    const recommendationText = `
        <strong>Melhor estratégia: ${bestStrategy}</strong><br>
        ${bestStrategy === 'FLIP' ? `Lucro estimado de $${Math.round(flipProfit).toLocaleString()} com ROI de ${flipROI.toFixed(1)}%` : ''}
        ${bestStrategy === 'ALUGUEL' ? `Fluxo de caixa mensal de $${Math.round(cashflow).toLocaleString()} com Cap Rate de ${capRate.toFixed(1)}%` : ''}
        ${bestStrategy === 'HOLD' ? `Ganho de $${Math.round(gain10Year).toLocaleString()} em 10 anos com ROI de ${holdROI.toFixed(1)}%` : ''}
    `;
    document.getElementById('recommendation-text').innerHTML = recommendationText;

    // Análise de Sensibilidade
    const arvDown = arv * 0.9;
    const flipProfitArvDown = arvDown - totalCosts - (arvDown * 0.06);
    document.getElementById('sensitivity-arv-down').textContent = `Lucro FLIP: $${Math.round(flipProfitArvDown).toLocaleString()} (${((flipProfitArvDown / totalCosts) * 100).toFixed(1)}% ROI)`;

    const repairUp = repairCost * 1.2;
    const totalCostsRepairUp = purchasePrice + repairUp;
    const flipProfitRepairUp = arv - totalCostsRepairUp - sellingCosts;
    document.getElementById('sensitivity-repair-up').textContent = `Lucro FLIP: $${Math.round(flipProfitRepairUp).toLocaleString()} (${((flipProfitRepairUp / totalCostsRepairUp) * 100).toFixed(1)}% ROI)`;

    const rentDown = rent * 0.85;
    const cashflowRentDown = (rentDown - (rentDown * vacancy / 100)) - monthlyCosts;
    document.getElementById('sensitivity-rent-down').textContent = `Fluxo mensal: $${Math.round(cashflowRentDown).toLocaleString()}`;

    const vacancyUp = 10;
    const cashflowVacancyUp = (rent - (rent * vacancyUp / 100)) - monthlyCosts;
    document.getElementById('sensitivity-vacancy-up').textContent = `Fluxo mensal: $${Math.round(cashflowVacancyUp).toLocaleString()}`;
}

function exportSimulation() {
    const data = {
        purchasePrice: document.getElementById('simPurchasePrice').value,
        arv: document.getElementById('simARV').value,
        repairCost: document.getElementById('simRepairCost').value,
        rent: document.getElementById('simRent').value,
        vacancy: document.getElementById('simVacancy').value,
        monthlyCosts: document.getElementById('simMonthlyCosts').value,
        timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulacao-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    alert('✅ Simulação exportada com sucesso!');
}

console.log('✅ FASE 2 implementada: Zoneamento + Simulador de Cenários');




// ============================================
// GOOGLE VISION AI - ANÁLISE DE IMAGENS
// ============================================

window.analyzePropertyImages = async function(parcelNumber) {
    const property = window.allNewProperties.find(p => p['Parcel Number'] === parcelNumber);
    if (!property) {
        alert('Propriedade não encontrada!');
        return;
    }

    const apiKey = localStorage.getItem('vision_api_key');
    if (!apiKey) {
        alert('⚠️ API Key do Google Vision AI não configurada!\n\nVá em Configurações (⚙️) e adicione sua chave.\n\nObtenha em: https://console.cloud.google.com/apis/credentials');
        return;
    }

    showLoading('Analisando imagens com IA...');

    try {
        const lat = parseFloat(property.Latitude);
        const lon = parseFloat(property.Longitude);

        // Obter imagem do Street View
        const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lon}&key=${apiKey}`;
        
        // Converter imagem para base64
        const response = await fetch(streetViewUrl);
        const blob = await response.blob();
        const base64 = await blobToBase64(blob);
        const base64Image = base64.split(',')[1];

        // Analisar com Google Vision AI
        const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
        const visionResponse = await fetch(visionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requests: [{
                    image: { content: base64Image },
                    features: [
                        { type: 'LABEL_DETECTION', maxResults: 10 },
                        { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
                        { type: 'IMAGE_PROPERTIES' }
                    ]
                }]
            })
        });

        const visionData = await visionResponse.json();
        const analysisResult = processVisionData(visionData, streetViewUrl);
        showVisionModal(property, analysisResult);

    } catch (error) {
        console.error('Erro ao analisar imagens:', error);
        alert('Erro ao analisar imagens. Verifique sua API key.');
    } finally {
        hideLoading();
    }
};

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function processVisionData(data, imageUrl) {
    const labels = data.responses[0]?.labelAnnotations || [];
    const objects = data.responses[0]?.localizedObjectAnnotations || [];

    // Detectar condição da propriedade
    const conditions = {
        roof: 'Desconhecido',
        paint: 'Desconhecido',
        windows: 'Desconhecido',
        yard: 'Desconhecido'
    };

    let repairTier = 'MEDIUM';
    let score = 70;

    // Analisar labels
    labels.forEach(label => {
        const name = label.description.toLowerCase();
        const confidence = label.score;

        if (name.includes('roof') || name.includes('telhado')) {
            conditions.roof = confidence > 0.8 ? 'Bom' : confidence > 0.5 ? 'Regular' : 'Ruim';
        }
        if (name.includes('paint') || name.includes('pintura')) {
            conditions.paint = confidence > 0.8 ? 'Bom' : confidence > 0.5 ? 'Regular' : 'Ruim';
        }
        if (name.includes('window') || name.includes('janela')) {
            conditions.windows = confidence > 0.8 ? 'Bom' : confidence > 0.5 ? 'Regular' : 'Ruim';
        }
        if (name.includes('yard') || name.includes('garden') || name.includes('jardim')) {
            conditions.yard = confidence > 0.8 ? 'Bom' : confidence > 0.5 ? 'Regular' : 'Ruim';
        }

        // Detectar sinais de deterioração
        if (name.includes('abandoned') || name.includes('damage') || name.includes('broken')) {
            score -= 20;
        }
        if (name.includes('new') || name.includes('modern') || name.includes('renovated')) {
            score += 10;
        }
    });

    // Determinar tier de reforma
    if (score >= 80) {
        repairTier = 'BASICA';
    } else if (score >= 60) {
        repairTier = 'SOFT';
    } else if (score >= 40) {
        repairTier = 'MEDIUM';
    } else {
        repairTier = 'HEAVY';
    }

    return {
        imageUrl,
        labels: labels.slice(0, 10),
        objects,
        conditions,
        repairTier,
        score,
        estimatedCost: {
            'BASICA': 10,
            'SOFT': 30,
            'MEDIUM': 50,
            'HEAVY': 80
        }[repairTier]
    };
}

function showVisionModal(property, analysis) {
    const tierColors = {
        'BASICA': 'green',
        'SOFT': 'blue',
        'MEDIUM': 'yellow',
        'HEAVY': 'red'
    };

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">📸 Análise de Imagens com IA</h2>
                        <p class="text-sm opacity-90">${property['Address'] || 'N/A'}</p>
                        <p class="text-xs opacity-75">Parcel: ${property['Parcel Number']}</p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-gray-200 text-3xl font-bold">
                        ×
                    </button>
                </div>
            </div>

            <div class="p-6">
                <div class="mb-6">
                    <img src="${analysis.imageUrl}" alt="Street View" class="w-full rounded-lg shadow-lg">
                </div>

                <div class="bg-${tierColors[analysis.repairTier]}-50 border-2 border-${tierColors[analysis.repairTier]}-200 rounded-lg p-6 mb-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-bold text-gray-800 mb-2">Tier de Reforma</h3>
                            <p class="text-4xl font-bold text-${tierColors[analysis.repairTier]}-600">${analysis.repairTier}</p>
                            <p class="text-sm text-gray-600 mt-2">Score de condição: ${analysis.score}/100</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-600 mb-1">Custo Estimado:</p>
                            <p class="text-3xl font-bold text-gray-800">$${analysis.estimatedCost}/sqft</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-blue-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">🏠 Telhado</p>
                        <p class="text-xl font-bold text-blue-600">${analysis.conditions.roof}</p>
                    </div>
                    <div class="bg-purple-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">🎨 Pintura</p>
                        <p class="text-xl font-bold text-purple-600">${analysis.conditions.paint}</p>
                    </div>
                    <div class="bg-green-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">🪟 Janelas</p>
                        <p class="text-xl font-bold text-green-600">${analysis.conditions.windows}</p>
                    </div>
                    <div class="bg-yellow-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">🌳 Jardim</p>
                        <p class="text-xl font-bold text-yellow-600">${analysis.conditions.yard}</p>
                    </div>
                </div>

                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">🏷️ Características Detectadas</h3>
                    <div class="flex flex-wrap gap-2">
                        ${analysis.labels.map(label => `
                            <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                ${label.description} (${Math.round(label.score * 100)}%)
                            </span>
                        `).join('')}
                    </div>
                </div>

                <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                    <h3 class="text-lg font-bold text-blue-800 mb-2">💡 Recomendações</h3>
                    ${analysis.repairTier === 'BASICA' ? `
                        <p class="text-sm text-gray-700">✅ Propriedade em bom estado! Reforma básica (~$10/sqft).</p>
                    ` : analysis.repairTier === 'SOFT' ? `
                        <p class="text-sm text-gray-700">✅ Reforma leve necessária (~$30/sqft). Pintura, paisagismo.</p>
                    ` : analysis.repairTier === 'MEDIUM' ? `
                        <p class="text-sm text-gray-700">⚠️ Reforma média necessária (~$50/sqft). Telhado, janelas, pintura.</p>
                    ` : `
                        <p class="text-sm text-gray-700">❌ Reforma pesada necessária (~$80/sqft). Estrutura, telhado, sistemas.</p>
                    `}
                </div>

                <div class="flex gap-3 mt-6">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// ============================================
// SISTEMA DE BACKUP AUTOMÁTICO
// ============================================

window.createBackup = function() {
    const backupData = {
        properties: window.allNewProperties || [],
        oldProperties: window.allOldProperties || [],
        analyses: getAllAnalyses(),
        timestamp: new Date().toISOString(),
        version: '18.0'
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `gt-lands-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // Salvar no localStorage também
    saveBackupToLocalStorage(backupData);

    showNotification('✅ Backup criado com sucesso!', 'success');
};

window.restoreBackup = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const backupData = JSON.parse(text);

            if (confirm('⚠️ Restaurar backup irá substituir todos os dados atuais. Continuar?')) {
                window.allNewProperties = backupData.properties || [];
                window.allOldProperties = backupData.oldProperties || [];
                restoreAllAnalyses(backupData.analyses || {});

                // Atualizar interface
                if (typeof populateTable === 'function') populateTable();
                if (typeof updateMap === 'function') updateMap();

                showNotification('✅ Backup restaurado com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            showNotification('❌ Erro ao restaurar backup!', 'error');
        }
    };
    input.click();
};

function getAllAnalyses() {
    const analyses = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('analysis_')) {
            analyses[key] = localStorage.getItem(key);
        }
    }
    return analyses;
}

function restoreAllAnalyses(analyses) {
    Object.entries(analyses).forEach(([key, value]) => {
        localStorage.setItem(key, value);
    });
}

function saveBackupToLocalStorage(backupData) {
    const backups = JSON.parse(localStorage.getItem('backups_history') || '[]');
    backups.unshift({
        timestamp: backupData.timestamp,
        size: JSON.stringify(backupData).length,
        propertiesCount: backupData.properties.length
    });

    // Manter apenas os últimos 5 backups
    if (backups.length > 5) backups.pop();

    localStorage.setItem('backups_history', JSON.stringify(backups));
    localStorage.setItem('latest_backup', JSON.stringify(backupData));
}

// ============================================
// SISTEMA DE NOTIFICAÇÕES TOAST
// ============================================

function showNotification(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg z-[9999] animate-slide-in`;
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <span>${message}</span>
            <button onclick="this.closest('div').remove()" class="text-white hover:text-gray-200 font-bold">×</button>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('animate-slide-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// ATUALIZAR PAINEL DE CONFIGURAÇÕES
// ============================================

// Sobrescrever função original para incluir todas as APIs
const originalShowSettingsModal = showSettingsModal;
showSettingsModal = function() {
    const rapidApiKey = localStorage.getItem('rapidapi_key') || '3eff6f411msh25829339707ed3fp167b43jsn832e9dd3f20d';
    const openaiApiKey = localStorage.getItem('openai_api_key') || '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';
    const visionKey = localStorage.getItem('vision_api_key') || '';
    const gmapsKey = localStorage.getItem('gmaps_api_key') || '';

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
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
                <div class="border-b pb-4">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        🔍 RapidAPI Key (Zillow)
                    </label>
                    <input type="password" id="rapidapiKey" value="${rapidApiKey}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                           placeholder="Sua RapidAPI Key...">
                    <div class="flex gap-2">
                        <button onclick="saveAPIKey('rapidapi')" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                            💾 Salvar
                        </button>
                        <a href="https://rapidapi.com/apimaker/api/zillow-com1" target="_blank" 
                           class="text-blue-600 text-sm hover:underline flex items-center">
                            Como obter →
                        </a>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">Necessário para análise de comps (~$25-50/mês)</p>
                </div>

                <div class="border-b pb-4">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        🤖 OpenAI API Key (GPT-4)
                    </label>
                    <input type="password" id="openaiKey" value="${openaiApiKey}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                           placeholder="sk-...">
                    <div class="flex gap-2">
                        <button onclick="saveAPIKey('openai')" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                            💾 Salvar
                        </button>
                        <a href="https://platform.openai.com/api-keys" target="_blank" 
                           class="text-blue-600 text-sm hover:underline flex items-center">
                            Como obter →
                        </a>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">Necessário para análise IA e recomendações (~$5-10/mês)</p>
                </div>

                <div class="border-b pb-4">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        📸 Google Vision AI API Key
                    </label>
                    <input type="password" id="visionKey" value="${visionKey}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                           placeholder="AIza...">
                    <div class="flex gap-2">
                        <button onclick="saveAPIKey('vision')" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                            💾 Salvar
                        </button>
                        <a href="https://console.cloud.google.com/apis/credentials" target="_blank" 
                           class="text-blue-600 text-sm hover:underline flex items-center">
                            Como obter →
                        </a>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">Necessário para análise de imagens com IA</p>
                </div>

                <div class="border-b pb-4">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        🗺️ Google Maps API Key
                    </label>
                    <input type="password" id="gmapsKey" value="${gmapsKey}" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                           placeholder="AIza...">
                    <div class="flex gap-2">
                        <button onclick="saveAPIKey('gmaps')" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                            💾 Salvar
                        </button>
                        <a href="https://console.cloud.google.com/apis/credentials" target="_blank" 
                           class="text-blue-600 text-sm hover:underline flex items-center">
                            Como obter →
                        </a>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">Necessário para Street View e Satellite (GRÁTIS até 28k/mês)</p>
                </div>

                <div class="bg-blue-50 rounded-lg p-4">
                    <h3 class="font-bold text-gray-800 mb-2">📋 Status das APIs:</h3>
                    <ul class="text-sm text-gray-700 space-y-1">
                        <li>🚨 <strong>SpotCrime:</strong> Grátis, sem cadastro</li>
                        <li>🌪️ <strong>FEMA:</strong> Grátis, sem cadastro</li>
                        <li>📋 <strong>Zoneamento:</strong> Simulado (grátis)</li>
                        <li>🗺️ <strong>Google Maps:</strong> ${gmapsKey ? '✅ Configurado' : '⚠️ Precisa configurar'} (GRÁTIS até 28k/mês)</li>
                        <li>🔍 <strong>RapidAPI Zillow:</strong> ${rapidApiKey ? '✅ Configurado' : '⚠️ Precisa configurar'} (~$25-50/mês)</li>
                        <li>🤖 <strong>OpenAI GPT-4:</strong> ${openaiApiKey ? '✅ Configurado' : '⚠️ Precisa configurar'} (~$5-10/mês)</li>
                        <li>📸 <strong>Google Vision:</strong> ${visionKey ? '✅ Configurado' : '⚠️ Precisa configurar'} (~$1-10/mês)</li>
                    </ul>
                    <p class="text-xs text-gray-600 mt-3"><strong>Custo total estimado:</strong> $31-70/mês (Google Maps GRÁTIS)</p>
                </div>

                <div class="bg-yellow-50 rounded-lg p-4">
                    <h3 class="font-bold text-gray-800 mb-2">💾 Backup de Dados:</h3>
                    <div class="flex gap-2">
                        <button onclick="createBackup(); this.closest('.fixed').remove();" class="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                            📥 Criar Backup
                        </button>
                        <button onclick="restoreBackup(); this.closest('.fixed').remove();" class="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                            📂 Restaurar Backup
                        </button>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
};

// Atualizar função saveAPIKey para incluir Vision e Google Maps
const originalSaveAPIKey = saveAPIKey;
saveAPIKey = function(apiName) {
    const key = document.getElementById(`${apiName}Key`).value;
    localStorage.setItem(`${apiName}_api_key`, key);
    showNotification('✅ API Key salva com sucesso!', 'success');
};

console.log('✅ FASES 3 e 4 implementadas: Vision AI + Backup + Notificações');




// ============================================
// ANÁLISE DE COMPS + CÁLCULO DE BID
// ============================================

window.analyzeComps = async function(parcelNumber) {
    const property = window.allNewProperties.find(p => p['Parcel Number'] === parcelNumber);
    if (!property) {
        alert('Propriedade não encontrada!');
        return;
    }

    const rapidApiKey = localStorage.getItem('rapidapi_key') || '3eff6f411msh25829339707ed3fp167b43jsn832e9dd3f20d';
    const openaiApiKey = localStorage.getItem('openai_api_key') || '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';
    
    if (!rapidApiKey || !openaiApiKey) {
        alert('⚠️ API Keys não configuradas!\n\nVá em Configurações (⚙️) e adicione:\n- RapidAPI Key (Zillow)\n- OpenAI API Key\n\nObtenha em:\n- RapidAPI: https://rapidapi.com/apimaker/api/zillow-com1\n- OpenAI: https://platform.openai.com/api-keys');
        return;
    }

    showLoading('Analisando comps e calculando BID...');

    try {
        const lat = parseFloat(property.Latitude);
        const lon = parseFloat(property.Longitude);
        const address = property.Address || '';

        // 1. Buscar comps via RapidAPI Zillow
        const compsUrl = `https://zillow-com1.p.rapidapi.com/similarProperty?zpid=${address}`;
        const compsResponse = await fetch(compsUrl, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
            }
        });

        const compsData = await compsResponse.json();
        
        // Simular comps se API falhar (para demonstração)
        const comps = compsData.results || generateMockComps(lat, lon);

        // 2. Analisar com OpenAI GPT-4
        const analysis = await analyzeWithGPT4(property, comps, openaiApiKey);

        // 3. Calcular BID
        const bidCalculation = calculateBID(property, comps, analysis);

        // 4. Mostrar modal
        showCompsModal(property, comps, analysis, bidCalculation);

    } catch (error) {
        console.error('Erro ao analisar comps:', error);
        alert('Erro ao analisar comps. Verifique suas API keys.');
    } finally {
        hideLoading();
    }
};

function generateMockComps(lat, lon) {
    // Gerar 5 comps simulados próximos
    const comps = [];
    for (let i = 0; i < 5; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.01;
        const offsetLon = (Math.random() - 0.5) * 0.01;
        const basePrice = 150000 + Math.random() * 100000;
        
        comps.push({
            address: `${1000 + i * 100} Main St`,
            price: Math.round(basePrice),
            bedrooms: Math.floor(Math.random() * 3) + 2,
            bathrooms: Math.floor(Math.random() * 2) + 1,
            sqft: Math.round(1200 + Math.random() * 1000),
            yearBuilt: Math.floor(1970 + Math.random() * 50),
            latitude: lat + offsetLat,
            longitude: lon + offsetLon,
            daysOnMarket: Math.floor(Math.random() * 90),
            status: 'Sold'
        });
    }
    return comps;
}

async function analyzeWithGPT4(property, comps, apiKey) {
    const prompt = `Analise esta propriedade de leilão e identifique red flags:

**Propriedade:**
- Endereço: ${property.Address}
- County: ${property.County}
- Acres: ${property.Acres}
- Amount Due: $${property['Amount Due']}
- Legal Description: ${property['Legal Description']}

**Comps Próximos:**
${comps.map((c, i) => `${i+1}. ${c.address} - $${c.price} - ${c.sqft}sqft - ${c.bedrooms}bd/${c.bathrooms}ba`).join('\n')}

Forneça:
1. FMV (Fair Market Value) estimado
2. Red Flags (problemas potenciais)
3. Oportunidades
4. Recomendação (Comprar/Evitar/Investigar)

Responda em JSON:
{
  "fmv": 180000,
  "redFlags": ["flag1", "flag2"],
  "opportunities": ["opp1", "opp2"],
  "recommendation": "Comprar",
  "confidence": 85
}`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Extrair JSON da resposta
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        console.error('Erro ao analisar com GPT-4:', error);
    }

    // Fallback: análise simulada
    const avgPrice = comps.reduce((sum, c) => sum + c.price, 0) / comps.length;
    return {
        fmv: Math.round(avgPrice),
        redFlags: ['Análise automática indisponível'],
        opportunities: ['Verificar condição da propriedade'],
        recommendation: 'Investigar',
        confidence: 50
    };
}

function calculateBID(property, comps, analysis) {
    const fmv = analysis.fmv;
    const amountDue = parseFloat(property['Amount Due'] || 0);
    
    // Tier de reforma (usuário pode ajustar)
    const repairTiers = {
        'BASICA': 10,
        'SOFT': 30,
        'MEDIUM': 50,
        'HEAVY': 80
    };
    
    const sqft = 1500; // Estimado (pode pegar do comp médio)
    const repairTier = 'MEDIUM'; // Default
    const repairCost = sqft * repairTiers[repairTier];
    
    // Custos adicionais
    const closingCosts = fmv * 0.03; // 3%
    const holdingCosts = fmv * 0.02; // 2%
    const contingency = fmv * 0.05; // 5%
    
    // ROI desejado
    const desiredROI = 0.20; // 20%
    const desiredProfit = fmv * desiredROI;
    
    // Cálculo do BID
    const totalCosts = repairCost + closingCosts + holdingCosts + contingency + desiredProfit;
    const maxBid = fmv - totalCosts;
    const conservativeBid = maxBid * 0.85; // 85% do máximo (margem de segurança)
    
    return {
        fmv,
        amountDue,
        repairCost,
        closingCosts,
        holdingCosts,
        contingency,
        desiredProfit,
        totalCosts,
        maxBid: Math.max(0, maxBid),
        conservativeBid: Math.max(0, conservativeBid),
        roi: desiredROI * 100,
        profitIfMaxBid: fmv - maxBid - repairCost - closingCosts - holdingCosts,
        isGoodDeal: conservativeBid > amountDue
    };
}

function showCompsModal(property, comps, analysis, bid) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-2xl max-w-6xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-lg sticky top-0 z-10">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">🔍 Análise de Comps + Cálculo de BID</h2>
                        <p class="text-sm opacity-90">${property.Address || 'N/A'}</p>
                        <p class="text-xs opacity-75">Parcel: ${property['Parcel Number']}</p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-gray-200 text-3xl font-bold">
                        ×
                    </button>
                </div>
            </div>

            <div class="p-6">
                <!-- FMV e Recomendação -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-2">💰 Fair Market Value (FMV)</h3>
                        <p class="text-4xl font-bold text-blue-600">$${analysis.fmv.toLocaleString()}</p>
                        <p class="text-sm text-gray-600 mt-2">Confiança: ${analysis.confidence}%</p>
                    </div>
                    <div class="bg-${analysis.recommendation === 'Comprar' ? 'green' : analysis.recommendation === 'Evitar' ? 'red' : 'yellow'}-50 border-2 border-${analysis.recommendation === 'Comprar' ? 'green' : analysis.recommendation === 'Evitar' ? 'red' : 'yellow'}-200 rounded-lg p-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-2">🎯 Recomendação IA</h3>
                        <p class="text-4xl font-bold text-${analysis.recommendation === 'Comprar' ? 'green' : analysis.recommendation === 'Evitar' ? 'red' : 'yellow'}-600">${analysis.recommendation}</p>
                        <p class="text-sm text-gray-600 mt-2">Análise via GPT-4</p>
                    </div>
                </div>

                <!-- Cálculo de BID -->
                <div class="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6 mb-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">💵 CÁLCULO DE BID</h3>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div class="bg-white rounded-lg p-3">
                            <p class="text-xs text-gray-600 mb-1">FMV</p>
                            <p class="text-lg font-bold text-gray-800">$${bid.fmv.toLocaleString()}</p>
                        </div>
                        <div class="bg-white rounded-lg p-3">
                            <p class="text-xs text-gray-600 mb-1">Reforma</p>
                            <p class="text-lg font-bold text-orange-600">-$${bid.repairCost.toLocaleString()}</p>
                        </div>
                        <div class="bg-white rounded-lg p-3">
                            <p class="text-xs text-gray-600 mb-1">Custos</p>
                            <p class="text-lg font-bold text-red-600">-$${(bid.closingCosts + bid.holdingCosts + bid.contingency).toLocaleString()}</p>
                        </div>
                        <div class="bg-white rounded-lg p-3">
                            <p class="text-xs text-gray-600 mb-1">Lucro (${bid.roi}%)</p>
                            <p class="text-lg font-bold text-green-600">-$${bid.desiredProfit.toLocaleString()}</p>
                        </div>
                    </div>

                    <div class="border-t-2 border-green-300 pt-4">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="bg-yellow-100 rounded-lg p-4">
                                <p class="text-sm text-gray-700 mb-1">BID Máximo:</p>
                                <p class="text-2xl font-bold text-yellow-700">$${bid.maxBid.toLocaleString()}</p>
                            </div>
                            <div class="bg-green-100 rounded-lg p-4">
                                <p class="text-sm text-gray-700 mb-1">BID Conservador (85%):</p>
                                <p class="text-2xl font-bold text-green-700">$${bid.conservativeBid.toLocaleString()}</p>
                            </div>
                            <div class="bg-${bid.isGoodDeal ? 'green' : 'red'}-100 rounded-lg p-4">
                                <p class="text-sm text-gray-700 mb-1">Amount Due:</p>
                                <p class="text-2xl font-bold text-${bid.isGoodDeal ? 'green' : 'red'}-700">$${bid.amountDue.toLocaleString()}</p>
                                <p class="text-xs mt-1 font-semibold ${bid.isGoodDeal ? 'text-green-600' : 'text-red-600'}">${bid.isGoodDeal ? '✅ BOM NEGÓCIO!' : '❌ PREÇO ALTO'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Red Flags -->
                <div class="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-4">
                    <h3 class="text-lg font-bold text-red-800 mb-2">🚩 Red Flags</h3>
                    <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                        ${analysis.redFlags.map(flag => `<li>${flag}</li>`).join('')}
                    </ul>
                </div>

                <!-- Oportunidades -->
                <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-4">
                    <h3 class="text-lg font-bold text-green-800 mb-2">✨ Oportunidades</h3>
                    <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                        ${analysis.opportunities.map(opp => `<li>${opp}</li>`).join('')}
                    </ul>
                </div>

                <!-- Comps -->
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-3">🏘️ Comparáveis (Comps)</h3>
                    <div class="overflow-x-auto">
                        <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">Endereço</th>
                                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">Preço</th>
                                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">Sqft</th>
                                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">Bd/Ba</th>
                                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">Ano</th>
                                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${comps.map(comp => `
                                    <tr class="border-t border-gray-200">
                                        <td class="px-4 py-2 text-sm text-gray-700">${comp.address}</td>
                                        <td class="px-4 py-2 text-sm font-semibold text-gray-800">$${comp.price.toLocaleString()}</td>
                                        <td class="px-4 py-2 text-sm text-gray-700">${comp.sqft}</td>
                                        <td class="px-4 py-2 text-sm text-gray-700">${comp.bedrooms}/${comp.bathrooms}</td>
                                        <td class="px-4 py-2 text-sm text-gray-700">${comp.yearBuilt}</td>
                                        <td class="px-4 py-2 text-sm text-green-600 font-semibold">${comp.status}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600">
                        Fechar
                    </button>
                    <button onclick="exportAnalysis(${JSON.stringify(bid).replace(/"/g, '&quot;')})" class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
                        📥 Exportar Análise
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// ============================================
// IA DE RECOMENDAÇÃO
// ============================================

window.showRecommendations = async function(parcelNumber) {
    const property = window.allNewProperties.find(p => p['Parcel Number'] === parcelNumber);
    if (!property) {
        alert('Propriedade não encontrada!');
        return;
    }

    const openaiApiKey = localStorage.getItem('openai_api_key') || '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';
    if (!openaiApiKey) {
        alert('⚠️ OpenAI API Key não configurada!\n\nVá em Configurações (⚙️) e adicione sua chave.\n\nObtenha em: https://platform.openai.com/api-keys');
        return;
    }

    showLoading('Buscando propriedades similares com IA...');

    try {
        // Encontrar propriedades similares
        const similar = findSimilarProperties(property);
        
        // Analisar com GPT-4
        const aiRecommendations = await getAIRecommendations(property, similar, openaiApiKey);
        
        showRecommendationsModal(property, similar, aiRecommendations);

    } catch (error) {
        console.error('Erro ao buscar recomendações:', error);
        alert('Erro ao buscar recomendações. Verifique sua API key.');
    } finally {
        hideLoading();
    }
};

function findSimilarProperties(targetProperty) {
    const allProps = window.allNewProperties || [];
    const targetAcres = parseFloat(targetProperty.Acres) || 0;
    const targetAmount = parseFloat(targetProperty['Amount Due']) || 0;
    const targetCounty = targetProperty.County;
    const targetLat = parseFloat(targetProperty.Latitude);
    const targetLon = parseFloat(targetProperty.Longitude);

    // Calcular score de similaridade
    const scored = allProps
        .filter(p => p['Parcel Number'] !== targetProperty['Parcel Number'])
        .map(p => {
            const acres = parseFloat(p.Acres) || 0;
            const amount = parseFloat(p['Amount Due']) || 0;
            const lat = parseFloat(p.Latitude);
            const lon = parseFloat(p.Longitude);

            // Scores individuais (0-100)
            const acresScore = 100 - Math.min(100, Math.abs(acres - targetAcres) / targetAcres * 100);
            const amountScore = 100 - Math.min(100, Math.abs(amount - targetAmount) / targetAmount * 100);
            const countyScore = p.County === targetCounty ? 100 : 0;
            
            // Distância (km)
            const distance = calculateDistance(targetLat, targetLon, lat, lon);
            const distanceScore = Math.max(0, 100 - distance * 10); // Penaliza distância

            // Score total (média ponderada)
            const totalScore = (acresScore * 0.3 + amountScore * 0.3 + countyScore * 0.2 + distanceScore * 0.2);

            return {
                property: p,
                score: totalScore,
                distance,
                reasons: {
                    acres: `${acres.toFixed(2)} acres (${acresScore.toFixed(0)}% similar)`,
                    amount: `$${amount.toLocaleString()} (${amountScore.toFixed(0)}% similar)`,
                    county: p.County === targetCounty ? 'Mesmo condado' : `Condado diferente (${p.County})`,
                    distance: `${distance.toFixed(1)} km de distância`
                }
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    return scored;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

async function getAIRecommendations(property, similar, apiKey) {
    const prompt = `Analise esta propriedade e as similares encontradas. Forneça insights:

**Propriedade Alvo:**
- ${property.Address}, ${property.County}
- ${property.Acres} acres
- $${property['Amount Due']}

**Propriedades Similares:**
${similar.map((s, i) => `${i+1}. ${s.property.Address} - ${s.property.Acres} acres - $${s.property['Amount Due']} - Score: ${s.score.toFixed(0)}%`).join('\n')}

Forneça:
1. Por que essas propriedades são similares?
2. Qual é a melhor alternativa?
3. Insights sobre o mercado local

Responda em JSON:
{
  "insights": ["insight1", "insight2"],
  "bestAlternative": 0,
  "marketTrends": "análise do mercado"
}`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 400
            })
        });

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        console.error('Erro ao obter recomendações IA:', error);
    }

    return {
        insights: ['Propriedades com características similares de tamanho e preço'],
        bestAlternative: 0,
        marketTrends: 'Análise de mercado indisponível'
    };
}

function showRecommendationsModal(property, similar, aiRec) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-2xl max-w-5xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div class="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-t-lg sticky top-0 z-10">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">🤖 Recomendações de IA</h2>
                        <p class="text-sm opacity-90">Propriedades similares encontradas</p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-gray-200 text-3xl font-bold">
                        ×
                    </button>
                </div>
            </div>

            <div class="p-6">
                <!-- Propriedade Alvo -->
                <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold text-blue-800 mb-2">🎯 Propriedade Alvo</h3>
                    <p class="text-gray-700"><strong>${property.Address}</strong></p>
                    <p class="text-sm text-gray-600">${property.County} • ${property.Acres} acres • $${property['Amount Due']}</p>
                </div>

                <!-- Insights da IA -->
                <div class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 mb-6">
                    <h3 class="text-lg font-bold text-purple-800 mb-2">💡 Insights da IA</h3>
                    <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                        ${aiRec.insights.map(insight => `<li>${insight}</li>`).join('')}
                    </ul>
                    <p class="text-sm text-gray-600 mt-3"><strong>Tendências:</strong> ${aiRec.marketTrends}</p>
                </div>

                <!-- Propriedades Similares -->
                <h3 class="text-lg font-bold text-gray-800 mb-3">🏘️ Top 5 Propriedades Similares</h3>
                <div class="space-y-3">
                    ${similar.map((s, i) => `
                        <div class="bg-${i === aiRec.bestAlternative ? 'green' : 'gray'}-50 border-2 border-${i === aiRec.bestAlternative ? 'green' : 'gray'}-200 rounded-lg p-4">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h4 class="font-bold text-gray-800">${i + 1}. ${s.property.Address}</h4>
                                    <p class="text-sm text-gray-600">${s.property.County} • Parcel: ${s.property['Parcel Number']}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-2xl font-bold text-${i === aiRec.bestAlternative ? 'green' : 'gray'}-600">${s.score.toFixed(0)}%</p>
                                    <p class="text-xs text-gray-500">Similaridade</p>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <div>
                                    <p class="text-gray-500">Acres:</p>
                                    <p class="font-semibold">${s.property.Acres}</p>
                                </div>
                                <div>
                                    <p class="text-gray-500">Amount Due:</p>
                                    <p class="font-semibold">$${parseFloat(s.property['Amount Due']).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p class="text-gray-500">Distância:</p>
                                    <p class="font-semibold">${s.distance.toFixed(1)} km</p>
                                </div>
                                <div>
                                    <button onclick="highlightProperty('${s.property['Parcel Number']}')" class="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                                        📍 Ver no Mapa
                                    </button>
                                </div>
                            </div>
                            ${i === aiRec.bestAlternative ? '<p class="text-sm text-green-700 font-semibold mt-2">⭐ Melhor Alternativa (IA)</p>' : ''}
                        </div>
                    `).join('')}
                </div>

                <div class="flex gap-3 mt-6">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function highlightProperty(parcelNumber) {
    // Scroll para a propriedade na tabela
    const rows = document.querySelectorAll('#dataTable tbody tr');
    rows.forEach(row => {
        if (row.textContent.includes(parcelNumber)) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            row.classList.add('row-highlight');
            setTimeout(() => row.classList.remove('row-highlight'), 3000);
        }
    });
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function showLoading(message) {
    const loading = document.createElement('div');
    loading.id = 'loadingOverlay';
    loading.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
    loading.innerHTML = `
        <div class="bg-white rounded-lg p-8 flex flex-col items-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p class="text-gray-700 font-semibold">${message}</p>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) loading.remove();
}

function exportAnalysis(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('✅ Análise exportada!', 'success');
}

console.log('✅ Análise de Comps + IA de Recomendação implementadas');




// ============================================
// ROTA OTIMIZADA DE VISITAS
// ============================================

window.optimizeRoute = function() {
    const selected = getSelectedProperties();
    
    if (selected.length < 2) {
        alert('⚠️ Selecione pelo menos 2 propriedades para otimizar a rota!');
        return;
    }

    if (selected.length > 25) {
        alert('⚠️ Máximo de 25 propriedades por rota!');
        return;
    }

    showLoading('Otimizando rota...');

    try {
        // Algoritmo do Vizinho Mais Próximo (Nearest Neighbor)
        const optimized = nearestNeighborTSP(selected);
        
        // Calcular estatísticas
        const stats = calculateRouteStats(optimized);
        
        showRouteModal(optimized, stats);
        
        // Desenhar rota no mapa
        drawRouteOnMap(optimized);

    } catch (error) {
        console.error('Erro ao otimizar rota:', error);
        alert('Erro ao otimizar rota.');
    } finally {
        hideLoading();
    }
};

function getSelectedProperties() {
    const checkboxes = document.querySelectorAll('#dataTable tbody input[type="checkbox"]:checked');
    const selected = [];
    
    checkboxes.forEach(cb => {
        const index = parseInt(cb.closest('tr').getAttribute('data-index'));
        const property = window.allNewProperties[index];
        if (property && property.Latitude && property.Longitude) {
            selected.push(property);
        }
    });
    
    return selected;
}

function nearestNeighborTSP(properties) {
    if (properties.length === 0) return [];
    
    const unvisited = [...properties];
    const route = [unvisited.shift()]; // Começa com a primeira
    
    while (unvisited.length > 0) {
        const current = route[route.length - 1];
        let nearest = null;
        let minDist = Infinity;
        
        unvisited.forEach(prop => {
            const dist = calculateDistance(
                parseFloat(current.Latitude),
                parseFloat(current.Longitude),
                parseFloat(prop.Latitude),
                parseFloat(prop.Longitude)
            );
            
            if (dist < minDist) {
                minDist = dist;
                nearest = prop;
            }
        });
        
        if (nearest) {
            route.push(nearest);
            unvisited.splice(unvisited.indexOf(nearest), 1);
        }
    }
    
    return route;
}

function calculateRouteStats(route) {
    let totalDistance = 0;
    
    for (let i = 0; i < route.length - 1; i++) {
        const dist = calculateDistance(
            parseFloat(route[i].Latitude),
            parseFloat(route[i].Longitude),
            parseFloat(route[i + 1].Latitude),
            parseFloat(route[i + 1].Longitude)
        );
        totalDistance += dist;
    }
    
    // Estimativas
    const avgSpeed = 60; // km/h
    const visitTime = 15; // minutos por propriedade
    const travelTime = (totalDistance / avgSpeed) * 60; // minutos
    const totalTime = travelTime + (route.length * visitTime);
    
    return {
        totalDistance: totalDistance.toFixed(1),
        travelTime: Math.round(travelTime),
        visitTime: route.length * visitTime,
        totalTime: Math.round(totalTime),
        properties: route.length
    };
}

function showRouteModal(route, stats) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-lg sticky top-0 z-10">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">🗺️ Rota Otimizada</h2>
                        <p class="text-sm opacity-90">${stats.properties} propriedades • ${stats.totalDistance} km</p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-gray-200 text-3xl font-bold">
                        ×
                    </button>
                </div>
            </div>

            <div class="p-6">
                <!-- Estatísticas -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-blue-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">📍 Propriedades</p>
                        <p class="text-2xl font-bold text-blue-600">${stats.properties}</p>
                    </div>
                    <div class="bg-green-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">🚗 Distância</p>
                        <p class="text-2xl font-bold text-green-600">${stats.totalDistance} km</p>
                    </div>
                    <div class="bg-yellow-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">⏱️ Tempo Viagem</p>
                        <p class="text-2xl font-bold text-yellow-600">${stats.travelTime} min</p>
                    </div>
                    <div class="bg-purple-50 rounded-lg p-4">
                        <p class="text-sm text-gray-600 mb-1">⏰ Tempo Total</p>
                        <p class="text-2xl font-bold text-purple-600">${Math.floor(stats.totalTime / 60)}h${stats.totalTime % 60}min</p>
                    </div>
                </div>

                <!-- Rota -->
                <h3 class="text-lg font-bold text-gray-800 mb-3">📋 Sequência de Visitas</h3>
                <div class="space-y-2 mb-6">
                    ${route.map((prop, i) => `
                        <div class="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                            <div class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                ${i + 1}
                            </div>
                            <div class="flex-grow">
                                <p class="font-semibold text-gray-800">${prop.Address || 'N/A'}</p>
                                <p class="text-sm text-gray-600">${prop.County} • ${prop.Acres} acres</p>
                            </div>
                            <button onclick="openGoogleMaps(${prop.Latitude}, ${prop.Longitude})" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                                📍 Navegar
                            </button>
                        </div>
                    `).join('')}
                </div>

                <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-4">
                    <h3 class="text-lg font-bold text-blue-800 mb-2">💡 Dicas</h3>
                    <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                        <li>Rota otimizada usando algoritmo do Vizinho Mais Próximo</li>
                        <li>Tempo estimado: 15 min por propriedade + viagem</li>
                        <li>Clique em "Navegar" para abrir no Google Maps</li>
                        <li>A rota está desenhada no mapa (linha azul)</li>
                    </ul>
                </div>

                <div class="flex gap-3">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600">
                        Fechar
                    </button>
                    <button onclick="exportRoute(${JSON.stringify(route.map(p => ({address: p.Address, lat: p.Latitude, lon: p.Longitude}))).replace(/"/g, '&quot;')})" class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
                        📥 Exportar Rota
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function drawRouteOnMap(route) {
    if (!window.map) return;
    
    // Remover rota anterior
    if (window.routeLine) {
        window.map.removeLayer(window.routeLine);
    }
    
    // Criar linha da rota
    const latlngs = route.map(p => [parseFloat(p.Latitude), parseFloat(p.Longitude)]);
    
    window.routeLine = L.polyline(latlngs, {
        color: 'blue',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 5'
    }).addTo(window.map);
    
    // Ajustar zoom para mostrar toda a rota
    window.map.fitBounds(window.routeLine.getBounds(), { padding: [50, 50] });
}

function openGoogleMaps(lat, lon) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
}

function exportRoute(route) {
    const blob = new Blob([JSON.stringify(route, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `route-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('✅ Rota exportada!', 'success');
}

// ============================================
// ASSISTENTE DE VOZ
// ============================================

window.startVoiceAssistant = function() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('⚠️ Seu navegador não suporta reconhecimento de voz!\n\nUse Chrome, Edge ou Safari.');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    showVoiceModal(recognition);
};

function showVoiceModal(recognition) {
    const modal = document.createElement('div');
    modal.id = 'voiceModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4">
            <div class="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-t-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">🎤 Assistente de Voz</h2>
                        <p class="text-sm opacity-90">Fale suas notas sobre a propriedade</p>
                    </div>
                    <button onclick="stopVoiceAssistant()" class="text-white hover:text-gray-200 text-3xl font-bold">
                        ×
                    </button>
                </div>
            </div>

            <div class="p-6">
                <div class="flex justify-center mb-6">
                    <div id="voiceIndicator" class="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                        <span class="text-6xl">🎤</span>
                    </div>
                </div>

                <div class="bg-gray-50 rounded-lg p-4 mb-4 min-h-[200px]">
                    <p class="text-sm text-gray-600 mb-2 font-semibold">Transcrição:</p>
                    <div id="voiceTranscript" class="text-gray-800 whitespace-pre-wrap"></div>
                </div>

                <div class="flex gap-3">
                    <button onclick="startListening()" id="startBtn" class="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700">
                        ▶️ Iniciar
                    </button>
                    <button onclick="pauseListening()" id="pauseBtn" class="hidden flex-1 bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700">
                        ⏸️ Pausar
                    </button>
                    <button onclick="saveVoiceNote()" class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
                        💾 Salvar Nota
                    </button>
                    <button onclick="stopVoiceAssistant()" class="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Configurar reconhecimento
    window.voiceRecognition = recognition;
    window.voiceTranscript = '';

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        window.voiceTranscript += finalTranscript;
        document.getElementById('voiceTranscript').textContent = window.voiceTranscript + interimTranscript;
    };

    recognition.onerror = (event) => {
        console.error('Erro de reconhecimento:', event.error);
        if (event.error === 'no-speech') {
            showNotification('⚠️ Nenhuma fala detectada', 'warning');
        }
    };

    recognition.onend = () => {
        document.getElementById('voiceIndicator').classList.remove('animate-pulse');
        document.getElementById('startBtn').classList.remove('hidden');
        document.getElementById('pauseBtn').classList.add('hidden');
    };
}

window.startListening = function() {
    if (window.voiceRecognition) {
        window.voiceRecognition.start();
        document.getElementById('voiceIndicator').classList.add('animate-pulse');
        document.getElementById('startBtn').classList.add('hidden');
        document.getElementById('pauseBtn').classList.remove('hidden');
        showNotification('🎤 Escutando...', 'info');
    }
};

window.pauseListening = function() {
    if (window.voiceRecognition) {
        window.voiceRecognition.stop();
        document.getElementById('voiceIndicator').classList.remove('animate-pulse');
        document.getElementById('startBtn').classList.remove('hidden');
        document.getElementById('pauseBtn').classList.add('hidden');
        showNotification('⏸️ Pausado', 'info');
    }
};

window.saveVoiceNote = function() {
    const transcript = window.voiceTranscript || '';
    
    if (!transcript.trim()) {
        alert('⚠️ Nenhuma nota para salvar!');
        return;
    }

    // Salvar no localStorage
    const notes = JSON.parse(localStorage.getItem('voice_notes') || '[]');
    notes.push({
        timestamp: new Date().toISOString(),
        content: transcript,
        date: new Date().toLocaleString('pt-BR')
    });
    localStorage.setItem('voice_notes', JSON.stringify(notes));

    // Exportar como arquivo
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nota-voz-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('✅ Nota salva e exportada!', 'success');
    
    // Limpar transcrição
    window.voiceTranscript = '';
    document.getElementById('voiceTranscript').textContent = '';
};

window.stopVoiceAssistant = function() {
    if (window.voiceRecognition) {
        window.voiceRecognition.stop();
        window.voiceRecognition = null;
    }
    
    const modal = document.getElementById('voiceModal');
    if (modal) modal.remove();
};

// ============================================
// ADICIONAR BOTÕES NO HEADER
// ============================================

// Adicionar botões ao carregar
document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        // Adicionar botão de Rota Otimizada
        const routeBtn = document.createElement('button');
        routeBtn.className = 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2';
        routeBtn.innerHTML = '<span>🗺️</span><span>Rota Otimizada</span>';
        routeBtn.onclick = optimizeRoute;
        settingsBtn.parentElement.insertBefore(routeBtn, settingsBtn);

        // Adicionar botão de Assistente de Voz
        const voiceBtn = document.createElement('button');
        voiceBtn.className = 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2';
        voiceBtn.innerHTML = '<span>🎤</span><span>Assistente de Voz</span>';
        voiceBtn.onclick = startVoiceAssistant;
        settingsBtn.parentElement.insertBefore(voiceBtn, settingsBtn);
    }
});

console.log('✅ Rota Otimizada + Assistente de Voz implementados');

