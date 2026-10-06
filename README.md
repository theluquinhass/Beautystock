# BeautyStock 🌸

**Sistema de gestão para revendedoras de perfumes, maquiagem e cosméticos.**

O BeautyStock nasceu para substituir o controle feito em cadernos e planilhas por uma ferramenta simples, moderna e pensada para quem vende pelo WhatsApp.

## ✨ Principais funcionalidades

- 📦 Controle de estoque
- 🛍️ Cadastro e gerenciamento de produtos
- 🔄 Entradas e saídas de estoque
- 💰 Acompanhamento de vendas e lucro
- 👥 Gestão de clientes
- 💳 Controle de valores a receber
- 🏷️ Categorias e variações de produtos
- 📊 Dashboard com indicadores
- 📱 Interface responsiva e mobile-first
- 🛒 Catálogo online
- 📤 Exportação de dados
- 🤖 Recursos de assistência inteligente

## 🛠️ Stack

**Frontend**
- React
- Vite
- TypeScript/JavaScript
- Tailwind CSS
- React Router
- Lucide React
- Recharts

**Backend**
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Edge Functions

**Outros**
- PWA
- Vitest
- Zod
- XLSX

## 🏗️ Arquitetura

O projeto é organizado em componentes reutilizáveis, páginas, hooks, contextos e serviços, mantendo a interface separada das regras de negócio e da camada de dados.

A autenticação e os dados da aplicação são gerenciados pelo Supabase, enquanto o frontend é construído com React e Vite.

## 🚀 Executando localmente

```bash
git clone https://github.com/theluquinhass/Beautystock.git
cd Beautystock
npm install
npm run dev
```

Para conectar ao Supabase, configure as variáveis de ambiente necessárias no arquivo `.env`.

## 🎯 Objetivo

Criar uma experiência de gestão mais simples para pequenas revendedoras, com foco em **estoque, vendas, clientes e lucro**, sem a complexidade de um ERP tradicional.

## 📌 Status

**Em desenvolvimento / evolução contínua.**

O BeautyStock é um dos principais projetos do meu portfólio e também um produto SaaS em desenvolvimento.
