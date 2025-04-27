import streamlit as st
import pandas as pd
from io import BytesIO
import chardet

# Configuração inicial da página do Streamlit
st.set_page_config(page_title="Easy CSV Merge", layout="centered")

# Título e descrição do aplicativo
st.title("🗃️ Easy CSV Merge")
st.write("Conecte seus dados em segundos.")

# --- Tabs principais ---
# Criação de abas para organizar as funcionalidades do aplicativo
tab1, tab2, tab3, tab4 = st.tabs(["📂 Upload", "⚙ Configurações", "🔗 Mesclar", "🔍 Visualização e Download"])

# --- Tab 1: Upload ---
with tab1:
    # Gera uma chave única para o file_uploader para evitar problemas de cache
    if "uploader_key" not in st.session_state:
        st.session_state["uploader_key"] = 0

    # Componente para upload de múltiplos arquivos CSV
    uploaded_files = st.file_uploader(
        "Selecione seus arquivos CSV",
        type="csv",
        accept_multiple_files=True,
        key=st.session_state["uploader_key"]  # Chave dinâmica para evitar conflitos
    )

    if uploaded_files:
        # Lista os nomes dos arquivos enviados
        uploaded_names = [f.name for f in uploaded_files]

        # Verifica se a ordem dos arquivos mudou ou se é um novo upload
        if (
            "file_order" not in st.session_state
            or st.session_state.previous_upload != uploaded_names
        ):
            # Salva a ordem inicial dos arquivos
            st.session_state.file_order = uploaded_names.copy()
            st.session_state.previous_upload = uploaded_names.copy()

        # Interface para reorganizar a ordem dos arquivos
        st.subheader("🔀 Ordem dos Arquivos (use as setas)")

        for i, name in enumerate(st.session_state.file_order):
            col1, col2, col3 = st.columns([6, 1, 1])
            with col1:
                st.write(f"**{i+1}.** {name}")
            with col2:
                # Botão para mover o arquivo para cima
                if st.button("↑", key=f"up_{i}") and i > 0:
                    st.session_state.file_order[i], st.session_state.file_order[i-1] = (
                        st.session_state.file_order[i-1], st.session_state.file_order[i]
                    )
                    st.rerun()  # Atualiza a interface
            with col3:
                # Botão para mover o arquivo para baixo
                if st.button("↓", key=f"down_{i}") and i < len(st.session_state.file_order) - 1:
                    st.session_state.file_order[i], st.session_state.file_order[i+1] = (
                        st.session_state.file_order[i+1], st.session_state.file_order[i]
                    )
                    st.rerun()

        # Botão para resetar o estado do upload
        st.markdown("---")
        if st.button("🔄 Resetar Tudo"):
            st.session_state.clear()  # Limpa o estado
            st.session_state["uploader_key"] = st.session_state.get("uploader_key", 0) + 1  # Força novo file_uploader
            st.rerun()

    else:
        # Mensagem informativa caso nenhum arquivo tenha sido enviado
        st.info("🔔 Envie pelo menos dois arquivos CSV para começar.")

# --- Tab 2: Configurações ---
with tab2:
    if uploaded_files:
        st.subheader("⚙️ Configurações Avançadas")

        # Opção para selecionar a codificação dos arquivos de entrada
        encoding_option = st.selectbox(
            "Codificação dos arquivos de entrada",
            options=["Automático", "utf-8", "latin1", "windows-1252"]
        )

        # Opção para selecionar o delimitador dos arquivos CSV
        delimiter_option = st.selectbox(
            "Selecione o delimitador",
            options=[", (vírgula)", "; (ponto e vírgula)", "\\t (tabulação)", "Outro (customizado)"]
        )

        # Mapeia o delimitador selecionado para o caractere correspondente
        delimiter = {
            ", (vírgula)": ",",
            "; (ponto e vírgula)": ";",
            "\\t (tabulação)": "\t",
        }.get(delimiter_option)

        # Permite ao usuário definir um delimitador customizado
        if delimiter_option == "Outro (customizado)":
            delimiter = st.text_input("Delimitador customizado:", value="|")

        # Opção para selecionar a codificação do arquivo de saída
        output_encoding_option = st.selectbox(
            "Codificação do arquivo de saída",
            options=["utf-8", "latin1", "windows-1252"]
        )

        # Permite ao usuário definir o nome do arquivo final
        file_name = st.text_input("📝 Nome do arquivo final:", "arquivos_mesclados.csv")
        if not file_name.lower().endswith(".csv"):
            file_name += ".csv"

        # Salva as configurações no estado da sessão
        st.session_state["config"] = {
            "encoding_option": encoding_option,
            "delimiter": delimiter,
            "output_encoding_option": output_encoding_option,
            "file_name": file_name
        }
    else:
        # Mensagem informativa caso nenhum arquivo tenha sido enviado
        st.info("🔔 Primeiro envie arquivos na aba 'Upload'.")

# --- Tab 3: Mesclar e Download ---
with tab3:
    if uploaded_files and "config" in st.session_state:
        if st.button("Mesclar Arquivos"):
            # Recupera as configurações salvas
            config = st.session_state["config"]
            encoding_option = config["encoding_option"]
            delimiter = config["delimiter"]
            output_encoding_option = config["output_encoding_option"]
            file_name = config["file_name"]

            dataframes = []
            file_map = {f.name: f for f in uploaded_files}

            # Barra de progresso para o processo de mesclagem
            progress = st.progress(0)

            for idx, fname in enumerate(st.session_state.file_order):
                file = file_map.get(fname)
                if not file:
                    st.error(f"Arquivo {fname} não encontrado!")
                    st.stop()

                df = None
                try:
                    # Detecta automaticamente a codificação do arquivo, se necessário
                    if encoding_option == "Automático":
                        file.seek(0)
                        raw_data = file.read()
                        detection = chardet.detect(raw_data)
                        detected_encoding = detection['encoding']
                        confidence = detection['confidence']

                        st.info(f"Arquivo {fname}: Encoding detectado como **{detected_encoding}** (confiança: {confidence:.2f})")

                        file.seek(0)
                        df = pd.read_csv(BytesIO(raw_data), sep=delimiter, encoding=detected_encoding)
                    else:
                        file.seek(0)
                        df = pd.read_csv(file, sep=delimiter, encoding=encoding_option)
                except Exception as e:
                    st.error(f"Erro ao ler o arquivo {fname}: {e}")
                    st.stop()

                dataframes.append(df)
                progress.progress((idx + 1) / len(st.session_state.file_order))

            if dataframes:
                # Verifica se todos os arquivos têm as mesmas colunas
                columns_set = set(tuple(df.columns) for df in dataframes)
                if len(columns_set) > 1:
                    st.warning("⚠️ Atenção: Nem todos os arquivos têm as mesmas colunas! O resultado pode ficar inconsistente.")

                # Mescla os DataFrames
                merged_df = pd.concat(dataframes, ignore_index=True)
                merged_df = merged_df.convert_dtypes()

                # Função para converter o DataFrame em bytes para download
                @st.cache_data
                def convert_df(df: pd.DataFrame, encoding: str) -> bytes:
                    output = BytesIO()
                    df.to_csv(output, index=False, encoding=encoding)
                    return output.getvalue()

                csv_data = convert_df(merged_df, output_encoding_option)

                st.success(f"✔️ {len(dataframes)} arquivos mesclados com sucesso!")

                # Salva o DataFrame mesclado e os dados CSV no estado da sessão
                st.session_state["merged_df"] = merged_df
                st.session_state["csv_data"] = csv_data
                st.session_state["file_name"] = file_name
    else:
        # Mensagem informativa caso os pré-requisitos não sejam atendidos
        st.info("🔔 Envie arquivos e defina configurações antes de mesclar.")

# --- Tab 4: Visualização ---
with tab4:
    if "merged_df" in st.session_state:
        st.subheader("🔍 Visualização do CSV Mesclado")

        # Abas para diferentes modos de visualização
        view_tab1, view_tab2 = st.tabs(["📄 Visualizar Bruto", "📊 Visualizar Melhorado"])

        with view_tab1:
            # Exibe o DataFrame mesclado como está
            st.dataframe(st.session_state["merged_df"], use_container_width=True)

        with view_tab2:
            # Exibe o DataFrame com formatação adicional
            df_to_show = st.session_state["merged_df"].copy()

            # Formata colunas numéricas e de data para melhor visualização
            for col in df_to_show.columns:
                if pd.api.types.is_numeric_dtype(df_to_show[col]):
                    df_to_show[col] = df_to_show[col].apply(lambda x: f"{x:.0f}" if pd.notnull(x) else "")
                elif pd.api.types.is_datetime64_any_dtype(df_to_show[col]):
                    df_to_show[col] = df_to_show[col].dt.strftime('%d/%m/%Y')

            st.dataframe(df_to_show, use_container_width=True)

        # Botão para download do arquivo CSV mesclado
        if "merged_df" in st.session_state:
            st.download_button(
                label="📥 Baixar CSV Mesclado",
                data=st.session_state["csv_data"],
                file_name=st.session_state["file_name"],
                mime="text/csv"
            )

    else:
        # Mensagem informativa caso nenhum CSV tenha sido gerado
        st.info("🔔 Ainda não foi gerado nenhum CSV para visualizar.")