# CookingBook - Projeto de Gestão de Receitas

## 📋 Descrição
Aplicação web full-stack para gestão pessoal de receitas com análise de vídeos usando OpenAI API. Permite aos utilizadores criar, organizar e partilhar receitas, com suporte a análise automática de vídeos para geração de receitas.

## 🏗️ Arquitetura

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: MySQL
- **Autenticação**: JWT (tokens de sessão armazenados em BD)
- **IA**: OpenAI API para análise de vídeos

### Frontend
- **Framework**: React 18
- **UI Components**: Ionic Framework v7
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

### Database
- **Engine**: MySQL 8.0+
- **Tabelas**: users, categories, recipes, favorites, sharing_links, video_analysis

## 📁 Estrutura do Projeto

```
CookingBook/
├── backend/
│   ├── config/
│   │   └── database.js          # Configuração MySQL
│   ├── middleware/
│   │   └── authMiddleware.js    # Autenticação JWT
│   ├── routes/
│   │   ├── auth.js
│   │   ├── recipes.js
│   │   ├── categories.js
│   │   ├── favorites.js
│   │   ├── sharing.js
│   │   └── videoAnalysis.js
│   ├── controllers/             # Lógica de negócio (TODO)
│   ├── uploads/                 # Armazenamento de imagens
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   ├── RecipeDetailPage.js
│   │   │   ├── CreateRecipePage.js
│   │   │   ├── CategoriesPage.js
│   │   │   ├── FavoritesPage.js
│   │   │   └── VideoAnalysisPage.js
│   │   ├── components/          # Componentes reutilizáveis (TODO)
│   │   ├── services/
│   │   │   ├── api.js           # Cliente HTTP
│   │   │   └── recipeService.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── database/
│   └── schema.sql               # Script de criação do BD
│
├── docs/
│   └── API.md                   # Documentação da API (TODO)
│
├── .github/
│   └── copilot-instructions.md
│
└── README.md
```

## 🚀 Começar a Desenvolver

### Pré-requisitos
- Node.js 16+
- MySQL 8.0+
- npm ou yarn

### 1. Configurar Base de Dados
```bash
mysql -u root -p < database/schema.sql
```

### 2. Configurar Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env com as suas credenciais
npm run dev
```

### 3. Configurar Frontend
```bash
cd frontend
npm install
npm start
```

## 🔑 Recursos Principais

### ✅ Implementado
- Estrutura de pastas e arquivos base
- Configuração MySQL com pool de conexões
- Rotas API básicas (stubs)
- Middleware de autenticação JWT
- Componentes Ionic React para interface
- Styling com Tailwind CSS
- Cliente HTTP com Axios

### 📝 Por Fazer
- Implementar controladores de negócio (CRUD)
- Autenticação completa (registro/login)
- Integração OpenAI API para análise de vídeos
- Upload de imagens
- Sistema de favoritos e partilha
- Pesquisa e filtragem
- Testes unitários
- Deploy

## 📚 API Endpoints (Planejado)

### Autenticação
- `POST /api/auth/register` - Registrar novo utilizador
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/logout` - Fazer logout
- `GET /api/auth/profile` - Obter perfil do utilizador

### Receitas
- `GET /api/recipes` - Listar receitas
- `POST /api/recipes` - Criar receita
- `GET /api/recipes/:id` - Obter detalhes
- `PUT /api/recipes/:id` - Atualizar receita
- `DELETE /api/recipes/:id` - Eliminar receita

### Categorias
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `PUT /api/categories/:id` - Atualizar
- `DELETE /api/categories/:id` - Eliminar

### Favoritos
- `GET /api/favorites` - Listar favoritos
- `POST /api/favorites/:recipeId` - Adicionar favorito
- `DELETE /api/favorites/:recipeId` - Remover favorito

### Análise de Vídeos
- `POST /api/video-analysis` - Analisar vídeo e gerar receita

### Partilha
- `GET /api/sharing/:recipeId` - Gerar link partilha
- `POST /api/sharing/:recipeId` - Criar link partilha

## ⚙️ Variáveis de Ambiente

### Backend (.env)
```
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=cookingbook
DB_PORT=3306

JWT_SECRET=sua_chave_secreta
JWT_EXPIRE=7d

OPENAI_API_KEY=sua_chave_openai
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🎨 Design
- Layout minimalista e limpo
- Paleta de cores: azul (#0066cc) como primária
- Componentes Ionic para mobile-first
- Responsivo em todos os dispositivos
- Sem uso de localStorage (dados em BD)

## 📄 Licença
ISC

## 👨‍💻 Autor
CookingBook Team

---

**Status**: 🔨 Em Desenvolvimento - Bases Criadas
