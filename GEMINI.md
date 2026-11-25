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

Concluímos integralmente a **Fase 1** (Correções de Inconsistências Críticas e Bugs), o **Seletor Global de Empresas (Multi-tenant Reativo)**, a **Fase 2** (Telas Faltantes e Recursos Pendentes) e a **Fase 3** (Dashboard e Inteligência de Negócio MEI).

### Arquivos Criados ou Alterados Recentemente (Fase 3):
* `src/components/MeiThermometer.tsx`: Componente visual do teto fiscal MEI (R$ 81.000,00) com barra de progresso proporcional, valores acumulados, margem restante/excedida, badges de status dinâmicos (verde, laranja e vermelho) e orientações tributárias.
* `app/(tabs)/index.tsx`: Integrado o `MeiThermometer`, adicionado `ScrollView` com `RefreshControl` para pull-to-refresh e dependências de hooks corrigidas.
* `app/(tabs)/Chart.tsx`: Dashboard financeiro completo com navegação por anos, KPIs anuais (Receitas, Despesas + DAS, Resultado Líquido, Margem de Lucro e NFs), gráfico de barras mensais interativo de 12 meses e card de detalhamento por mês selecionado.
* `src/utils/masks.ts`: Módulo de máscaras e parsing numérico com suporte a CNPJ (`maskCnpj`), Moeda BRL (`maskCurrency`), Mês/Ano (`maskReference`), Data (`maskDate`) e conversor seguro para float (`currencyToNumber`).
* `app/income/list.tsx`: Ações de edição (Modal com `PUT /incomes/{id}`) e exclusão (`DELETE /incomes/{id}` com confirmação), além de layout modernizado com action buttons nos cards.
* `app/expense/list.tsx`: Ações de edição (Modal com `PUT /expenses/{id}` e seleção de tipo) e exclusão (`DELETE /expenses/{id}` com confirmação) nos cards.
* `app/das/list.tsx`: Ações de edição (Modal com `PUT /das-payments/{id}` e atualização de datas/status) e exclusão (`DELETE /das-payments/{id}` com confirmação).
* `src/components/TogglePaymentStatus.tsx`: Adicionado suporte ao status `'overdue'` (Vencido) alinhado ao backend.
* `app/Enterprise.tsx`: Máscara automática de CNPJ aplicada no formulário.
* `app/income/create.tsx`, `app/expense/create.tsx`, `app/das/create.tsx`: Máscaras de moeda e referência integradas nos inputs e sanitização antes do envio para a API.
* `services/api.ts`: Variável `PRODUCTION_BASE_URL` exportada e suporte a `process.env.EXPO_PUBLIC_API_URL`.
* `contexts/EnterpriseContext.tsx`: `fetchEnterprises` envolvido em `useCallback` eliminando warnings de hooks.
* `app/(tabs)/Invoice.tsx`: Módulo completo de Notas Fiscais com listagem paginada por empresa e ano, métricas de faturamento e quantidade de NFs, exclusão (`DELETE /invoices/{id}`), abertura de anexo PDF/XML e modal de cadastro com upload multipart (`POST /invoices`).
* `app/Notification.tsx`: Central de Notificações com filtros dinâmicos (Todas, Não lidas, Guia DAS, Limite MEI), marcação individual de leitura (`PUT /alerts/{id}/read`), marcação em lote, pull-to-refresh e badges temáticos.
* `app/Account.tsx`: Perfil do usuário com avatar de iniciais, exibição da empresa ativa com link de troca rápida, atalhos do sistema, metadados de versão e fluxo de encerramento de sessão (Logout).
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
4. **Infraestrutura de Homologação Gratuita (Render + Aiven.io + EAS)**:
   * *Decisão*: Utilizar **Render.com** para a API Laravel 11 e **Aiven.io** para o banco MySQL 8.0 (5 GB gratuitos perpétuos, sem exigência de cartão de crédito).
   * *Motivo*: Compatibilidade direta 100% nativa com as migrations e queries brutas do Laravel (ex: `MONTH()` no `ReportController`). O Neon.tech foi descartado por ser exclusivamente PostgreSQL, o que exigiria refatoração de SQL e migrations. Para distribuição de testes do app, utilizar **Expo EAS Build** (30 builds mensais gratuitos para gerar APK Android).

---

## 5. Próximos Passos (TODO)

Lista priorizada para as próximas sessões:

### 📌 Fase 2: Telas Faltantes e Recursos Pendentes (Concluída ✅)
- [x] **Notas Fiscais (`app/(tabs)/Invoice.tsx`)**:
  - Implementada tela completa com listagem paginada consumindo `GET /invoices` com filtro por empresa e ano.
  - Modal de cadastro consumindo `POST /invoices` com upload multipart de arquivo PDF/XML.
  - Opção para visualizar/abrir o anexo da nota fiscal e exclusão de notas (`DELETE`).
- [x] **Central de Notificações & Alertas (`app/Notification.tsx`)**:
  - Implementada tela completa consumindo `GET /alerts` com filtros de leitura e tipo.
  - Visualização de avisos de vencimento de DAS e limites de faturamento do MEI (80%, 100%, excedido).
  - Ação de marcar alerta como lido (`PUT /alerts/{id}/read`) individual e em lote.
- [x] **Perfil e Conta (`app/Account.tsx`)**:
  - Exibição de informações do usuário autenticado, empresa ativa, atalhos do sistema e logout seguro.

### 📌 Fase 3: Dashboard e Inteligência de Negócio MEI (Concluída ✅)
- [x] **Termômetro do Limite Anual do MEI (R$ 81.000,00)**:
  - Componente dedicado `MeiThermometer.tsx` na Home exibindo teto fiscal, progresso percentual, margem restante/excedida, avisos de enquadramento tributário e cores dinâmicas (verde, laranja e vermelho).
- [x] **Gráficos Financeiros (`app/(tabs)/Chart.tsx`)**:
  - Dashboard completo consumindo `GET /reports/monthly`, navegação por ano, resumo anual (KPIs), gráfico interativo de barras de 12 meses (Receitas x Despesas) e detalhamento dinâmico por mês selecionado.
- [x] **Edição e Exclusão nas Listagens**:
  - Adicionadas ações de editar (modal interativo com `PUT`) e excluir (confirmação e `DELETE`) nas listagens de Receitas (`income/list.tsx`), Despesas (`expense/list.tsx`) e DAS (`das/list.tsx`).
- [x] **Máscaras de Entrada (`src/utils/masks.ts`)**:
  - Módulo reutilizável com máscaras para CNPJ (`00.000.000/0000-00`), Moeda BRL (`R$ 0,00`), Referência (`MM/AAAA`) e conversão segura para float. Aplicado em todos os cadastros e formulários de edição.

### 📌 Fase 4: Homologação Online & Infraestrutura
- [ ] **Banco de Dados & Hospedagem Gratuita**:
  - Criar instância gratuita do MySQL no **Aiven.io** (5 GB perpétuos).
  - Fazer deploy do repositório da API Laravel no **Render.com** com variáveis de ambiente conectadas ao Aiven.io.
- [x] **No repositório Laravel (`mei-api`) - Alinhamento Multi-empresa Concluído ✅**:
  - Alterado `EnterpriseController@index` de `->first()` para `->get()` para listar todas as empresas do usuário.
  - Criada migration adicionando a coluna `enterprise_id` nas tabelas `incomes`, `expenses`, `invoices` e `das_payments`.
  - Criada migration adicionando `enterprise_id` na tabela `alerts`.
  - Atualizado comando `GenerateAlerts` para cálculo de faturamento individual por empresa MEI (eliminando falsos positivos de soma de múltiplos CNPJs) e vinculando alertas de DAS à empresa correspondente.
  - Atualizados os controllers para filtrar queries e validar permissões por `enterprise_id`.
  - Suíte de testes `MultiEnterpriseTest.php` com 12 testes e 59 assertions passando 100%.
- [ ] **No Frontend (`mei-app-manager`)**:
  - Configurar `.env` com `EXPO_PUBLIC_API_URL` apontando para a API no Render.
  - Configurar `eas.json` para compilar APKs de homologação via EAS Build.
  - Implementar chamada a `POST /logout` para revogar token no Sanctum ao deslogar.

