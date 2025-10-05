# Enem AI

Plataforma completa para preparação para o ENEM com inteligência artificial, anotações inteligentes e comunidade de estudos.

## Descrição

O Enem AI é uma aplicação web que ajuda estudantes do ensino médio a se prepararem para o ENEM através de:

- Chat com IA especializada nas competências do ENEM
- Editor de anotações com funcionalidades avançadas
- Comunidade de estudos para interação entre alunos e professores
- Sistema de autenticação seguro

## Tecnologias

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **Autenticação**: Supabase Auth
- **Banco de Dados**: Supabase Postgres
- **Armazenamento**: Supabase Storage
- **Tempo Real**: Supabase Realtime

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── integrations/        # Integrações com serviços externos
├── pages/               # Páginas da aplicação
├── lib/                 # Funções utilitárias
└── hooks/               # Hooks personalizados
```

## Configuração Inicial

1. **Configurar Supabase**:
   - Crie um projeto no [Supabase](https://supabase.io/)
   - Copie as credenciais do projeto (URL e chave anônima)
   - Configure as variáveis de ambiente no arquivo `.env`

2. **Instalar dependências**:
   ```bash
   npm install
   ```

3. **Executar a aplicação**:
   ```bash
   npm run dev
   ```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Funcionalidades

### 1. Chat com IA
- Conversas com agentes especializados em cada área do ENEM
- Histórico de conversas salvo
- Interface escura e intuitiva

### 2. Anotações
- Editor rico de texto (negrito, itálico, listas, etc.)
- Organização por tags
- Exportação para HTML
- Salvamento automático

### 3. Comunidade
- Criação de tópicos de discussão
- Sistema de comentários
- Atualizações em tempo real

### 4. Autenticação
- Registro e login com email/senha
- Proteção de rotas
- Perfil de usuário

## Banco de Dados

O projeto utiliza as seguintes tabelas no Supabase:

1. **profiles** - Informações do usuário
2. **notes** - Anotações dos usuários
3. **chat_conversations** - Histórico de conversas
4. **community_posts** - Posts da comunidade
5. **comments** - Comentários nos posts

## Deploy

### Vercel
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Faça o deploy

### Supabase
1. Configure o projeto Supabase
2. Execute os scripts SQL para criar as tabelas
3. Configure as políticas de segurança

## Desenvolvimento

### Estrutura de Componentes
- Componentes reutilizáveis em `src/components/`
- Páginas em `src/pages/`
- Layouts em `src/components/layout/`

### Estilização
- Utiliza Tailwind CSS para estilização
- Tema escuro como padrão
- Cores principais: roxo (#8B5CF6) para elementos interativos

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## Contato

Seu Nome - [@seu_usuario](https://twitter.com/seu_usuario)

Link do Projeto: [https://github.com/seu_usuario/enem-ai](https://github.com/seu_usuario/enem-ai)