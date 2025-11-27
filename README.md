# EnemAI - Project Documentation

Este documento fornece uma visão geral técnica do projeto **EnemAI** para garantir a compatibilidade e facilitar a manutenção e desenvolvimento futuro.

## 🛠 Tech Stack

### Core
- **Framework:** [React](https://react.dev/) (v18.3.1)
- **Build Tool:** [Vite](https://vitejs.dev/) (v6.3.4)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (v5.5.3)
- **Package Manager:** pnpm (inferido pelo `pnpm-lock.yaml`)

### Estilização & UI
- **CSS Framework:** [Tailwind CSS](https://tailwindcss.com/) (v3.4.11)
- **Component Library:** [shadcn/ui](https://ui.shadcn.com/) (baseado em Radix UI)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/) & `tailwindcss-animate`
- **Utils:** `clsx`, `tailwind-merge`, `class-variance-authority` (CVA)

### Gerenciamento de Estado & Data Fetching
- **Server State:** [TanStack Query](https://tanstack.com/query/latest) (React Query v5)
- **Local State:** React Context & Hooks

### Backend & Autenticação
- **Service:** [Supabase](https://supabase.com/)
- **SDK:** `@supabase/supabase-js` & `@supabase/auth-ui-react`

### Roteamento
- **Router:** [React Router DOM](https://reactrouter.com/) (v6.26.2)

### Formulários & Validação
- **Forms:** [React Hook Form](https://react-hook-form.com/)
- **Validation:** [Zod](https://zod.dev/) (`@hookform/resolvers`)

### Outras Bibliotecas Importantes
- **Markdown/Math:** `react-markdown`, `katex`, `rehype-katex`, `remark-math`, `react-quill` (Editor de texto rico)
- **Charts:** `recharts`
- **Utilities:** `date-fns` (manipulação de datas), `sonner` (toasts)

## 📂 Estrutura do Projeto

A estrutura de diretórios segue o padrão Vite + React:

```
/src
  ├── /components    # Componentes reutilizáveis (UI, layout, etc.)
  ├── /context       # Contextos do React (ex: Auth, Theme)
  ├── /hooks         # Custom Hooks
  ├── /integrations  # Integrações externas (ex: Supabase)
  ├── /lib           # Configurações de bibliotecas (utils, utils do shadcn)
  ├── /pages         # Páginas da aplicação (rotas)
  ├── /utils         # Funções utilitárias gerais
  ├── App.tsx        # Componente raiz e definição de rotas
  ├── main.tsx       # Ponto de entrada da aplicação
```

## 🌟 Funcionalidades do Sistema

O **EnemAI** é uma plataforma educacional focada no ENEM, integrando IA, ferramentas de estudo e comunidade.

### 1. 🤖 Chat com IA (Tutor ENEM AI)
O coração da plataforma. Um assistente virtual inteligente para tirar dúvidas.
- **Engine:** Utiliza a API da **Groq** (`openai/gpt-oss-120b`) para respostas rápidas e precisas.
- **Funcionalidades:**
    - **Múltiplos Agentes:** Arquitetura preparada para suportar diferentes personas (atualmente focado no "Tutor ENEM AI").
    - **Histórico de Conversas:** As conversas são salvas no Supabase (`chat_conversations`), permitindo retomar estudos anteriores.
    - **Typing Effect:** Simulação de digitação para uma experiência mais natural.
    - **Contexto:** A IA pode ser alimentada com anotações do usuário para respostas personalizadas.

### 2. 📝 Anotações Inteligentes (Notes)
Um caderno virtual completo para organização dos estudos.
- **Editor Rico:** Utiliza **ReactQuill** para formatação de texto (negrito, listas, links, imagens).
- **Gerenciamento:** CRUD completo (Criar, Ler, Atualizar, Deletar) de anotações.
- **Exportação:** Permite exportar anotações como arquivos HTML.
- **Estatísticas:** Dashboard com contagem total de anotações e criadas no dia.
- **Busca:** Filtro em tempo real por título e conteúdo.

### 3. 👥 Comunidade
Um fórum para interação entre estudantes.
- **Discussões:** Criação de tópicos com título, conteúdo e tags (Matemática, Redação, Dúvida, etc.).
- **Filtros:** Busca por texto e filtragem por tags específicas.
- **Perfis:** Visualização básica de perfil dos usuários (integrado com a tabela `profiles` do Supabase).
- **Interação:** Sistema preparado para comentários e likes (estrutura de dados presente).
- **Backend Social:** O arquivo `src/lib/social.ts` já contém a lógica para mensagens diretas (`openOrCreateConversation`) e comentários aninhados, pronto para expansão futura.

### 4. 🎓 Simulados (Feature em Desenvolvimento)
*Nota: Esta funcionalidade existe no código (`src/pages/Simulado.tsx`) mas não está acessível via menu principal atualmente.*
- **Motor de Questões:** Suporte a questões com texto base, enunciado e alternativas.
- **Timer:** Cronômetro para simular o tempo real de prova.
- **Correção Automática:** Feedback imediato e cálculo de score ao finalizar.
- **Persistência:** Resultados salvos na tabela `simulados`.

## 🔐 Autenticação e Segurança
- **Supabase Auth:** Gerenciamento completo de usuários (Login, Registro, Recuperação de Senha).
- **Proteção de Rotas:** Componente `ProtectedRoute` garante que apenas usuários autenticados acessem as áreas internas.
- **RLS (Row Level Security):** As tabelas do banco de dados possuem políticas de segurança para garantir que usuários acessem apenas seus próprios dados (notas, conversas, simulados).

## 🚀 Scripts Disponíveis

No diretório do projeto, você pode rodar:

- `npm run dev` ou `pnpm dev`: Inicia o servidor de desenvolvimento.
- `npm run build` ou `pnpm build`: Compila o app para produção.
- `npm run lint` ou `pnpm lint`: Executa o ESLint para verificar problemas no código.
- `npm run preview` ou `pnpm preview`: Visualiza a build de produção localmente.

## ⚠️ Notas de Compatibilidade

1.  **Node.js**: Recomenda-se usar uma versão LTS recente do Node.js (v18+ ou v20+), compatível com Vite 5/6.
2.  **TypeScript**: O projeto está configurado com `strict: true` (provavelmente). Mantenha a tipagem forte para evitar erros de build.
3.  **Tailwind**: A configuração do Tailwind (`tailwind.config.ts`) inclui plugins como `tailwindcss-animate`. Ao adicionar novos plugins, verifique a compatibilidade.
4.  **Supabase**: As chaves de API e URL do Supabase devem estar configuradas nas variáveis de ambiente (`.env` ou `.env.local`).
5.  **Shadcn UI**: Ao adicionar novos componentes do shadcn, use a CLI ou copie manualmente garantindo que as dependências (Radix UI) sejam instaladas.

---