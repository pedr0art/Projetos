import streamlit as st
import requests
import json

# Simula um banco de dados simples com dicionários
if 'users' not in st.session_state:
    st.session_state.users = {}

if 'logged_in' not in st.session_state:
    st.session_state.logged_in = False
    st.session_state.username = ""

if 'cart' not in st.session_state:
    st.session_state.cart = []

# Função para buscar produtos em uma API pública
@st.cache_data
def fetch_products():
    response = requests.get("https://fakestoreapi.com/products")
    if response.status_code == 200:
        return response.json()
    return []

# Função de login
def login():
    st.title("Login")
    username = st.text_input("Usuário")
    password = st.text_input("Senha", type="password")
    if st.button("Entrar"):
        if username in st.session_state.users and st.session_state.users[username] == password:
            st.session_state.logged_in = True
            st.session_state.username = username
            st.success("Login bem-sucedido!")
        else:
            st.error("Usuário ou senha incorretos")

    if st.button("Ir para Cadastro"):
        st.session_state.page = "cadastro"

# Função de cadastro
def cadastro():
    st.title("Cadastro de Usuário")
    username = st.text_input("Novo Usuário")
    password = st.text_input("Nova Senha", type="password")
    if st.button("Cadastrar"):
        if username in st.session_state.users:
            st.warning("Usuário já existe")
        else:
            st.session_state.users[username] = password
            st.success("Usuário cadastrado com sucesso!")

    if st.button("Voltar para Login"):
        st.session_state.page = "login"

# Função da loja
def loja():
    produtos = fetch_products()
    busca = st.text_input("Buscar produto")
    if busca:
        produtos = [p for p in produtos if busca.lower() in p['title'].lower()]

    cols = st.columns(3)
    for idx, produto in enumerate(produtos):
        with cols[idx % 3]:
            st.image(produto['image'], width=150)
            st.write(f"**{produto['title']}**")
            st.write(f"Preço: ${produto['price']}")
            if st.button(f"Adicionar ao carrinho - {produto['id']}"):
                st.session_state.cart.append(produto)
                st.success("Produto adicionado ao carrinho")

# Função do carrinho
def carrinho():
    st.title("Carrinho de Compras")
    if not st.session_state.cart:
        st.info("Seu carrinho está vazio.")
    else:
        total = 0
        for i, item in enumerate(st.session_state.cart):
            st.image(item['image'], width=80)
            st.write(f"{item['title']} - ${item['price']}")
            total += item['price']
            if st.button(f"Remover - {i}"):
                st.session_state.cart.pop(i)
                st.experimental_rerun()
        st.subheader(f"Total: ${total:.2f}")

# Página principal com abas
def pagina_principal():
    st.title(f"Bem-vindo, {st.session_state.username}!")
    aba = st.radio("Escolha uma aba", ["Loja", "Carrinho"])

    if aba == "Loja":
        loja()
    elif aba == "Carrinho":
        carrinho()

    if st.button("Sair"):
        st.session_state.logged_in = False
        st.session_state.username = ""
        st.session_state.cart = []
        st.session_state.page = "login"

# Controlador de páginas
if 'page' not in st.session_state:
    st.session_state.page = "login"

if not st.session_state.logged_in:
    if st.session_state.page == "login":
        login()
    elif st.session_state.page == "cadastro":
        cadastro()
else:
    pagina_principal()