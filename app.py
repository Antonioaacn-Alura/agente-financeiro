"""
Agente de Pesquisa Financeira - Backend API
Flask + LangGraph + Tavily para busca na web
"""

import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from threading import Thread
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator
from langchain_core.messages import AnyMessage, SystemMessage, HumanMessage, ToolMessage
from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults

app = Flask(__name__)
CORS(app)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_SEARCH_API")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY nao configurada")
if not TAVILY_API_KEY:
    raise ValueError("TAVILY_SEARCH_API nao configurada")

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
os.environ["TAVILY_SEARCH_API"] = TAVILY_API_KEY

tool = TavilySearchResults(max_results=3, tavily_api_key=TAVILY_API_KEY)


class AgentState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]


class Agent:
    def __init__(self, model, tools, system=""):
        self.system = system
        graph = StateGraph(AgentState)
        graph.add_node("llm", self.call_openai)
        graph.add_node("action", self.take_action)
        graph.add_conditional_edges("llm", self.exists_action, {True: "action", False: END})
        graph.add_edge("action", "llm")
        graph.set_entry_point("llm")
        self.graph = graph.compile()
        self.tools = {t.name: t for t in tools}
        self.model = model.bind_tools(tools)

    def exists_action(self, state: AgentState):
        result = state['messages'][-1]
        return len(result.tool_calls) > 0

    def call_openai(self, state: AgentState):
        messages = state['messages']
        if self.system:
            messages = [SystemMessage(content=self.system)] + messages
        message = self.model.invoke(messages)
        return {'messages': [message]}

    def take_action(self, state: AgentState):
        tool_calls = state['messages'][-1].tool_calls
        results = []
        for t in tool_calls:
            if not t['name'] in self.tools:
                result = "nome de ferramenta incorreto, tente novamente"
            else:
                result = self.tools[t['name']].invoke(t['args'])
            results.append(ToolMessage(tool_call_id=t['id'], name=t['name'], content=str(result)))
        return {'messages': results}


prompt = """Voce e um assistente de pesquisa financeira inteligente. Use o motor de busca para procurar informacoes sobre mercados financeiros, economia, investimentos e topics relacionados. \
Voce pode fazer multiplas chamadas (juntas ou em sequencia). \
So procure informacoes quando tiver certeza do que quer. \
Se precisar procurar algumas informacoes antes de fazer uma pergunta de acompanhamento, voce pode fazer isso!
Responda sempre em portugues brasileiro de forma clara e objetiva.
"""

model = ChatOpenAI(model="gpt-4o-mini")
agent = Agent(model, [tool], system=prompt)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/ask_agent', methods=['POST'])
def ask_agent():
    data = request.json
    user_query = data.get('query')

    if not user_query:
        return jsonify({'error': 'Nenhuma query fornecida'}), 400

    try:
        messages = [HumanMessage(content=user_query)]
        result = agent.graph.invoke({"messages": messages})
        final_response = result['messages'][-1].content
        return jsonify({'response': final_response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health')
def health():
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
