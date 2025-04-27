# Easy CSV Merge - Web App

Aplicação Web feita com **Streamlit** para mesclar múltiplos arquivos **CSV**, de forma flexível, robusta e com opções avançadas de configuração e visualização.

##  Descrição

O **Merge CSV Files** permite que o usuário:
- Faça upload de vários arquivos `.csv`
- Reordene os arquivos antes da mesclagem
- Configure delimitador, codificação de entrada e saída
- Detecte automaticamente o encoding dos arquivos (usando `chardet`)
- Mescle os arquivos em um único CSV de maneira rápida
- Visualize o CSV mesclado (modo bruto e modo melhorado)
- Baixe o arquivo pronto
- Resete completamente o app para começar do zero

Ideal para unir bases de dados exportadas de sistemas diferentes, com alta flexibilidade para tratar arquivos de formatos e codificações variados.

---

##  Funcionalidades

-  Upload de múltiplos arquivos CSV simultaneamente
-  Reordenação manual dos arquivos
-  Configurações avançadas:
  - Seleção de delimitador (vírgula, ponto-e-vírgula, tabulação ou customizado)
  - Escolha de encoding de entrada (com detecção automática se preferir)
  - Escolha de encoding de saída
-  Detecção automática de encoding via `chardet`
-  Barra de progresso ao mesclar
-  Alerta se os arquivos tiverem colunas diferentes
-  Visualização dos dados:
  - Modo Bruto
  - Modo Melhorado (números e datas formatados)
-  Download do CSV final
-  Botão para resetar completamente a aplicação

---

##  Instalação

### 1. Clone o projeto

```bash
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo
```

### 2. (Opcional) Crie um ambiente virtual

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

O `requirements.txt` deve conter:

```
streamlit
pandas
chardet
```

### 4. Rode o aplicativo

```bash
streamlit run app.py
```

---

## 🖥️ Uso

1. Faça upload dos arquivos CSV na aba **📂 Upload**
2. Configure opções de leitura e saída na aba **⚙ Configurações**
3. Clique para mesclar na aba **🔗 Mesclar**
4. Visualize o arquivo gerado e baixar na aba **🔍 Visualização e Download**
5. Use **🔄 Resetar Tudo** se quiser reiniciar o processo

---

##  Tecnologias Utilizadas

- [Python 3.8+](https://www.python.org/)
- [Streamlit](https://streamlit.io/)
- [Pandas](https://pandas.pydata.org/)
- [Chardet](https://chardet.readthedocs.io/)

---

##  Estrutura do Projeto

```bash
├── app.py               # Código principal do app
├── requirements.txt     # Dependências
└── README.md            # Este documento
```

---


##  Contribuindo

Contribuições são super bem-vindas!  
Sinta-se livre para abrir issues, sugerir melhorias ou enviar pull requests.

---

##  Licença

Este projeto é licenciado sob a licença MIT.


