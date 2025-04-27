<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Merge CSV Files - Web App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3 {
            color: #2c3e50;
        }
        h1 {
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        h2 {
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            margin-top: 30px;
        }
        .badges {
            text-align: center;
            margin: 20px 0;
        }
        .badges img {
            margin: 0 5px;
        }
        code {
            background-color: #f5f5f5;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: monospace;
        }
        pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .highlight {
            background-color: #f8f8f8;
            border-left: 3px solid #3498db;
            padding: 10px 15px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <h1>🔗 Merge CSV Files - Web App</h1>
    
    <p>Aplicação Web desenvolvida com <strong>Streamlit</strong> para mesclar múltiplos arquivos <strong>CSV</strong> de forma flexível e robusta, com opções avançadas de configuração e visualização dos dados.</p>
    
    <div class="badges">
        <img src="https://img.shields.io/badge/Feito%20com-Streamlit-red" alt="Feito com Streamlit">
        <img src="https://img.shields.io/badge/Python-3.8%2B-blue" alt="Python 3.8+">
        <img src="https://img.shields.io/badge/license-MIT-green" alt="Licença MIT">
    </div>
    
    <hr>
    
    <h2>📜 Descrição</h2>
    
    <p>O <strong>Merge CSV Files</strong> é uma ferramenta web que simplifica a combinação de múltiplos arquivos CSV, oferecendo:</p>
    
    <ul>
        <li>Upload de vários arquivos <code>.csv</code></li>
        <li>Reordenação intuitiva dos arquivos antes da mesclagem</li>
        <li>Configuração personalizada de delimitadores e codificação</li>
        <li>Detecção automática de encoding (via <code>chardet</code>)</li>
        <li>Visualização dos dados em formatos bruto e formatado</li>
        <li>Exportação do resultado final</li>
    </ul>
    
    <p><strong>Casos de uso ideais</strong>: União de bases de dados exportadas de sistemas diferentes, consolidação de relatórios ou tratamento de arquivos com formatos e codificações variados.</p>
    
    <h2>✨ Funcionalidades Principais</h2>
    
    <h3>📌 Processamento de Arquivos</h3>
    <ul>
        <li>Upload múltiplo de arquivos CSV</li>
        <li>Reordenação intuitiva via drag-and-drop</li>
        <li>Detecção automática de encoding</li>
        <li>Suporte a múltiplos delimitadores (vírgula, ponto-e-vírgula, tabulação)</li>
    </ul>
    
    <h3>⚙️ Configurações Avançadas</h3>
    <ul>
        <li>Seleção de encoding de entrada/saída (UTF-8, ISO-8859-1, etc.)</li>
        <li>Customização de delimitadores</li>
        <li>Validação de estrutura dos arquivos</li>
    </ul>
    
    <h3>👁️ Visualização de Dados</h3>
    <ul>
        <li>Pré-visualização dos dados mesclados</li>
        <li>Modo bruto (dados originais)</li>
        <li>Modo formatado (números e datas organizados)</li>
    </ul>
    
    <h3>🚀 Exportação</h3>
    <ul>
        <li>Download do arquivo consolidado</li>
        <li>Reset completo da aplicação</li>
    </ul>
    
    <h2>⚙️ Instalação e Execução</h2>
    
    <h3>Pré-requisitos</h3>
    <ul>
        <li>Python 3.8+</li>
        <li>Pip</li>
    </ul>
    
    <h3>Passo a Passo</h3>
    
    <div class="highlight">
        <h4>1. Clonar o repositório</h4>
        <pre><code>git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo</code></pre>
    </div>
    
    <div class="highlight">
        <h4>2. Configurar ambiente virtual (recomendado)</h4>
        <pre><code>python -m venv venv
# Linux/Mac
source venv/bin/activate
# Windows
venv\Scripts\activate</code></pre>
    </div>
    
    <div class="highlight">
        <h4>3. Instalar dependências</h4>
        <pre><code>pip install -r requirements.txt</code></pre>
    </div>
    
    <div class="highlight">
        <h4>4. Executar a aplicação</h4>
        <pre><code>streamlit run app.py</code></pre>
    </div>
    
    <p>O arquivo <code>requirements.txt</code> inclui:</p>
    <pre><code>streamlit>=1.0
pandas>=1.0
chardet>=4.0</code></pre>
    
    <h2>🖥️ Como Usar</h2>
    
    <ol>
        <li><strong>Upload</strong>: Selecione os arquivos CSV na aba de upload</li>
        <li><strong>Configuração</strong>: Defina delimitadores e codificação</li>
        <li><strong>Pré-visualização</strong>: Verifique os dados antes da mesclagem</li>
        <li><strong>Mesclagem</strong>: Combine os arquivos com um clique</li>
        <li><strong>Exportação</strong>: Baixe o arquivo consolidado</li>
    </ol>
    
    <h2>🛠 Stack Tecnológica</h2>
    
    <ul>
        <li><strong>Frontend</strong>: <a href="https://streamlit.io/">Streamlit</a></li>
        <li><strong>Processamento de dados</strong>: <a href="https://pandas.pydata.org/">Pandas</a></li>
        <li><strong>Detecção de encoding</strong>: <a href="https://chardet.readthedocs.io/">Chardet</a></li>
        <li><strong>Linguagem</strong>: <a href="https://www.python.org/">Python 3.8+</a></li>
    </ul>
    
    <h2>📦 Estrutura do Projeto</h2>
    
    <pre><code>merge-csv-app/
├── app.py               # Lógica principal da aplicação
├── requirements.txt     # Dependências do projeto
├── README.md            # Documentação
└── assets/              # (Opcional) Arquivos estáticos
    └── example.csv      # Exemplo de arquivo</code></pre>
    
    <h2>🤝 Como Contribuir</h2>
    
    <p>Contribuições são bem-vindas! Siga estes passos:</p>
    
    <ol>
        <li>Faça um fork do projeto</li>
        <li>Crie uma branch para sua feature (<code>git checkout -b feature/incrivel</code>)</li>
        <li>Commit suas mudanças (<code>git commit -m 'Adiciona feature incrível'</code>)</li>
        <li>Push para a branch (<code>git push origin feature/incrivel</code>)</li>
        <li>Abra um Pull Request</li>
    </ol>
    
    <h2>📄 Licença</h2>
    
    <p>Distribuído sob a licença MIT. Veja <code>LICENSE</code> para mais informações.</p>
    
    <h2>✉️ Contato</h2>
    
    <p>Seu Nome - <a href="https://twitter.com/seu_twitter">@seu_twitter</a> - email@exemplo.com</p>
    
    <p>Link do Projeto: <a href="https://github.com/seu-usuario/seu-repo">https://github.com/seu-usuario/seu-repo</a></p>
</body>
</html>