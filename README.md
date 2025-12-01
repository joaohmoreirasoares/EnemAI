# 🚀 EnemAI - Plataforma de Estudos Inteligente

Bem-vindo ao **EnemAI**, uma plataforma educacional de ponta projetada para revolucionar a preparação para o ENEM. Combinando Inteligência Artificial avançada, ferramentas de organização de estudos e uma comunidade vibrante, o EnemAI oferece uma experiência de aprendizado personalizada e envolvente.

![EnemAI Banner](https://placehold.co/1200x400/8B5CF6/FFFFFF?text=EnemAI+Platform)

## 🌟 Visão Geral

O EnemAI não é apenas um banco de questões. É um ecossistema completo que utiliza a **KIAra**, nossa tutora virtual, para guiar os estudantes. Com um design moderno baseado em **Glassmorphism** e interações fluidas, a plataforma torna o estudo visualmente agradável e eficiente.

## 🛠 Tech Stack & Arquitetura

O projeto foi construído com as tecnologias mais modernas do ecossistema React, priorizando performance, acessibilidade e experiência do desenvolvedor.

### Core
- **Framework:** [React](https://react.dev/) (v18)
- **Build Tool:** [Vite](https://vitejs.dev/) (v6) - *Builds ultra-rápidos*
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (v5) - *Segurança de tipos*
- **Gerenciador de Pacotes:** pnpm

### UI & UX (Visual Patterns)
O design system segue uma estética **Dark Mode Premium** com elementos de vidro (Glassmorphism).
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) (v3.4)
- **Componentes:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI headless)
- **Animações:** [Framer Motion](https://www.framer.com/motion/) (Transições de página, micro-interações)
- **Efeitos Visuais:**
    - `tsparticles`: Partículas de fundo interativas.
    - `ogl`: WebGL para efeitos fluidos (LiquidEther).
    - `lenis`: Smooth scrolling para navegação suave.
- **Ícones:** [Lucide React](https://lucide.dev/)

### Estado & Dados
- **Server State:** [TanStack Query](https://tanstack.com/query/latest) (v5) - *Cache, Revalidação, Optimistic Updates*
- **Local State:** React Context API (`AccessibilityContext`, `SimuladoModalContext`)
- **Backend:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)

### Ferramentas Específicas
- **IA:** Integração com LLMs via API (Groq/OpenAI).
- **Editor de Texto:** `react-quill` (Rich Text para anotações).
- **Utilitários:** `date-fns` (Datas), `sonner` (Toasts), `zod` (Validação).

---

## 📂 Estrutura do Projeto

Uma visão detalhada da organização do código para facilitar a navegação:

```
/src
├── /components          # Blocos de construção da UI
│   ├── /accessibility   # Componentes de acessibilidade (AccessibilityHelper)
│   ├── /chat            # Componentes do Chat (Input, Mensagens, Cards)
│   ├── /community       # Componentes da Comunidade (Cards, Leaderboard)
│   ├── /layout          # Sidebar, Layouts de página
│   ├── /notes           # Componentes de Notas (Editor, Grafo)
│   ├── /ui              # Componentes base do shadcn (Button, Card, Input...)
│   └── ...
├── /context             # Gerenciamento de estado global
│   ├── AccessibilityContext.tsx  # Controle do modo de acessibilidade
│   └── ...
├── /hooks               # Custom Hooks (use-toast, use-mobile)
├── /integrations        # Configuração de serviços externos (Supabase)
├── /lib                 # Lógica de negócios e utilitários
│   ├── agent-tools.ts   # Definição das ferramentas da IA (Function Calling)
│   ├── social.ts        # Lógica de interação social
│   └── utils.ts         # Helpers de classe (cn)
├── /pages               # Rotas da aplicação (React Router)
│   ├── Chat.tsx         # Interface principal do Chat
│   ├── Notes.tsx        # Gerenciamento de Anotações
│   ├── Community.tsx    # Feed e Diretório da Comunidade
│   ├── Profile.tsx      # Perfil do Usuário
│   └── ...
├── App.tsx              # Configuração de Rotas e Providers
└── main.tsx             # Ponto de entrada
```

---

## 🤖 KIAra: Sua Tutora Inteligente

A **KIAra** (Knowledge & Intelligence Artificial helper) é o coração da inteligência do EnemAI. Ela não apenas responde perguntas, mas interage com o ambiente do usuário através de **Tools**.

### Capacidades (Agent Tools)
A KIAra pode executar as seguintes ações definidas em `src/lib/agent-tools.ts`:

1.  **`list_notes`**: Lista todas as anotações do usuário para entender o contexto de estudos.
2.  **`read_note(title)`**: Lê o conteúdo completo de uma anotação específica.
3.  **`search_notes(query)`**: Pesquisa anotações por palavras-chave.
4.  **`update_note(title, content)`**: Atualiza ou expande uma anotação existente com novas informações aprendidas no chat.

---

## ✨ Funcionalidades Principais

### 1. 📝 Anotações Inteligentes (Notes)
Um sistema de anotações robusto para organizar o conhecimento.
- **Editor Rico:** Formatação completa, links e imagens.
- **Grafo de Conhecimento:** Visualização de conexões entre notas (Backlinks).
- **Organização:** Busca instantânea e listagem cronológica.

### 2. 👥 Comunidade Ativa
Um espaço para troca de conhecimento.
- **Fórum:** Crie discussões, tire dúvidas e compartilhe dicas.
- **Leaderboard:** Ranking dos usuários mais ativos.
- **Diretório:** Encontre professores e outros estudantes.

### 3. 🎓 Simulados
Pratique como se fosse no dia da prova.
- **Cronômetro Real:** Simulação de tempo de prova.
- **Correção Automática:** Feedback imediato.
- **Histórico:** Acompanhe sua evolução (Em andamento / Finalizados).

### 4. ♿ Acessibilidade (Novo!)
O EnemAI é para todos.
- **Modo Assistivo:** Ative nas configurações para ver dicas contextuais.
- **Dicas Visuais:** Tooltips explicativos em elementos interativos.
- **Cobertura:** Chat, Notas, Comunidade e Perfil.

---

## �️ Esquema do Banco de Dados (Supabase)

O projeto utiliza o Supabase (PostgreSQL). Abaixo, o esquema inferido das principais tabelas:

- **`profiles`**: Dados do usuário (nome, avatar, role [student/teacher], série, matérias).
- **`notes`**: Anotações do usuário (título, conteúdo, user_id).
- **`discussions`**: Tópicos da comunidade (título, conteúdo, tag, author_id).
- **`chat_conversations`**: Histórico de conversas com a KIAra.
- **`simulados`**: Registros de simulados (user_id, score, status).
- **`questoes`**: Banco de questões (enunciado, alternativas, gabarito).

---

## 🚀 Como Rodar Localmente

Siga estes passos para configurar o ambiente de desenvolvimento:

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou pnpm

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/EnemAI-Dyad.git
    cd EnemAI-Dyad
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    pnpm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz e adicione suas credenciais do Supabase:
    ```env
    VITE_SUPABASE_URL=sua_url_supabase
    VITE_SUPABASE_ANON_KEY=sua_chave_anonima
    ```

4.  **Inicie o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    ```

5.  **Acesse:** Abra `http://localhost:8080` no seu navegador.

---

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir Issues ou Pull Requests.

1.  Faça um Fork do projeto.
2.  Crie uma Branch para sua Feature (`git checkout -b feature/NovaFeature`).
3.  Commit suas mudanças (`git commit -m 'Adiciona NovaFeature'`).
4.  Push para a Branch (`git push origin feature/NovaFeature`).
5.  Abra um Pull Request.

---

**Desenvolvido com 💜 para a educação.**