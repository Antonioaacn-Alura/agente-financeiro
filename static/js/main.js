const API_URL = window.location.origin + '/ask_agent';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('resultsSection');
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const resultContent = document.getElementById('resultContent');
const timestamp = document.getElementById('timestamp');
const errorMessage = document.getElementById('errorMessage');

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        search();
    }
});

function quickSearch(query) {
    searchInput.value = query;
    search();
}

async function search() {
    const query = searchInput.value.trim();

    if (!query) {
        showError('Por favor, digite uma pergunta.');
        return;
    }

    showLoading();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query })
        });

        const data = await response.json();

        if (response.ok) {
            showResult(data.response);
        } else {
            showError(data.error || 'Erro desconhecido ao processar a pergunta.');
        }
    } catch (error) {
        showError('Erro de conexao: ' + error.message + '. Verifique se o servidor esta funcionando.');
    }
}

function showLoading() {
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
    loadingSection.style.display = 'block';
}

function showResult(response) {
    loadingSection.style.display = 'none';
    errorSection.style.display = 'none';
    resultsSection.style.display = 'block';

    resultContent.innerHTML = formatResponse(response);
    
    const now = new Date();
    timestamp.textContent = now.toLocaleString('pt-BR');
}

function showError(message) {
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'block';
    errorMessage.textContent = message;
}

function clearResults() {
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
    loadingSection.style.display = 'none';
}

function formatResponse(text) {
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    
    return formatted;
}
