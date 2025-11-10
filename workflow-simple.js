// ============================================
// GT LANDS DASHBOARD V21 - WORKFLOW COM CARROSSEL
// Fluxo: Importar → Filtrar/Deletar → Realizar Pesquisas → Análises com Imagens
// ============================================

console.log('🚀 Workflow V21 carregando...');

// Conectar botão "Realizar Pesquisas" (já existe no HTML)
setTimeout(() => {
    const researchBtn = document.getElementById('startResearchBtn');
    
    if (researchBtn) {
        researchBtn.onclick = startResearch;
        console.log('✅ Botão "Realizar Pesquisas" conectado');
    } else {
        console.error('❌ Botão "Realizar Pesquisas" não encontrado');
    }
}, 1000);

// Função para iniciar pesquisas
function startResearch() {
    alert('✅ BOTÃO FUNCIONANDO! Função startResearch() foi executada!');
    console.log('🔍 startResearch() chamado!');
    console.log('window.allNewProperties:', window.allNewProperties);
    console.log('Quantidade de propriedades:', window.allNewProperties ? window.allNewProperties.length : 0);
    
    // Verificar se existem propriedades carregadas
    if (!window.allNewProperties || window.allNewProperties.length === 0) {
        console.error('❌ Nenhuma propriedade disponível!');
        alert('⚠️ Nenhuma propriedade disponível!\n\nImporte um arquivo CSV primeiro.');
        return;
    }
    
    console.log('✅ Propriedades encontradas:', window.allNewProperties.length);
    
    // Pegar propriedades SELECIONADAS (checkboxes marcados)
    const checkboxes = document.querySelectorAll('input.row-checkbox:checked');
    console.log('📦 Checkboxes marcados:', checkboxes.length);
    
    const selectedProperties = [];
    
    checkboxes.forEach(cb => {
        const index = parseInt(cb.dataset.index);
        console.log('  - Checkbox index:', index, 'Propriedade:', window.allNewProperties[index]);
        if (!isNaN(index) && window.allNewProperties[index]) {
            selectedProperties.push(window.allNewProperties[index]);
        }
    });
    
    console.log('✅ Propriedades selecionadas:', selectedProperties.length);
    console.log('Propriedades:', selectedProperties);
    
    if (selectedProperties.length === 0) {
        console.error('❌ Nenhuma propriedade selecionada!');
        alert('⚠️ Selecione pelo menos uma propriedade!\n\nMarque os checkboxes das propriedades que deseja analisar.');
        return;
    }
    
    console.log('🎉 Abrindo tela de pesquisas...');
    
    try {
        // Limpar dados para evitar referências circulares
        const cleanProperties = selectedProperties.map(prop => {
            const clean = {...prop};
            delete clean.marker; // Remover marker do Leaflet
            delete clean._popup; // Remover popup
            return clean;
        });
        
        // Salvar no localStorage para persistência
        localStorage.setItem('research_properties', JSON.stringify(cleanProperties));
        
        console.log('📦 Dados salvos no localStorage');
        console.log('🚀 Chamando showResearchScreen()...');
        
        // Abrir tela de pesquisas
        showResearchScreen(selectedProperties);
        
        console.log('✅ showResearchScreen() executado com sucesso!');
    } catch (error) {
        console.error('❌ ERRO ao abrir tela de pesquisas:', error);
        alert('❌ ERRO: ' + error.message + '\n\nVerifique o console para mais detalhes.');
    }
}

// Variável global para controlar imagem atual
let currentImageIndex = 0;

// Função para mostrar tela de pesquisas
function showResearchScreen(properties) {
    const modal = document.createElement('div');
    modal.id = 'researchScreen';
    modal.className = 'fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800 z-[9999] overflow-y-auto';
    
    modal.innerHTML = `
        <div class="min-h-screen p-4 md:p-6">
            <!-- Header -->
            <div class="bg-white rounded-lg shadow-2xl p-4 md:p-6 mb-4 md:mb-6">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 class="text-2xl md:text-3xl font-bold text-gray-800">🔍 ANÁLISE DE PROPRIEDADES</h1>
                        <p class="text-gray-600 mt-2">${properties.length} propriedade${properties.length > 1 ? 's' : ''} selecionada${properties.length > 1 ? 's' : ''} para pesquisa</p>
                    </div>
                    <div class="flex flex-wrap gap-2 md:gap-3">
                        <button onclick="exportResearch()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm md:text-base">
                            📥 Exportar
                        </button>
                        <button onclick="closeResearchScreen()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm md:text-base">
                            ← Voltar
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Lista de Propriedades -->
            <div class="space-y-4">
                ${properties.map((prop, idx) => renderResearchCard(prop, idx, properties.length)).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function renderResearchCard(prop, idx, total) {
    // Verificar se já tem dados de análise salvos
    const savedData = JSON.parse(localStorage.getItem('research_properties') || '[]');
    const savedProp = savedData.find(p => p['Parcel Number'] === prop['Parcel Number']);
    const passedElimination = savedProp?._passedElimination || false;
    
    const lat = parseFloat(prop.Latitude);
    const lon = parseFloat(prop.Longitude);
    // Google Maps API Key hardcoded - sempre disponível
    const gmapsKey = 'AIzaSyBr4UtMOvkhX6LxYOw89zjBkOYNO-_ykag';
    
    return `
        <div class="bg-white rounded-lg shadow-xl p-4 md:p-6">
            <!-- Header da Propriedade -->
            <div class="border-b border-gray-200 pb-4 mb-4">
                <div class="flex justify-between items-start gap-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                                ${idx + 1} de ${total}
                            </span>
                        </div>
                        <h2 class="text-lg md:text-xl font-bold text-gray-800 mb-2">${prop.Address || 'N/A'}</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs md:text-sm text-gray-600">
                            <div><span class="font-semibold">Parcel:</span> ${prop['Parcel Number']}</div>
                            <div><span class="font-semibold">County:</span> ${prop.County}</div>
                            <div><span class="font-semibold">Acres:</span> ${prop.Acres}</div>
                            <div><span class="font-semibold">Amount:</span> $${parseFloat(prop['Amount Due'] || 0).toLocaleString()}</div>
                        </div>
                    </div>
                    <button onclick="removeFromResearch('${prop['Parcel Number']}')" 
                            class="px-3 py-1 bg-red-600 text-white rounded text-xs md:text-sm hover:bg-red-700 whitespace-nowrap">
                        🗑️ Remover
                    </button>
                </div>
            </div>
            
            <!-- Carrossel de Imagens -->
            <div class="mb-6">
                <div class="relative bg-gray-100 rounded-lg overflow-hidden" style="height: 400px;">
                    ${gmapsKey ? `
                        <!-- Imagem Street View -->
                        <img id="img-street-${idx}" 
                             src="https://maps.googleapis.com/maps/api/streetview?size=800x400&location=${lat},${lon}&key=${gmapsKey}" 
                             alt="Street View"
                             class="w-full h-full object-cover absolute inset-0 transition-opacity duration-300"
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22400%22%3E%3Crect fill=%22%23ddd%22 width=%22800%22 height=%22400%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2224%22%3EImagem não disponível%3C/text%3E%3C/svg%3E'">
                        
                        <!-- Imagem Satellite -->
                        <img id="img-sat-${idx}" 
                             src="https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=18&size=800x400&maptype=satellite&key=${gmapsKey}" 
                             alt="Satellite View"
                             class="w-full h-full object-cover absolute inset-0 transition-opacity duration-300 opacity-0"
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22400%22%3E%3Crect fill=%22%23ddd%22 width=%22800%22 height=%22400%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2224%22%3EImagem não disponível%3C/text%3E%3C/svg%3E'">
                        
                        <!-- Controles do Carrossel -->
                        <button onclick="prevImage(${idx})" 
                                class="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 md:p-3 rounded-full transition-all">
                            <svg class="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                            </svg>
                        </button>
                        <button onclick="nextImage(${idx})" 
                                class="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 md:p-3 rounded-full transition-all">
                            <svg class="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
                        
                        <!-- Indicador -->
                        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 px-4 py-2 rounded-full">
                            <span id="indicator-${idx}" class="text-white text-xs md:text-sm font-semibold">Street View</span>
                        </div>
                    ` : `
                        <div class="flex items-center justify-center h-full">
                            <div class="text-center p-4">
                                <p class="text-gray-600 mb-4">Configure a Google Maps API Key para ver imagens</p>
                                <button onclick="window.showSettingsModal()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    ⚙️ Configurar
                                </button>
                            </div>
                        </div>
                    `}
                </div>
            </div>
            
            <!-- GRUPO 1: ELIMINAÇÃO RÁPIDA -->
            <div class="mb-6">
                <h3 class="text-base md:text-lg font-bold text-gray-700 mb-3 flex items-center gap-2 flex-wrap">
                    <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs md:text-sm">GRUPO 1</span>
                    <span class="text-sm md:text-base">ELIMINAÇÃO RÁPIDA</span>
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                    <button onclick="analyzeCrime('${prop['Parcel Number']}')" 
                            class="flex flex-col items-center justify-center p-3 md:p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg"
                            title="Análise de criminalidade">
                        <span class="text-2xl md:text-3xl mb-1 md:mb-2">🚨</span>
                        <span class="font-semibold text-xs md:text-sm">Crime</span>
                    </button>
                    <button onclick="analyzeDisasters('${prop['Parcel Number']}')" 
                            class="flex flex-col items-center justify-center p-3 md:p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all transform hover:scale-105 shadow-lg"
                            title="Histórico de desastres">
                        <span class="text-2xl md:text-3xl mb-1 md:mb-2">🌪️</span>
                        <span class="font-semibold text-xs md:text-sm">Desastres</span>
                    </button>
                    <button onclick="analyzeZoning('${prop['Parcel Number']}')" 
                            class="flex flex-col items-center justify-center p-3 md:p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg"
                            title="Análise de zoneamento">
                        <span class="text-2xl md:text-3xl mb-1 md:mb-2">📋</span>
                        <span class="font-semibold text-xs md:text-sm">Zoneamento</span>
                    </button>
                    <button onclick="analyzeImages('${prop['Parcel Number']}')" 
                            class="flex flex-col items-center justify-center p-3 md:p-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all transform hover:scale-105 shadow-lg"
                            title="Análise de imagens com IA">
                        <span class="text-2xl md:text-3xl mb-1 md:mb-2">📸</span>
                        <span class="font-semibold text-xs md:text-sm">Imagens IA</span>
                    </button>
                </div>
            </div>
            
            <!-- Checkpoint -->
            <div class="mb-6 bg-gray-50 rounded-lg p-3 md:p-4">
                <label class="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" 
                           ${passedElimination ? 'checked' : ''} 
                           onchange="togglePassedElimination('${prop['Parcel Number']}')" 
                           class="w-5 h-5 md:w-6 md:h-6 text-green-600 rounded focus:ring-2 focus:ring-green-500">
                    <span class="font-bold text-base md:text-lg ${passedElimination ? 'text-green-600' : 'text-gray-600'}">
                        ✅ Passou na Eliminação (libera Grupo 2)
                    </span>
                </label>
            </div>
            
            <!-- GRUPO 2: ANÁLISE PROFUNDA -->
            <div class="${passedElimination ? '' : 'opacity-50 pointer-events-none'}">
                <h3 class="text-base md:text-lg font-bold text-gray-700 mb-3 flex items-center gap-2 flex-wrap">
                    <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs md:text-sm">GRUPO 2</span>
                    <span class="text-sm md:text-base">ANÁLISE PROFUNDA</span>
                    ${passedElimination ? '' : '<span class="text-red-600 text-xs md:text-sm">(🔒 Bloqueado)</span>'}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                    <button onclick="analyzeComps('${prop['Parcel Number']}')" 
                            class="flex flex-col items-center justify-center p-3 md:p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                            title="Análise de comps + Cálculo de BID">
                        <span class="text-2xl md:text-3xl mb-1 md:mb-2">🔍</span>
                        <span class="font-semibold text-xs md:text-sm">Comps + BID</span>
                    </button>
                    <button onclick="analyzeRecommendations('${prop['Parcel Number']}')" 
                            class="flex flex-col items-center justify-center p-3 md:p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg"
                            title="IA recomenda propriedades similares">
                        <span class="text-2xl md:text-3xl mb-1 md:mb-2">🤖</span>
                        <span class="font-semibold text-xs md:text-sm">IA Recomenda</span>
                    </button>
                    <button onclick="openSimulator('${prop['Parcel Number']}')" 
                            class="flex flex-col items-center justify-center p-3 md:p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
                            title="Simulador de cenários">
                        <span class="text-2xl md:text-3xl mb-1 md:mb-2">🎮</span>
                        <span class="font-semibold text-xs md:text-sm">Simulador</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Funções do carrossel
window.prevImage = function(idx) {
    const streetImg = document.getElementById(`img-street-${idx}`);
    const satImg = document.getElementById(`img-sat-${idx}`);
    const indicator = document.getElementById(`indicator-${idx}`);
    
    if (satImg.style.opacity === '1' || satImg.classList.contains('opacity-100')) {
        // Mostrar Street View
        streetImg.style.opacity = '1';
        satImg.style.opacity = '0';
        indicator.textContent = 'Street View';
    }
};

window.nextImage = function(idx) {
    const streetImg = document.getElementById(`img-street-${idx}`);
    const satImg = document.getElementById(`img-sat-${idx}`);
    const indicator = document.getElementById(`indicator-${idx}`);
    
    if (streetImg.style.opacity === '1' || !satImg.style.opacity) {
        // Mostrar Satellite
        streetImg.style.opacity = '0';
        satImg.style.opacity = '1';
        indicator.textContent = 'Satellite View';
    }
};

// Função para fechar tela de pesquisas
window.closeResearchScreen = function() {
    const screen = document.getElementById('researchScreen');
    if (screen) {
        if (confirm('Tem certeza que deseja voltar? O progresso das análises será salvo.')) {
            screen.remove();
        }
    }
};

// Função para alternar "Passou na Eliminação"
window.togglePassedElimination = function(parcelNumber) {
    const savedData = JSON.parse(localStorage.getItem('research_properties') || '[]');
    const propIndex = savedData.findIndex(p => p['Parcel Number'] === parcelNumber);
    
    if (propIndex !== -1) {
        savedData[propIndex]._passedElimination = !savedData[propIndex]._passedElimination;
        localStorage.setItem('research_properties', JSON.stringify(savedData));
        
        // Recarregar tela
        const screen = document.getElementById('researchScreen');
        if (screen) {
            screen.remove();
            showResearchScreen(savedData);
        }
    }
};

// Função para remover propriedade da pesquisa
window.removeFromResearch = function(parcelNumber) {
    if (confirm('Remover esta propriedade da pesquisa?')) {
        let savedData = JSON.parse(localStorage.getItem('research_properties') || '[]');
        savedData = savedData.filter(p => p['Parcel Number'] !== parcelNumber);
        localStorage.setItem('research_properties', JSON.stringify(savedData));
        
        // Recarregar tela
        const screen = document.getElementById('researchScreen');
        if (screen) {
            screen.remove();
            if (savedData.length > 0) {
                showResearchScreen(savedData);
            } else {
                alert('✅ Todas as propriedades foram removidas!');
            }
        }
    }
};

// Função para exportar análises
window.exportResearch = function() {
    const savedData = JSON.parse(localStorage.getItem('research_properties') || '[]');
    
    if (savedData.length === 0) {
        alert('⚠️ Nenhuma propriedade para exportar!');
        return;
    }
    
    const blob = new Blob([JSON.stringify(savedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analises-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Análises exportadas!');
};

console.log('✅ Workflow V21 carregado!');

