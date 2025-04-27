<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Easy CSV Merge - Web App</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1, h2 {
            color: #2c3e50;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        h3 {
            color: #34495e;
        }
        code {
            background-color: #f5f5f5;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', Courier, monospace;
        }
        pre {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 3px solid #3498db;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        .badges {
            text-align: center;
            margin: 20px 0;
        }
        .badges img {
            margin: 0 5px;
        }
        .highlight {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        a {
            color: #3498db;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <h1>Easy CSV Merge - Web App</h1>
    
    <p>Aplicação Web feita com <strong>Streamlit</strong> para mesclar múltiplos arquivos <strong>CSV</strong>, de forma flexível, robusta e com opções avançadas de configuração e visualização.</p>
    
    <div class="badges">
        <img src="https://img.shields.io/badge/Feito%20com-Streamlit-red" alt="Feito com Streamlit">
        <img src="https://img.shields.io/badge/Python-3.8%2B-blue" alt="Python 3.8+">
        <img src="https://img.shields.io/badge/license-MIT-green" alt="Licença MIT">
    </div>
    
    <hr>
    
    <h2>Descrição</h2>
    
    <p>O <strong>Merge CSV Files</strong> permite que o usuário:</p>
    
    <ul>
        <li>Faça upload de vários arquivos <code>.csv</code></li>
        <li>Reordene os arquivos antes da mesclagem</li>
        <li>Configure delimitador, codificação de entrada e saída</li>
        <li>Detecte automaticamente o encoding dos arquivos (usando <code>chardet</code>)</li>
        <li>Mescle os arquivos em um único CSV de maneira rápida</li>
        <li>Visualize o CSV mesclado (modo bruto e modo melhorado)</li>
        <li>Baixe o arquivo pronto</li>
        <li>Resete completamente o app para começar do zero</li>
    </ul>
    
    <p>Ideal para unir bases de dados exportadas de sistemas diferentes, com alta flexibilidade para tratar arquivos de formatos e codificações variados.</p>
    
    <h2>Funcionalidades</h2>
    
    <ul>
        <li>Upload de múltiplos arquivos CSV simultaneamente</li>
        <li>Reordenação manual dos arquivos</li>
        <li>Configurações avançadas:
            <ul>
                <li>Seleção de delimitador (vírgula, ponto-e-vírgula, tabulação ou customizado)</li>
                <li>Escolha de encoding de entrada (com detecção automática se preferir)</li>
                <li>Escolha de encoding de saída</li>
            </ul>
        </li>
        <li>Detecção automática de encoding via <code>chardet</code></li>
        <li>Barra de progresso ao mesclar</li>
        <li>Alerta se os arquivos tiverem colunas diferentes</li>
        <li>Visualização dos dados:
            <ul>
                <li>Modo Bruto</li>
                <li>Modo Melhorado (números e datas formatados)</li>
            </ul>
        </li>
        <li>Download do CSV final</li>
        <li>Botão para resetar completamente a aplicação</li>
    </ul>
    
    <h2>Instalação</h2>
    
    <h3>1. Clone o projeto</h3>
    <div class="highlight">
        <pre><code>git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo</code></pre>
    </div>
    
    <h3>2. (Opcional) Crie um ambiente virtual</h3>
    <div class="highlight">
        <pre><code>python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows</code></pre>
    </div>
    
    <h3>3. Instale as dependências</h3>
    <div class="highlight">
        <pre><code>pip install -r requirements.txt</code></pre>
    </div>
    
    <p>O <code>requirements.txt</code> deve conter:</p>
    <pre><code>streamlit
pandas
chardet</code></pre>
    
    <h3>4. Rode o aplicativo</h3>
    <div class="highlight">
        <pre><code>streamlit run app.py</code></pre>
    </div>
    
    <h2>🖥️ Uso</h2>
    
    <ol>
        <li>Faça upload dos arquivos CSV na aba <strong>📂 Upload</strong></li>
        <li>Configure opções de leitura e saída na aba <strong>⚙ Configurações</strong></li>
        <li>Clique para mesclar na aba <strong>🔗 Mesclar</strong></li>
        <li>Visualize o arquivo gerado e baixar na aba <strong>🔍 Visualização e Download</strong></li>
        <li>Use <strong>🔄 Resetar Tudo</strong> se quiser reiniciar o processo</li>
    </ol>
    
    <h2>Tecnologias Utilizadas</h2>
    
    <ul>
        <li><a href="https://www.python.org/">Python 3.8+</a></li>
        <li><a href="https://streamlit.io/">Streamlit</a></li>
        <li><a href="https://pandas.pydata.org/">Pandas</a></li>
        <li><a href="https://chardet.readthedocs.io/">Chardet</a></li>
    </ul>
    
    <h2>Estrutura do Projeto</h2>
    
    <pre><code>├── app.py               # Código principal do app
├── requirements.txt     # Dependências
└── README.md            # Este documento</code></pre>
    
    <h2>Contribuindo</h2>
    
    <p>Contribuições são super bem-vindas!<br>
    Sinta-se livre para abrir issues, sugerir melhorias ou enviar pull requests.</p>
    
    <h2>Licença</h2>
    
    <p>Este projeto é licenciado sob a licença MIT.</p>
</body>
</html>