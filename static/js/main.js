const API_URL = window.location.origin + '/ask_agent';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('resultsSection');
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const resultContent = document.getElementById('resultContent');
const timestamp = document.getElementById('timestamp');
const errorMessage = document.getElementById('errorMessage');

const marketData = [
    { name: 'IBOVESPA', value: '128.456', change: '+1,23%', up: true },
    { name: 'DOLAR', value: 'R$ 5,87', change: '+0,45%', up: true },
    { name: 'EURO', value: 'R$ 6,42', change: '-0,12%', up: false },
    { name: 'SELIC', value: '14,75%', change: '0,00%', up: true },
    { name: 'BITCOIN', value: 'US$ 97.230', change: '+2,87%', up: true },
    { name: 'OURO', value: 'US$ 2.412', change: '+0,34%', up: true },
    { name: 'PETROLEO', value: 'US$ 76,80', change: '-0,92%', up: false },
    { name: 'IFIX', value: '3.287', change: '+0,18%', up: true },
    { name: 'S&P 500', value: '5.672', change: '+0,56%', up: true },
    { name: 'NASDAQ', value: '18.134', change: '+0,89%', up: true },
    { name: 'DOW JONES', value: '42.560', change: '+0,34%', up: true },
    { name: 'CRYPTO INDEX', value: '3.456', change: '+1,78%', up: true },
];

const newsData = [
    {
        tag: 'Economia',
        title: 'Copom mantem taxa Selic em 14,75% ao ano',
        excerpt: 'O Comite de Politica Monetaria do Banco Central decidiu manter a taxa de juros基本 em 14,75% ao ano, sinalizando cautela diante da inflacao.',
        time: '2h atras',
        icon: 'fa-university'
    },
    {
        tag: 'Mercado',
        title: 'Ibovespa recua com incertezas globais',
        excerpt: 'A bolsa brasileira fechou em queda de 0,8% puxada por acoes do setor de commodities em meio a tensoes comerciais.',
        time: '4h atras',
        icon: 'fa-chart-bar'
    },
    {
        tag: 'Criptomoedas',
        title: 'Bitcoin se aproxima de novo recorde historico',
        excerpt: 'A moeda digital ultrapassou US$ 97 mil com otimismo institucional e previsoes de novos ETFs no mercado americano.',
        time: '5h atras',
        icon: 'fa-bitcoin'
    },
    {
        tag: 'Investimentos',
        title: 'IPCA+ 2035: vale a pena investir agora?',
        excerpt: 'Com a Selic elevada, analistas discutem se titulos atrelados a inflacao oferecem oportunidade para alocacao de medio prazo.',
        time: '6h atras',
        icon: 'fa-hand-holding-usd'
    },
    {
        tag: 'Internacional',
        title: 'Fed sinaliza possivel corte de juros em setembro',
        excerpt: 'O Federal Reserve abriu espaco para reducao da taxa basica diante da desinflacao nos Estados Unidos.',
        time: '8h atras',
        icon: 'fa-globe'
    },
    {
        tag: 'Moedas',
        title: 'Dolar sobe com apetite por ativos seguros',
        excerpt: 'A divida americana se valoriza em meio a volatilidade nos mercados emergentes e incertezas geopoliticas.',
        time: '10h atras',
        icon: 'fa-dollar-sign'
    },
];

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
    loadingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showResult(response) {
    loadingSection.style.display = 'none';
    errorSection.style.display = 'none';
    resultsSection.style.display = 'block';

    resultContent.innerHTML = formatResponse(response);
    
    const now = new Date();
    timestamp.textContent = now.toLocaleString('pt-BR');

    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

function renderTicker() {
    const tickerContent = document.getElementById('tickerContent');
    if (!tickerContent) return;

    let html = '';
    const items = [...marketData, ...marketData];
    items.forEach(item => {
        html += `
            <span class="ticker-item">
                <span class="name">${item.name}</span>
                <span class="value">${item.value}</span>
                <span class="change ${item.up ? 'up' : 'down'}">${item.change}</span>
            </span>
        `;
    });
    tickerContent.innerHTML = html;
}

function renderMarket() {
    const marketGrid = document.getElementById('marketGrid');
    if (!marketGrid) return;

    let html = '';
    marketData.forEach(item => {
        const arrowClass = item.up ? 'up' : 'down';
        const arrow = item.up ? '▲' : '▼';
        html += `
            <div class="market-card" onclick="quickSearch('Cotacao ${item.name} hoje')">
                <div class="card-name">${item.name}</div>
                <div class="card-value">${item.value}</div>
                <div class="card-change ${arrowClass}">
                    <span class="arrow">${arrow}</span> ${item.change}
                </div>
            </div>
        `;
    });
    marketGrid.innerHTML = html;

    const marketTime = document.getElementById('marketTime');
    if (marketTime) {
        marketTime.textContent = 'Atualizado: ' + new Date().toLocaleString('pt-BR');
    }
}

function renderNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;

    let html = '';
    newsData.forEach(item => {
        html += `
            <div class="news-card" onclick="quickSearch('${item.title}')">
                <div class="news-image">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="news-body">
                    <div class="news-tag">${item.tag}</div>
                    <div class="news-title">${item.title}</div>
                    <div class="news-excerpt">${item.excerpt}</div>
                </div>
                <div class="news-meta">
                    <span><i class="far fa-clock"></i> ${item.time}</span>
                    <span><i class="fas fa-robot"></i> Agente IA</span>
                </div>
            </div>
        `;
    });
    newsGrid.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    renderTicker();
    renderMarket();
    renderNews();
});
