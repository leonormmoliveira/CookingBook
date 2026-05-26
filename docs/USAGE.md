# 🚀 Guia de Uso - CookingBook

## Status Atual
- ✅ Criação de receitas com nome, modo de preparação e imagem (base64)
- ✅ Categorias personalizadas criadas pelo utilizador
- ✅ Listagem de receitas com filtro por categoria
- ⏳ Sem autenticação ainda (usa user_id = 1 fixo)

## Como Começar

### 1. Setup da Base de Dados
```bash
# Executar o script de criação
mysql -u root -p < database/schema.sql
```

### 2. Backend
```bash
cd backend

# Criar ficheiro .env
cp .env.example .env

# Editar .env com as suas credenciais MySQL
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=
# DB_NAME=cookingbook

# Instalar dependências
npm install

# Iniciar servidor
npm run dev
```

O servidor rodará em `http://localhost:5000`

### 3. Frontend
```bash
cd frontend

# Instalar dependências
npm install

# Iniciar aplicação
npm start
```

A aplicação rodará em `http://localhost:3000`

## 📋 Fluxo de Uso

### Criar Receita
1. Clique em "➕ Criar Receita"
2. Preencha o nome da receita
3. Selecione uma categoria ou crie uma nova
4. Faça upload de uma imagem (será convertida a base64)
5. Escreva o modo de preparação
6. Clique em "✅ Guardar Receita"

### Ver Minhas Receitas
1. Clique em "📖 Minhas Receitas"
2. Filtre por categoria se necessário
3. Veja a lista de todas as suas receitas

## 🔧 Endpoints da API

### Receitas
- `GET /api/recipes` - Listar todas as receitas
- `POST /api/recipes` - Criar nova receita
- `GET /api/recipes/:id` - Obter receita por ID
- `PUT /api/recipes/:id` - Atualizar receita
- `DELETE /api/recipes/:id` - Eliminar receita
- `GET /api/recipes/category/:category` - Receitas por categoria
- `GET /api/recipes/search?q=termo` - Pesquisar receitas

### Categorias
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `PUT /api/categories/:id` - Atualizar categoria
- `DELETE /api/categories/:id` - Eliminar categoria

### Favoritos
- `GET /api/favorites` - Listar favoritos
- `POST /api/favorites/:recipeId` - Adicionar favorito
- `DELETE /api/favorites/:recipeId` - Remover favorito

## 📝 Formato de Dados

### Criar/Atualizar Receita
```json
{
  "title": "Bolo de Chocolate",
  "preparation": "Descrição do modo de preparação...",
  "category": "Doces",
  "image": "data:image/png;base64,iVBORw0KG..."
}
```

A imagem é armazenada como base64 na coluna `image_url` da tabela `recipes`.

## ⚠️ Notas Importantes

- **Sem Autenticação**: Por enquanto, todas as operações usam `user_id = 1` (fixo)
- **Próxima Fase**: Implementar autenticação JWT completa
- **Imagens**: Limite recomendado: imagens pequenas para melhor performance (até 2-3MB)

## 🔜 Próximas Features

- [ ] Autenticação JWT completa
- [ ] Análise de vídeos com OpenAI
- [ ] Sistema de partilha de receitas
- [ ] Editar e eliminar receitas
- [ ] Página detalhes da receita
- [ ] Busca avançada
- [ ] Testes e2e

Bom apetite! 🍳
