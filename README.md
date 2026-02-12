n# BeautyStock 🌸

Sistema de controle de estoque simples para lojas de cosméticos e perfumes. MVP enxuto com React + Supabase.

> 📘 **Project Context**: For detailed architecture, design system, and changelog, see [project_context.md](./project_context.md).

## 🚀 Funcionalidades

- **Autenticação**: Login e Cadastro (Supabase Auth).
- **Produtos**: CRUD completo com nome, categoria, preço, custo.
- **Variações**: Gerenciamento de variações (ex: 50ml, 100ml / Vermelho, Rosa) por produto.
- **Movimentações**: Registro de entradas e saídas (vendas) que atualizam o estoque.
- **Dashboard**: Visão geral de lucro, vendas e estoque.
- **Alertas**: Indicadores de estoque baixo.

## 🛠️ Stack Tecnológica

- **Frontend**: React, Vite
- **Estilização**: CSS Modules / CSS Puro (Simples e Performático)
- **Backend & Banco**: Supabase (PostgreSQL + Auth)
- **Ícones**: Lucide React
- **Notificações**: React Hot Toast

## 📂 Estrutura de Pastas

```
/src
  /components    # Componentes reutilizáveis (Sidebar, Layout, etc)
  /contexts      # Contextos (Auth)
  /lib           # Configurações (Supabase)
  /pages         # Páginas da aplicação
    /Products    # Listagem e Formulário de Produtos
    Login.jsx
    Dashboard.jsx
    Movements.jsx
  App.jsx        # Rotas
  index.css      # Estilos globais
```

## 🏃‍♂️ Como Rodar Localmente

1. **Clone o projeto**
   ```bash
   git clone <seu-repo>
   cd BeautyStock
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configurar Supabase**
   - Crie um projeto no [Supabase](https://supabase.com).
   - Vá em `SQL Editor` e rode o script contido no arquivo `supabase_schema.sql` na raiz deste projeto.
   - Isso criará as tabelas `products`, `variations`, `movements` e configurará as políticas de segurança.

4. **Variáveis de Ambiente**
   - Renomeie `.env.example` para `.env`.
   - Preencha com suas chaves do Supabase:
     ```
     VITE_SUPABASE_URL=https://seu-projeto.supabase.co
     VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
     ```

5. **Rodar o projeto**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:5173`.

## ☁️ Como Fazer Deploy na Vercel

1. Crie uma conta na [Vercel](https://vercel.com).
2. Instale a Vercel CLI ou conecte seu repositório GitHub.
3. Se usar GitHub:
   - Push do código para o GitHub.
   - Importe o projeto no dashboard da Vercel.
   - Nas configurações de "Environment Variables", adicione:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Clique em **Deploy**.

4. **Configuração de URL no Supabase**:
   - No painel do Supabase, vá em `Authentication` > `URL Configuration`.
   - Adicione a URL do seu site (ex: `https://beautystock.vercel.app`) em "Site URL" e "Redirect URLs".

## 📝 Script SQL
O banco de dados deve ser criado usando o script abaixo (já incluído no projeto):

```sql
-- Executar no SQL Editor do Supabase
-- (Conteúdo completo em supabase_schema.sql)
```
