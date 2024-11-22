import tkinter as tk  # Importa a biblioteca de interface gráfica Tkinter
from tkinter import ttk  # Importa widgets temáticos do Tkinter
from decimal import Decimal, InvalidOperation  # Importa Decimal para cálculos precisos
import math  # Importa funções matemáticas
import re  # Importa expressões regulares para validação

# Dicionário de cores para os botões
button_colors = {
    'C': ('red', 'black'),       # Botão de limpar (vermelho com texto preto)
    'AC': ('red', 'black'),      # Botão de limpar tudo (vermelho com texto preto)
    '=': ('gray', 'white'),      # Botão de resultado (cinza com texto branco)
    #'M+': ('green', 'white'),    # Botão de memória (verde com texto branco)
    #'MR': ('blue', 'white'),     # Botão de recall de memória (azul com texto branco)
    #'sin': ('purple', 'white'),  # Botões científicos (roxo com texto branco)
    #'cos': ('purple', 'white'),
    #'tan': ('purple', 'white'),
    #'√': ('purple', 'white'),
    #'log': ('orange', 'black'),  # Botões de funções logarítmicas (laranja com texto preto)
    #'ln': ('orange', 'black'),
}

class Calculator:
    def __init__(self):
        # Configura a janela principal da calculadora
        self.root = tk.Tk()
        self.root.title("Calculadora Científica")  # Define o título da janela
        
        # Configuração de responsividade para a janela
        self.root.grid_columnconfigure(0, weight=1)
        self.root.grid_rowconfigure(0, weight=1)
        
        # Variáveis para armazenar estado
        self.result_var = tk.StringVar()  # Variável para armazenar texto do display
        self.memory = 0  # Memória da calculadora
        self.history = []  # Histórico de cálculos
        
        # Método para criar a interface gráfica
        self.create_gui()
        
        # Configura atalhos de teclado
        self.setup_keyboard_shortcuts()

    def create_gui(self):
        # Cria o frame principal com preenchimento
        main_frame = ttk.Frame(self.root, padding="5")
        main_frame.grid(sticky="nsew")
        
        # Configura grid responsiva
        for i in range(8):
            main_frame.grid_columnconfigure(i, weight=1)
            main_frame.grid_rowconfigure(i, weight=1)

        # Configura estilos personalizados
        style = ttk.Style()
        style.configure('Calculator.TButton', font=('Arial', 12))
        style.configure('Display.TEntry', font=('Arial', 32))
        
        # Cria o display principal
        self.result_entry = ttk.Entry(
            main_frame, 
            textvariable=self.result_var,
            justify='right',
            style='Display.TEntry',
        )
        self.result_entry.grid(row=0, column=0, columnspan=8, sticky="nsew", padx=5, pady=5)
        
        # Cria área de histórico
        self.history_text = tk.Text(main_frame, height=2, width=40, font=('Arial', 10))
        self.history_text.grid(row=1, column=0, columnspan=8, sticky="nsew", padx=5, pady=5)
        
        # Definição dos botões da calculadora
        buttons = [
            # Primeira linha - Funções de memória e científicas
            ('MC', self.memory_clear, 2, 0), 
            ('MR', self.memory_recall, 2, 1),
            ('M+', self.memory_add, 2, 2), 
            ('M-', self.memory_subtract, 2, 3),
            ('sin', lambda: self.scientific_function('sin'), 2, 4),
            ('cos', lambda: self.scientific_function('cos'), 2, 5),
            ('tan', lambda: self.scientific_function('tan'), 2, 6),
            ('√', lambda: self.scientific_function('sqrt'), 2, 7),
            
            # Segunda linha
            ('7', lambda: self.append_digit('7'), 3, 0),
            ('8', lambda: self.append_digit('8'), 3, 1),
            ('9', lambda: self.append_digit('9'), 3, 2),
            ('/', lambda: self.append_operator('/'), 3, 3),
            ('(', lambda: self.append_digit('('), 3, 4),
            (')', lambda: self.append_digit(')'), 3, 5),
            ('n!', lambda: self.scientific_function('factorial'), 3, 6),
            ('x²', lambda: self.scientific_function('square'), 3, 7),
            
            # Terceira linha
            ('4', lambda: self.append_digit('4'), 4, 0),
            ('5', lambda: self.append_digit('5'), 4, 1),
            ('6', lambda: self.append_digit('6'), 4, 2),
            ('*', lambda: self.append_operator('*'), 4, 3),
            ('π', lambda: self.append_digit(str(math.pi)), 4, 4),
            ('e', lambda: self.append_digit(str(math.e)), 4, 5),
            ('log', lambda: self.scientific_function('log'), 4, 6),
            ('ln', lambda: self.scientific_function('ln'), 4, 7),
            
            # Quarta linha
            ('1', lambda: self.append_digit('1'), 5, 0),
            ('2', lambda: self.append_digit('2'), 5, 1),
            ('3', lambda: self.append_digit('3'), 5, 2),
            ('-', lambda: self.append_operator('-'), 5, 3),
            ('±', self.toggle_sign, 5, 4),
            ('mod', lambda: self.append_operator('%'), 5, 5),
            ('x^y', lambda: self.append_operator('**'), 5, 6),
            ('1/x', lambda: self.scientific_function('inverse'), 5, 7),
            
            # Quinta linha
            ('0', lambda: self.append_digit('0'), 6, 0),
            ('.', lambda: self.append_digit('.'), 6, 1),
            ('=', self.calculate, 6, 2),
            ('+', lambda: self.append_operator('+'), 6, 3),
            ('C', self.clear_last, 6, 4),
            ('AC', self.clear_all, 6, 5),
            ('DEL', self.delete_last, 6, 6),
            ('Ans', self.use_last_answer, 6, 7),
        ]
        
        # Criar os botões com estilo responsivo e cores personalizadas
        for (text, command, row, col) in buttons:
            # Obtém as cores do botão do dicionário, com padrão cinza/preto
            bg_color, fg_color = button_colors.get(text, ('lightgray', 'black'))
            
            # Cria botão com cores personalizadas
            btn = tk.Button(
                main_frame,
                text=text,
                command=command,
                font=('Arial', 12),
                bg=bg_color,
                fg=fg_color
            )
            
            # Posiciona o botão na grade
            btn.grid(row=row, column=col, sticky="nsew", padx=2, pady=2)
            
    def setup_keyboard_shortcuts(self):
        # Configura atalhos de teclado para diferentes funções
        self.root.bind('<Return>', lambda e: self.calculate())  # Enter para calcular
        self.root.bind('<BackSpace>', lambda e: self.delete_last())  # Backspace para apagar
        self.root.bind('<Escape>', lambda e: self.clear_all())  # Escape para limpar tudo
        
        # Mapeia teclas numéricas e operadores
        for key in '0123456789+-*/().':
            self.root.bind(key, lambda e, k=key: self.append_digit(k))
            
    def append_digit(self, digit):
        # Adiciona dígitos ou caracteres ao display
        current = self.result_var.get()
        if len(current) < 25:  # Limite de caracteres
            self.result_var.set(current + str(digit))
            
    def append_operator(self, operator):
        # Adiciona operadores ao display
        current = self.result_var.get()
        if current and current[-1] not in '+-*/.':
            self.result_var.set(current + operator)
            
    def clear_last(self):
        # Limpa o último dígito ou caractere
        self.result_var.set("")
        
    def clear_all(self):
        # Limpa todo o display e histórico
        self.result_var.set("")
        self.history_text.delete(1.0, tk.END)
        
    def delete_last(self):
        # Remove o último caractere do display
        current = self.result_var.get()
        self.result_var.set(current[:-1])
        
    def toggle_sign(self):
        # Alterna o sinal do número
        try:
            current = self.result_var.get()
            if current:
                if current[0] == '-':
                    self.result_var.set(current[1:])
                else:
                    self.result_var.set('-' + current)
        except Exception as e:
            self.result_var.set("Error")
            
    def memory_clear(self):
        # Limpa a memória
        self.memory = 0
        
    def memory_recall(self):
        # Recupera o valor da memória
        self.result_var.set(str(self.memory))
        
    def memory_add(self):
        # Adiciona o valor atual à memória
        try:
            result = self.safe_eval(self.result_var.get())
            self.memory += result
        except:
            pass
            
    def memory_subtract(self):
        # Subtrai o valor atual da memória
        try:
            result = self.safe_eval(self.result_var.get())
            self.memory -= result
        except:
            pass
            
    def scientific_function(self, func):
        # Executa funções científicas
        try:
            current = self.safe_eval(self.result_var.get())
            if func == 'sin':
                result = math.sin(math.radians(current))
            elif func == 'cos':
                result = math.cos(math.radians(current))
            elif func == 'tan':
                result = math.tan(math.radians(current))
            elif func == 'sqrt':
                result = math.sqrt(current)
            elif func == 'factorial':
                result = math.factorial(int(current))
            elif func == 'square':
                result = current ** 2
            elif func == 'log':
                result = math.log10(current)
            elif func == 'ln':
                result = math.log(current)
            elif func == 'inverse':
                result = 1 / current
            self.result_var.set(str(result))
        except Exception as e:
            self.result_var.set("Error")
            
    def use_last_answer(self):
        # Usa o último resultado do histórico
        if self.history:
            last_result = self.history[-1].split('=')[1].strip()
            self.result_var.set(last_result)
            
    def safe_eval(self, expr):
        # Avaliação segura de expressões
        try:
            # Limpar a expressão para garantir segurança
            cleaned_expr = re.sub(r'[^0-9+\-*/().%]', '', expr)
            # Usar Decimal para maior precisão
            return float(eval(cleaned_expr, {"__builtins__": {}}, {"Decimal": Decimal}))
        except (SyntaxError, InvalidOperation) as e:
            raise ValueError("Expressão inválida")
            
    def calculate(self):
        # Calcula o resultado da expressão
        try:
            expr = self.result_var.get()
            result = self.safe_eval(expr)
            # Formatar o resultado para evitar números muito longos
            formatted_result = f"{result:.10g}"
            # Adicionar ao histórico
            history_entry = f"{expr} = {formatted_result}\n"
            self.history_text.insert(tk.END, history_entry)
            self.history_text.see(tk.END)
            self.history.append(history_entry)
            # Atualizar o display
            self.result_var.set(formatted_result)
        except Exception as e:
            self.result_var.set("Error")
            
    def run(self):
        # Define tamanho mínimo da janela
        self.root.minsize(400, 500)
        # Inicia o loop principal da interface
        self.root.mainloop()

# Ponto de entrada do programa
if __name__ == "__main__":
    calc = Calculator()
    calc.run()