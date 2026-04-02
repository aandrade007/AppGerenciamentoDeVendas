# 🛒 App de Gerenciamento de Vendas

Sistema para registro de transações, controle de estoque e geração de relatórios de performance.

---
<br>

## 📅 Cronograma de Entregas

* **Entrega 01:** Backlog do Produto Priorizado, Sprints, User Stories e Protótipo Figma.
* **Entrega 02:** Implementação de 4 funcionalidades (Front-end em JavaScript).
* **Entrega 03:** Implementação de 4 funcionalidades (Full-stack: Front + Back-end).

---

## 📋 Product Backlog Priorizado

### 🏃 Sprint 1: Interface e Fluxo de Venda (Foco: Entrega 02 - Front)
Objetivo: Criar a experiência do usuário e as lógicas de interface sem persistência em banco de dados (usando apenas JS no Front).

1.  **US01 - Autenticação (Interface):** Como vendedor, quero ver uma tela de login para entender como acessarei o sistema.
2.  **US02 - Busca de Produtos:** Como vendedor, quero filtrar produtos por nome em tempo real para agilizar a venda.
3.  **US03 - Carrinho de Compras:** Como vendedor, quero adicionar itens a um carrinho e ver o cálculo automático do total da venda.
4.  **US04 - Cadastro de Produtos (Interface):** Como gerente, quero um formulário validado para cadastrar novos itens no estoque.

### 🏃 Sprint 2: Integração e Persistência (Foco: Entrega 03 - Full-stack)
Objetivo: Conectar a interface a um servidor e banco de dados para tornar o sistema funcional e persistente.

5.  **US05 - Login com JWT:** Como sistema, quero validar as credenciais no servidor para garantir acesso seguro.
6.  **US06 - Registro de Venda Real:** Como vendedor, quero finalizar a compra e que o sistema dê baixa automática no estoque no banco de dados.
7.  **US07 - Dashboard de Performance:** Como gerente, quero ver o faturamento total do dia baseado nas vendas reais registradas.
8.  **US08 - Alerta de Reposição:** Como sistema, quero identificar produtos com estoque abaixo de 5 unidades e exibir um alerta visual.

### 🏃 Sprint 3: Relatórios de Performance
Objetivo: Gerar métricas e relatórios avançados para apoiar a tomada de decisão da gestão.

9.  **US09 - Relatório de Curva ABC:** Como gerente, quero visualizar quais são os produtos mais e menos vendidos para otimizar as compras.
10. **US10 - Histórico de Vendas:** Como gerente, quero visualizar uma lista detalhada das transações concluídas filtradas por período.
11. **US11 - Exportação de Dados:** Como gerente, quero exportar os relatórios de faturamento para arquivo PDF.
12. **US12 - Controle de Acesso:** Como sistema, quero restringir o acesso à aba de relatórios apenas para usuários com perfil de gerente.
