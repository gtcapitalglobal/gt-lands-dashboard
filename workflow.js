// ============================================
// GT LANDS DASHBOARD V20 - WORKFLOW SYSTEM
// Sistema de Fluxo de Análise em 2 Etapas
// ============================================

// Armazenamento de propriedades na lista de análise
window.analysisListProperties = [];

// ============================================
// INICIALIZAÇÃO DO SISTEMA DE ABAS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeWorkflowSystem();
});

function initializeWorkflowSystem() {
    // Carregar dados salvos
    loadAnalysisListFromStorage();
    
    // Observar quando a seção de propriedades aparecer
    waitForPropertySection();
    
    console.log('✅ Workflow System inicializado');
}

function waitForPropertySection() {
    // Tentar encontrar a seção de propriedades a cada 500ms
    const interval = setInterval(() => {
        const propertySection = document.querySelector('.bg-white.rounded-lg.p-6');
        const dataTable = document.getElementById('dataTable');
        
        if (propertySection && dataTable && !document.getElementById('workflowTabs')) {
            clearInterval(interval);
            
            // Criar estrutura de abas
            createTabsStructure();
            
            // Inicializar eventos
            initializeTabEvents();
            initializeAnalysisListButtons();
            
            console.log('✅ Abas criadas após carregamento da tabela');
        }
    }, 500);
    
    // Parar de tentar após 30 segundos
    setTimeout(() => clearInterval(interval), 30000);
}

// ============================================
// CRIAR ESTRUTURA DE ABAS
// ============================================

function createTabsStructure() {
    // Encontrar a seção de propriedades (a que contém a tabela)
    const allSections = document.querySelectorAll('.bg-white.rounded-lg');
    let propertySection = null;
    
    allSections.forEach(section => {
        if (section.querySelector('#dataTable')) {
            propertySection = section;
        }
    });
    
    if (!propertySection) {
        console.error('Seção de propriedades não encontrada');
        return;
    }
    
    // Criar sistema de abas
    const tabsHTML = `
        <div id="workflowTabs" class="bg-white rounded-lg shadow-lg mb-6">
            <div class="flex border-b border-gray-200">
                <button id="tabAllProperties" class="flex-1 px-6 py-4 text-center font-semibold border-b-4 border-blue-600 text-blue-600 transition-colors">
                    📋 Todas as Propriedades <span id="allPropertiesCount" class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">0</span>
                </button>
                <button id="tabAnalysisList" class="flex-1 px-6 py-4 text-center font-semibold border-b-4 border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-colors">
                    ✅ Lista de Análise <span id="analysisListCount" class="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">0</span>
                </button>
            </div>
        </div>
    `;
    
    // Inserir abas antes da seção de propriedades
    propertySection.insertAdjacentHTML('beforebegin', tabsHTML);
    
    // Adicionar ID à seção de todas as propriedades
    propertySection.id = 'allPropertiesSection';
    
    // Criar seção da Lista de Análise
    createAnalysisListSection(propertySection);
    
    // Modificar botões da seção "Todas as Propriedades"
    modifyAllPropertiesButtons();
}

function createAnalysisListSection(afterElement) {
    const analysisListHTML = `
        <div id="analysisListSection" class="bg-white rounded-lg shadow-lg p-6 hidden">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">✅ Lista de Análise</h2>
                <div class="flex gap-3">
                    <button id="exportAnalysesBtn" class="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                        📥 Exportar Análises
                    </button>
                    <button id="clearAnalysisListBtn" class="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
                        🗑️ Limpar Lista
                    </button>
                </div>
            </div>
            
            <div id="analysisListContainer" class="space-y-4">
                <p class="text-gray-500 text-center py-8">Nenhuma propriedade na lista de análise.</p>
            </div>
        </div>
    `;
    
    afterElement.insertAdjacentHTML('afterend', analysisListHTML);
}

function modifyAllPropertiesButtons() {
    // Encontrar área de botões
    const buttonsArea = document.querySelector('#deleteFilteredBtn')?.parentElement;
    
    if (buttonsArea) {
        // Adicionar botão "Adicionar à Lista de Análise"
        const addToAnalysisBtn = document.createElement('button');
        addToAnalysisBtn.id = 'addToAnalysisBtn';
        addToAnalysisBtn.className = 'px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors';
        addToAnalysisBtn.innerHTML = '✅ Adicionar à Lista de Análise';
        addToAnalysisBtn.onclick = addSelectedToAnalysisList;
        
        buttonsArea.insertBefore(addToAnalysisBtn, buttonsArea.firstChild);
    }
    
    // Remover coluna "Análise" da tabela de todas as propriedades
    removeAnalysisColumnFromAllProperties();
}

function removeAnalysisColumnFromAllProperties() {
    // Remover coluna de análise após a tabela ser populada
    setTimeout(() => {
        // Remover coluna "Análise" do header
        const analysisHeader = Array.from(document.querySelectorAll('#dataTable thead th'))
            .find(th => th.textContent.includes('Análise'));
        if (analysisHeader) {
            analysisHeader.remove();
        }
        
        // Remover células de análise de todas as linhas
        document.querySelectorAll('#dataTable tbody tr').forEach(row => {
            const analysisCells = row.querySelectorAll('td');
            if (analysisCells.length > 0) {
                // Remove última célula (Análise)
                analysisCells[analysisCells.length - 1]?.remove();
            }
        });
    }, 1000);
}

// ============================================
// EVENTOS DAS ABAS
// ============================================

function initializeTabEvents() {
    const tabAll = document.getElementById('tabAllProperties');
    const tabAnalysis = document.getElementById('tabAnalysisList');
    
    if (tabAll) {
        tabAll.addEventListener('click', () => switchTab('all'));
    }
    
    if (tabAnalysis) {
        tabAnalysis.addEventListener('click', () => switchTab('analysis'));
    }
}

function switchTab(tab) {
    const tabAll = document.getElementById('tabAllProperties');
    const tabAnalysis = document.getElementById('tabAnalysisList');
    const sectionAll = document.getElementById('allPropertiesSection');
    const sectionAnalysis = document.getElementById('analysisListSection');
    
    if (tab === 'all') {
        // Ativar aba "Todas"
        tabAll.className = 'flex-1 px-6 py-4 text-center font-semibold border-b-4 border-blue-600 text-blue-600 transition-colors';
        tabAnalysis.className = 'flex-1 px-6 py-4 text-center font-semibold border-b-4 border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-colors';
        
        // Mostrar seção "Todas"
        sectionAll.classList.remove('hidden');
        sectionAnalysis.classList.add('hidden');
    } else {
        // Ativar aba "Lista de Análise"
        tabAll.className = 'flex-1 px-6 py-4 text-center font-semibold border-b-4 border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-colors';
        tabAnalysis.className = 'flex-1 px-6 py-4 text-center font-semibold border-b-4 border-green-600 text-green-600 transition-colors';
        
        // Mostrar seção "Lista de Análise"
        sectionAll.classList.add('hidden');
        sectionAnalysis.classList.remove('hidden');
        
        // Atualizar lista
        renderAnalysisList();
    }
}

// ============================================
// ADICIONAR À LISTA DE ANÁLISE
// ============================================

function addSelectedToAnalysisList() {
    const checkboxes = document.querySelectorAll('#dataTable tbody input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        alert('⚠️ Selecione pelo menos uma propriedade!');
        return;
    }
    
    let added = 0;
    
    checkboxes.forEach(cb => {
        const row = cb.closest('tr');
        const index = parseInt(row.getAttribute('data-index'));
        const property = window.allNewProperties[index];
        
        if (property) {
            // Verificar se já está na lista
            const exists = window.analysisListProperties.some(p => 
                p['Parcel Number'] === property['Parcel Number']
            );
            
            if (!exists) {
                // Adicionar à lista com status inicial
                window.analysisListProperties.push({
                    ...property,
                    _workflow: {
                        addedAt: new Date().toISOString(),
                        passedElimination: false,
                        analyses: {
                            crime: null,
                            disasters: null,
                            zoning: null,
                            images: null,
                            comps: null,
                            recommendations: null,
                            simulator: null
                        }
                    }
                });
                added++;
            }
        }
    });
    
    if (added > 0) {
        // Salvar no localStorage
        saveAnalysisListToStorage();
        
        // Atualizar contadores
        updateCounts();
        
        // Desmarcar checkboxes
        checkboxes.forEach(cb => cb.checked = false);
        
        // Mostrar notificação
        showNotification(`✅ ${added} propriedade(s) adicionada(s) à Lista de Análise!`, 'success');
        
        // Mudar para aba de análise
        switchTab('analysis');
    } else {
        alert('⚠️ Todas as propriedades selecionadas já estão na Lista de Análise!');
    }
}

// ============================================
// RENDERIZAR LISTA DE ANÁLISE
// ============================================

function renderAnalysisList() {
    const container = document.getElementById('analysisListContainer');
    
    if (!container) return;
    
    if (window.analysisListProperties.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhuma propriedade na lista de análise.</p>';
        return;
    }
    
    container.innerHTML = window.analysisListProperties.map((property, index) => {
        const workflow = property._workflow || {};
        const passed = workflow.passedElimination || false;
        
        return `
            <div class="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <!-- Header da Propriedade -->
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-bold text-gray-800">${property.Address || 'N/A'}</h3>
                        <p class="text-sm text-gray-600">
                            <span class="font-semibold">Parcel:</span> ${property['Parcel Number']} | 
                            <span class="font-semibold">County:</span> ${property.County} | 
                            <span class="font-semibold">Acres:</span> ${property.Acres} | 
                            <span class="font-semibold">Amount:</span> $${parseFloat(property['Amount Due'] || 0).toLocaleString()}
                        </p>
                    </div>
                    <button onclick="removeFromAnalysisList(${index})" class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                        🗑️ Remover
                    </button>
                </div>
                
                <!-- GRUPO 1: ELIMINAÇÃO RÁPIDA -->
                <div class="mb-4">
                    <h4 class="text-md font-bold text-gray-700 mb-3">🚨 GRUPO 1 - ELIMINAÇÃO RÁPIDA</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <button onclick="analyzeCrime('${property['Parcel Number']}')" class="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm" data-tooltip="Análise de criminalidade">
                            🚨 Crime
                        </button>
                        <button onclick="analyzeDisasters('${property['Parcel Number']}')" class="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm" data-tooltip="Histórico de desastres">
                            🌪️ Desastres
                        </button>
                        <button onclick="analyzeZoning('${property['Parcel Number']}')" class="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm" data-tooltip="Análise de zoneamento">
                            📋 Zoneamento
                        </button>
                        <button onclick="analyzeImages('${property['Parcel Number']}')" class="px-3 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 text-sm" data-tooltip="Análise de imagens com IA">
                            📸 Imagens IA
                        </button>
                    </div>
                </div>
                
                <!-- Checkbox "Passou na Eliminação" -->
                <div class="mb-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" ${passed ? 'checked' : ''} onchange="togglePassedElimination(${index})" class="w-5 h-5">
                        <span class="font-semibold ${passed ? 'text-green-600' : 'text-gray-600'}">
                            ✅ Passou na Eliminação (libera Grupo 2)
                        </span>
                    </label>
                </div>
                
                <!-- GRUPO 2: ANÁLISE PROFUNDA -->
                <div class="${passed ? '' : 'opacity-50 pointer-events-none'}">
                    <h4 class="text-md font-bold text-gray-700 mb-3">💰 GRUPO 2 - ANÁLISE PROFUNDA ${passed ? '' : '(🔒 Bloqueado)'}</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <button onclick="analyzeComps('${property['Parcel Number']}')" class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm" data-tooltip="Análise de comps + Cálculo de BID">
                            🔍 Comps + BID
                        </button>
                        <button onclick="analyzeRecommendations('${property['Parcel Number']}')" class="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm" data-tooltip="IA recomenda propriedades similares">
                            🤖 IA Recomenda
                        </button>
                        <button onclick="openSimulator('${property['Parcel Number']}')" class="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm" data-tooltip="Simulador de cenários">
                            🎮 Simulador
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// FUNÇÕES DE GERENCIAMENTO
// ============================================

window.removeFromAnalysisList = function(index) {
    if (confirm('Tem certeza que deseja remover esta propriedade da Lista de Análise?')) {
        window.analysisListProperties.splice(index, 1);
        saveAnalysisListToStorage();
        updateCounts();
        renderAnalysisList();
        showNotification('✅ Propriedade removida da Lista de Análise!', 'success');
    }
};

window.togglePassedElimination = function(index) {
    const property = window.analysisListProperties[index];
    if (property && property._workflow) {
        property._workflow.passedElimination = !property._workflow.passedElimination;
        saveAnalysisListToStorage();
        renderAnalysisList();
        
        if (property._workflow.passedElimination) {
            showNotification('✅ GRUPO 2 desbloqueado!', 'success');
        } else {
            showNotification('⚠️ GRUPO 2 bloqueado novamente', 'warning');
        }
    }
};

function initializeAnalysisListButtons() {
    // Botão "Exportar Análises"
    const exportBtn = document.getElementById('exportAnalysesBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportAnalyses);
    }
    
    // Botão "Limpar Lista"
    const clearBtn = document.getElementById('clearAnalysisListBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja limpar TODA a Lista de Análise?')) {
                window.analysisListProperties = [];
                saveAnalysisListToStorage();
                updateCounts();
                renderAnalysisList();
                showNotification('✅ Lista de Análise limpa!', 'success');
            }
        });
    }
}

function exportAnalyses() {
    if (window.analysisListProperties.length === 0) {
        alert('⚠️ Nenhuma propriedade na Lista de Análise para exportar!');
        return;
    }
    
    const blob = new Blob([JSON.stringify(window.analysisListProperties, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analises-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('✅ Análises exportadas!', 'success');
}

// ============================================
// ARMAZENAMENTO
// ============================================

function saveAnalysisListToStorage() {
    try {
        localStorage.setItem('analysis_list_properties', JSON.stringify(window.analysisListProperties));
    } catch (error) {
        console.error('Erro ao salvar lista de análise:', error);
    }
}

function loadAnalysisListFromStorage() {
    try {
        const saved = localStorage.getItem('analysis_list_properties');
        if (saved) {
            window.analysisListProperties = JSON.parse(saved);
            updateCounts();
        }
    } catch (error) {
        console.error('Erro ao carregar lista de análise:', error);
        window.analysisListProperties = [];
    }
}

function updateCounts() {
    // Atualizar contador de todas as propriedades
    const allCount = document.getElementById('allPropertiesCount');
    if (allCount && window.allNewProperties) {
        allCount.textContent = window.allNewProperties.length;
    }
    
    // Atualizar contador da lista de análise
    const analysisCount = document.getElementById('analysisListCount');
    if (analysisCount) {
        analysisCount.textContent = window.analysisListProperties.length;
    }
}

// Observar quando a tabela for populada
const observeTableChanges = () => {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    const observer = new MutationObserver(() => {
        // Atualizar contadores
        updateCounts();
        
        // Remover coluna de análise
        setTimeout(() => {
            const analysisHeader = Array.from(document.querySelectorAll('#dataTable thead th'))
                .find(th => th.textContent.includes('Análise'));
            if (analysisHeader) {
                analysisHeader.remove();
            }
            
            document.querySelectorAll('#dataTable tbody tr').forEach(row => {
                const analysisCells = row.querySelectorAll('td');
                if (analysisCells.length > 0) {
                    analysisCells[analysisCells.length - 1]?.remove();
                }
            });
        }, 100);
    });
    
    observer.observe(tbody, { childList: true, subtree: true });
};

// Iniciar observador
setTimeout(observeTableChanges, 1000);

console.log('✅ Workflow.js carregado com sucesso!');

