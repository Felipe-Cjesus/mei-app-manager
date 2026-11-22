# GEMINI.md - Memória do Projeto MEI Manager

Arquivo de contexto persistente para transferências de sessão e recuperação rápida do estado técnico do projeto.

---

## 1. Visão Geral e Stack

* **Propósito**: Aplicativo mobile para gestão financeira e fiscal do Microempreendedor Individual (MEI), cobrindo receitas, despesas, guias DAS, notas fiscais, alertas inteligentes de faturamento e suporte a contadores autônomos que gerenciam múltiplos clientes MEI.
* **Frontend**: React Native `0.81.4`, React `19.1.0`, Expo SDK `54.0.12`, Expo Router `v6`, TypeScript `~5.9.2`.
* **Backend**: API Laravel 11 com autenticação via Laravel Sanctum (Tokens Bearer) e banco MySQL. Repositório: [Felipe-Cjesus/mei-api](https://github.com/Felipe-Cjesus/mei-api).
* **Principais Dependências**:
  * Navegação: `expo-router` (baseado em arquivos), `@react-navigation/native`
  * Armazenamento Seguro e Cache: `expo-secure-store` (tokens/sessão), `@react-native-async-storage/async-storage` (empresa ativa/preferências)
  * Rede e Datas: `axios`, `date-fns`
  * UI e Feedback: `react-native-toast-message`, `@expo/vector-icons`, `expo-document-picker`

---

## 2. Regras e Padrões do Projeto

* **Estrutura de Rotas**:
  * `app/`: Estrutura de navegação do Expo Router.
  * Grupos de rotas: `(auth)/` para login/cadastro, `(tabs)/` para a navegação principal (Início, Financeiro, Notas, Gráficos), e pastas para fluxos específicos (`das/`, `expense/`, `income/`).
* **Contextos Globais**:
  * `contexts/AuthContext.tsx`: Gerencia autenticação, token JWT/Sanctum e estado do usuário logado.
  * `contexts/EnterpriseContext.tsx`: Gerencia a lista de empresas e a **Empresa Ativa** selecionada no momento, persistida no `AsyncStorage`.
* **Componentes Reutilizáveis**:
  * Localizados em `src/components/` (Inputs, Buttons, Headers, Toggles, Modais).
* **Temas e Cores**:
  * Centralizados em `src/theme/colors.ts`.
* **Qualidade de Código**:
  * Todo código novo deve manter TypeScript estrito sem erros (`node ./node_modules/typescript/bin/tsc --noEmit`).
  * ESLint deve rodar sem erros (`node ./node_modules/eslint/bin/eslint.js . --ext .js,.jsx,.ts,.tsx`).

---

## 3. Estado Atual (Onde paramos)

Concluímos integralmente a **Fase 1** (Correções de Inconsistências Críticas e Bugs) e a arquitetura do **Seletor Global de Empresas (Multi-tenant Reativo)**.

### Arquivos Criados ou Alterados:
* `contexts/EnterpriseContext.tsx`: Contexto global para armazenar a lista de empresas e a empresa ativa (`activeEnterprise`), com persistência local em `@active_enterprise_id`.
* `src/components/EnterprisePickerModal.tsx`: Modal interativo para seleção de cliente/empresa, indicação da empresa ativa e botão para novo cadastro.
* `app/_layout.tsx`: `EnterpriseProvider` adicionado no topo da árvore de componentes.
* `src/components/Header.tsx`: Seletor interativo no topo exibindo nome da empresa ativa, CNPJ e ícone chevron para troca rápida de contexto.
* `app/(tabs)/index.tsx`: Home reativa à troca de empresa (`activeEnterprise.id`), requisição de relatório enviando `enterprise_id` e ano, com proteção contra envio de ano `1970` quando nulo.
* `app/Enterprise.tsx`: Redesenhada com suporte a carregar empresas (`GET /enterprises`), alternar empresa ativa, atualizar empresa (`PUT /enterprises/{id}`) e cadastrar novos clientes (`POST /enterprises`).
* `app/das/create.tsx`: Rota corrigida de `/das` para `/das-payments` (fim do erro 404), valor monetário tratado e anexo automático de `enterprise_id`.
* `app/das/list.tsx`: Títulos corrigidos de "Receitas" para "Guias DAS", filtros ajustados para `reference` e `year`, e isolamento por `enterprise_id`.
* `app/expense/create.tsx`: Enum `type` corrigido para `'manual' | 'nota_fiscal'` (fim do erro 422), captura de arquivo corrigida para `result.assets[0]` e anexo de `enterprise_id`.
* `app/expense/list.tsx` e `app/income/list.tsx`: Reatividade automática na troca de empresa e envio de `enterprise_id`.
* `app/income/create.tsx`: Inclusão de receita anexando `enterprise_id` da empresa ativa.
* `src/components/ToggleType.tsx`: Ajustado para valores `'manual' | 'nota_fiscal'` e correção do bug visual de estilos ativos.
* `app/Sidebar.tsx`: Adicionado `pointerEvents={visible ? 'auto' : 'none'}` para evitar bloqueio de toques na tela quando fechado.
* `src/styles/index.js`: Remoção de tipagens inválidas Flow/TS em arquivo JS (fim do erro de parsing do ESLint).
* `contexts/AuthContext.tsx`: Removido o delay artificial de 2 segundos no startup.
* `analise_projeto_mei.md`: Relatório e roadmap atualizados.

---

## 4. Decisões Técnicas

1. **Contexto Ativo de Empresa no Frontend**:
   * *Decisão*: Criar uma empresa ativa global em vez de carregar dados misturados de múltiplos clientes.
   * *Motivo*: Atende tanto o MEI individual quanto contadores autônomos que gerenciam dezenas de clientes, mantendo as telas simples e focadas em uma empresa por vez.
2. **Compatibilidade com Contratos da API sem quebrar regras**:
   * *Decisão*: Adequar os formulários e enums do frontend para os formatos esperados pelo Laravel (`manual` e `nota_fiscal` em minúsculas; rota `/das-payments`; upload multipart com `result.assets[0]`).
   * *Motivo*: Evita necessidade de refatorar a API imediatamente para que os fluxos básicos do aplicativo voltem a funcionar.
3. **Persistência da Empresa Ativa**:
   * *Decisão*: Salvar o ID da empresa ativa no `AsyncStorage`.
   * *Motivo*: Quando o usuário fecha e reabre o app, ele continua no mesmo cliente que estava visualizando.

---

## 5. Próximos Passos (TODO)

Lista priorizada para as próximas sessões:

### 📌 Fase 2: Telas Faltantes e Recursos Pendentes
- [ ] **Notas Fiscais (`app/(tabs)/Invoice.tsx`)**:
  - Implementar tela completa (atualmente em branco).
  - Listagem paginada consumindo `GET /invoices` com filtro por empresa e ano.
  - Tela/modal de cadastro consumindo `POST /invoices` com upload de arquivo PDF/XML.
  - Opção para visualizar/abrir o anexo da nota fiscal.
- [ ] **Central de Notificações & Alertas (`app/Notification.tsx`)**:
  - Implementar tela completa (atualmente em branco).
  - Listar alertas do backend (`GET /alerts`) filtrados por status de leitura.
  - Exibir avisos de vencimento de DAS e alertas de limites de faturamento do MEI (80%, 100%, excedido).
  - Ação de marcar alerta como lido (`PUT /alerts/{id}/read`).
- [ ] **Perfil e Conta (`app/Account.tsx`)**:
  - Exibir informações do usuário autenticado e permitir troca de senha ou logout.

### 📌 Fase 3: Dashboard e Inteligência de Negócio MEI
- [ ] **Termômetro do Limite Anual do MEI (R$ 81.000,00)**:
  - Adicionar barra de progresso visual na Home comparando a receita acumulada com o teto MEI e cores dinâmicas (verde, laranja, vermelho).
- [ ] **Gráficos Financeiros (`app/(tabs)/Chart.tsx`)**:
  - Consumir o array de 12 meses retornado por `GET /reports/monthly` para plotar gráficos de receitas vs despesas vs DAS.
- [ ] **Edição e Exclusão nas Listagens**:
  - Adicionar botões de Editar e Deletar nas listagens de Receitas, Despesas e DAS.
- [ ] **Máscaras de Entrada**:
  - Adicionar máscaras de CNPJ (`00.000.000/0000-00`), Moeda (`R$ 0,00`) e Referência (`MM/AAAA`).

### 📌 Fase 4: Alinhamento com o Backend (`mei-api`)
- [ ] No repositório Laravel:
  - Alterar `EnterpriseController@index` de `->first()` para `->get()` para listar todas as empresas do usuário.
  - Criar migrations adicionando a coluna `enterprise_id` nas tabelas `incomes`, `expenses`, `invoices` e `das_payments`.
  - Atualizar os controllers para filtrar queries por `enterprise_id`.
- [ ] No Frontend:
  - Configurar `.env` com `EXPO_PUBLIC_API_URL` em `services/api.ts`.
  - Implementar chamada a `POST /logout` para revogar token no Sanctum ao deslogar.

