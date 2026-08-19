# Agente Financeiro - Pesquisa Inteligente com IA

Agente de pesquisa financeira que busca informacoes na web em tempo real usando LangGraph + Tavily + OpenAI.

## Arquitetura da Solucao

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (HTML/CSS/JS)                │
│              Estilo Investing.com com busca              │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP POST /ask_agent
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend (Flask API)                   │
│                  Porta 5000 / Gunicorn                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Agente LangGraph (Grafo de Estados)         │
│  ┌─────────┐    ┌──────────┐    ┌─────────────────┐    │
│  │   LLM   │───▶│  Action  │───▶│   Resposta      │    │
│  │(OpenAI) │◀───│ (Tavily) │    │   Final         │    │
│  └─────────┘    └──────────┘    └─────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Fluxo de Execucao

1. Usuario digita pergunta na barra de busca
2. Frontend envia POST para `/ask_agent`
3. Flask cria `HumanMessage` e invoca o agente LangGraph
4. O LLM decide se precisa buscar informacoes (Tavily)
5. Se sim, executa a busca e retorna ao LLM
6. LLM gera resposta final baseada nos resultados
7. Resposta e enviada ao frontend e exibida

## Tecnologias e Ferramentas

| Tecnologia | Versao | Uso |
|---|---|---|
| Python | 3.11+ | Linguagem principal |
| Flask | 3.1.3 | Framework web / API |
| LangGraph | 0.3.25 | Orquestracao de agentes |
| LangChain OpenAI | 0.3.14 | Integracao com OpenAI |
| Tavily | - | API de busca na web |
| OpenAI GPT-4o-mini | - | Modelo de linguagem |
| Docker | - | Containerizacao |
| Kubernetes (OKE) | - | Orquestracao na OCI |
| Gunicorn | 23.0.0 | Servidor WSGI |

## Estrutura do Projeto

```
agente-financeiro/
├── app.py                  # Backend Flask com agente LangGraph
├── requirements.txt        # Dependencias Python
├── Dockerfile              # Imagem Docker
├── docker-compose.yml      # Compose para testes locais
├── .env.example            # Template de variaveis de ambiente
├── .gitignore              # Arquivos ignorados pelo Git
├── README.md               # Esta documentacao
├── templates/
│   └── index.html          # Frontend HTML
├── static/
│   ├── css/
│   │   └── style.css       # Estilos CSS (tema Investing.com)
│   └── js/
│       └── main.js         # Logica JavaScript do frontend
└── k8s/
    └── deployment.yaml     # Manifests Kubernetes para OKE
```

## Pre-requisitos

1. **Python 3.11+** instalado
2. **Docker** instalado (para deploy)
3. Conta na **OpenAI** (chave de API)
4. Conta no **Tavily** (chave de API - gratuito)
5. Conta na **OCI** com OKE habilitado (para deploy em nuvem)

## Instrucoes para Executar

### Opcao 1: Execucao Local (Desenvolvimento)

```bash
# 1. Clonar o repositorio
git clone https://github.com/seu-usuario/agente-financeiro.git
cd agente-financeiro

# 2. Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variaveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas chaves de API

# 5. Executar
python app.py
```

Acesse: http://localhost:5000

### Opcao 2: Docker

```bash
# 1. Build da imagem
docker build -t agente-financeiro .

# 2. Executar
docker run -p 5000:5000 \
  -e OPENAI_API_KEY=sua_chave \
  -e TAVILY_SEARCH_API=sua_chave \
  agente-financeiro
```

### Opcao 3: Docker Compose

```bash
# 1. Configurar .env
cp .env.example .env
# Edite com suas chaves

# 2. Executar
docker-compose up -d
```

### Opcao 4: Deploy na OCI (OKE)

```bash
# 1. Build e push para OCIR
docker build -t <ocir-registry>/agente-financeiro:latest .
docker push <ocir-registry>/agente-financeiro:latest

# 2. Criar secrets no Kubernetes
kubectl create secret generic agente-financeiro-secrets \
  --from-literal=openai-api-key=SUA_CHAVE_OPENAI \
  --from-literal=tavily-api-key=SUA_CHAVE_TAVILY

# 3. Aplicar manifests
kubectl apply -f k8s/deployment.yaml

# 4. Verificar status
kubectl get pods
kubectl get service agente-financeiro-service
```

## Exemplos de Perguntas que o Agente Consegue Responder

### Mercado Financeiro
1. "Qual a cotacao do dolar hoje?"
2. "Como esta o Ibovespa?"
3. "Qual a taxa Selic atual?"
4. "Cotacao do petroleo brent"

### Economia
5. "Qual a inflacao do IPCA?"
6. "Como esta o PIB do Brasil?"
7. "Qual a projecao de crescimento economico?"

### Investimentos
8. "Investir em CDB vale a pena?"
9. "Qual a melhor forma de investir em 2026?"
10. "Como funciona o Tesouro Direto?"

### Criptomoedas
11. "Qual a cotacao do Bitcoin?"
12. "Ethereum esta valorizando?"
13. "Vale a pena investir em criptomoedas?"

## Exemplos de Respostas Geradas

> **Pergunta:** Qual a taxa Selic atual?
>
> **Resposta:** A taxa Selic atual e de **14,75% ao ano**, definida pelo Copom em julho de 2025. A meta e manter a inflacao dentro da faixa de meta ate 2026.

> **Pergunta:** Como esta o Ibovespa hoje?
>
> **Resposta:** O Ibovespa esta negociando em torno de **128.000 pontos**, com variacao de +0,5% na sessao de hoje. Os setores de银行 e mineracao lideram as altas.

## Deploy na OCI - Evidencias

### Captura de Tela do Deploy

![Deploy OCI](link-para-screenshot)

### Link da Aplicacao

URL publica: `http://<ip-publica-oke>:5000`

## Licenca

Projeto educacional - Challenge Alura - Trilha ECOA PUC - Introducao a LLMs.
