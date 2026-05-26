# Variáveis de Ambiente - CookingBook

## Backend (.env)

```env
# Servidor
PORT=5000
NODE_ENV=development

# Database MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=cookingbook
DB_PORT=3306

# Autenticação JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui
JWT_EXPIRE=7d

# OpenAI API
OPENAI_API_KEY=sk-seu-token-aqui

# Upload de Ficheiros
FILE_UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## Frontend (.env)

```env
# URL da API
REACT_APP_API_URL=http://localhost:5000/api
```

## Notas Importantes

1. **JWT_SECRET**: Gere uma chave aleatória e segura para produção
2. **OPENAI_API_KEY**: Obtenha em https://platform.openai.com/account/api-keys
3. **DB_PASSWORD**: Use uma senha forte para o MySQL em produção
4. **NODE_ENV**: Use "production" no deploy

## Obter Credenciais

### OpenAI
1. Aceda a https://platform.openai.com
2. Crie uma conta ou faça login
3. Vá para API Keys
4. Crie uma nova chave de API
5. Copie e cole no .env

### MySQL
```sql
-- Criar utilizador MySQL para a app
CREATE USER 'cookingbook'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON cookingbook.* TO 'cookingbook'@'localhost';
FLUSH PRIVILEGES;
```
