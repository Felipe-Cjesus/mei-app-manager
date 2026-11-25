# 📱 MEI App Manager

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-0.88.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo_SDK-58-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Expo Router](https://img.shields.io/badge/Expo_Router-v6-black?style=for-the-badge&logo=expo&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

<p align="center">
  <strong>Sistema inteligente de gestão financeira, fiscal, emissão de notas e monitoramento do teto para Microempreendedores Individuais (MEI) e Contadores Autônomos.</strong>
</p>

</div>

---

## 📌 Sobre o Projeto

O **MEI App Manager** é um aplicativo mobile desenvolvido em **React Native** com **Expo**, projetado para simplificar e profissionalizar a rotina fiscal e financeira do Microempreendedor Individual (MEI) e de contadores autônomos que gerenciam carteiras com múltiplos clientes.

O aplicativo resolve as principais dores do microempreendedor:
* **Termômetro MEI em tempo real**: Controle do teto fiscal anual de R$ 81.000,00 com cálculo de margem disponível, alertas preventivos em 80% e avisos de migração para Microempresa (ME).
* **BI Financeiro e Gráficos**: Gráficos de barras interativos mensais de 12 meses (Receitas vs Despesas), cálculo automático de margem de lucro e detalhamento por mês.
* **Gestão Multi-Cliente (Multi-tenant Reativo)**: Troca instantânea de empresa ativa no topo do app, mantendo receitas, despesas, DAS e relatórios 100% isolados por CNPJ.
* **CRUD Financeiro Completo**: Criação, edição interativa via modal e exclusão com confirmação para Receitas, Despesas e Guias DAS.
* **Organização de Notas Fiscais**: Registro de faturamento por NF com upload de anexos em **PDF** ou **XML** e abertura direta no celular.
* **Central de Notificações**: Alertas de vencimento de DAS, guias atrasadas e notificações tributárias por cliente ou visão consolidada.

> 🔗 **Backend (API REST em Laravel 11):**  
> O aplicativo consome os serviços da API oficial do projeto: [Felipe-Cjesus/mei-api](https://github.com/Felipe-Cjesus/mei-api).

---

## 🚀 Principais Funcionalidades

### 🏢 1. Seletor Global de Empresas (Multi-tenant Reativo)
* **Gestão Multi-Cliente**: Atende tanto o MEI que cuida do próprio negócio quanto contadores autônomos que atendem dezenas de MEIs.
* **Contexto Ativo em 1 Toque**: Seletor interativo no cabeçalho exibe o nome da empresa e o CNPJ mascarado.
* **Persistência Inteligente**: O aplicativo memoriza o cliente ativo via `@react-native-async-storage/async-storage` e recarrega todos os dashboards, gráficos e listagens reativamente.

### 🌡️ 2. Termômetro do Limite Anual do MEI (R$ 81.000,00)
* **Barra de Progresso Visual**: Proporcionalidade exata entre o faturamento acumulado no ano e o teto da Receita Federal.
* **Status Dinâmico com Badges**:
  * 🟢 **Dentro do Limite Seguro** (< 70%): Informa a margem em reais ainda disponível para faturar no ano.
  * 🟠 **Atenção aos Lançamentos** (70% a 99.9%): Dispara aviso especial ao atingir a margem de segurança de 80% (R$ 64.800,00).
  * 🔴 **Limite Anual Ultrapassado** (≥ 100%): Informa o valor excedido e orientações práticas para a transição para Microempresa (ME).

### 📈 3. Central de Gráficos & BI Financeiro (`Chart.tsx`)
* **Navegação Anual**: Seletor por setas para consultar qualquer ano fiscal.
* **Resumo de KPIs Anuais**:
  * Faturamento total acumulado e volume de lançamentos.
  * Despesas operacionais somadas às guias DAS pagas/devidas.
  * **Resultado Líquido** do exercício e **Margem de Lucro (%)**.
  * Quantidade e valor consolidado de Notas Fiscais emitidas.
* **Gráfico de Barras Mensais (12 meses)**:
  * Comparativo visual lado a lado de **Receitas (Verde)** vs **Despesas + DAS (Vermelho)** para todos os meses (Jan a Dez).
  * Altura proporcional escalada dinamicamente pelo maior valor do período.
* **Detalhamento Interativo**: Ao tocar em qualquer mês no gráfico, um card revela a composição detalhada daquele mês (receitas recebidas e pendentes, despesas, DAS e saldo líquido).

### 💰 4. Gestão Financeira Completa (Receitas & Despesas)
* **CRUD 100% Funcional**:
  * **Criação**: Formulários com máscaras inteligentes de moeda (`R$ 0,00`) e seletores de data.
  * **Edição via Modal**: Atualização ágil de descrição, valor, data e status sem perder o contexto da listagem.
  * **Exclusão Segura**: Confirmação nativa via `Alert` antes de remover qualquer lançamento.
* **Receitas**: Controle de recebimentos com status `Recebido` vs `Pendente`.
* **Despesas**: Separação por tipo (`Manual` vs `Nota Fiscal`) com badges visuais nos cards e suporte a upload de comprovantes.
* **Filtros e Paginação**: Busca por descrição, filtro por data e paginação dinâmica.

### 📄 5. Controle de Guias DAS (Simples Nacional)
* **Acompanhamento de Pagamentos**: Registro de guias mensais com referência (`MM/AAAA`), vencimento e pagamento.
* **Status Tributário Completo**: Suporte a **Pago**, **Pendente**, **Vencido** (`overdue`) e **Isento**.
* **Edição e Exclusão**: Atualização rápida de datas e status via modal dedicado.

### 📑 6. Módulo de Notas Fiscais
* Registro de notas fiscais com número, data de emissão, valor e descrição do serviço.
* **Upload Multipart**: Suporte a arquivos **PDF** e **XML** de até 2MB via `expo-document-picker`.
* **Visualização Imediata**: Abertura direta do anexo no leitor padrão do sistema operacional (`expo-linking`).
* Métricas isoladas de faturamento comprovado por documento fiscal.

### 🔔 7. Central de Notificações & Alertas Inteligentes
* **Alternância de Escopo**: O usuário pode optar por ver notificações **Apenas da Empresa Ativa** ou de **Todas as Empresas**.
* **Alertas Preventivos**:
  * DAS a vencer (3 dias de antecedência).
  * DAS em atraso.
  * Limite MEI atingindo 80%, 100% ou ultrapassado (calculado individualmente por CNPJ).
* **Ações em Lote**: Marcação individual de leitura ou marcação de todas as mensagens como lidas de uma vez.

### 🎭 8. Utilitário de Máscaras e Formatação (`masks.ts`)
* **CNPJ**: `maskCnpj` (`00.000.000/0000-00`) no formulário de empresas.
* **Moeda BRL**: `maskCurrency` (`R$ 0,00`) com formatação em tempo real durante a digitação e parser numérico `currencyToNumber`.
* **Competência**: `maskReference` (`MM/AAAA`) para guias DAS.
* **Datas**: `maskDate` (`DD/MM/AAAA`).

---

## 🛠️ Tecnologias Utilizadas

### Frontend
* **Core**: [React Native](https://reactnative.dev/) `0.88.1` & [React](https://react.dev/) `19.3.0`
* **Framework**: [Expo SDK](https://expo.dev/) `58.0.26`
* **Roteamento**: [Expo Router](https://docs.expo.dev/router/introduction/) `v6` (baseado em arquivos)
* **Tipagem**: [TypeScript](https://www.typescriptlang.org/) `~6.0.3`
* **Requisições HTTP**: [Axios](https://axios-http.com/) com suporte a `process.env.EXPO_PUBLIC_API_URL`
* **Armazenamento Seguro e Cache**:
  * `expo-secure-store`: Armazenamento seguro de tokens JWT/Sanctum
  * `@react-native-async-storage/async-storage`: Persistência de preferências e empresa ativa
* **Manipulação de Datas**: [date-fns](https://date-fns.org/) `v4`
* **Arquivos e Documentos**: `expo-document-picker` e `expo-linking`
* **Feedback Visual & Ícones**: `react-native-toast-message` e `@expo/vector-icons` (Feather e Ionicons)

### Backend Integrado
* **Linguagem & Framework**: PHP 8.2+ / [Laravel 11](https://laravel.com/)
* **Autenticação**: Laravel Sanctum (Tokens Bearer)
* **Arquitetura**: Multitenancy por `enterprise_id` com chaves estrangeiras em cascata
* **Banco de Dados**: MySQL 8.0 (compatível com Aiven.io e Render)

---

## 📂 Estrutura de Pastas

```text
mei-app-manager/
├── app/                        # Rotas e telas (Expo Router)
│   ├── (auth)/                 # Grupo de rotas públicas (Login, Registro)
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                 # Navegação principal em abas
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Home com Termômetro MEI e Resumo Anual
│   │   ├── Finance.tsx         # Hub de atalhos financeiros
│   │   ├── Invoice.tsx         # Módulo de Notas Fiscais e Upload
│   │   └── Chart.tsx           # BI Financeiro e Gráficos de 12 meses
│   ├── das/                    # Fluxo de Guias DAS (create, list com edição/exclusão)
│   ├── expense/                # Fluxo de Despesas (create, list com edição/exclusão)
│   ├── income/                 # Fluxo de Receitas (create, list com edição/exclusão)
│   ├── Account.tsx             # Perfil do usuário e configurações
│   ├── Enterprise.tsx          # Gestão e cadastro de empresas/clientes
│   ├── Notification.tsx        # Central de notificações e alertas
│   ├── Sidebar.tsx             # Menu lateral deslizante
│   └── _layout.tsx             # Layout raiz com Providers globais
├── contexts/                   # Contextos globais da aplicação
│   ├── AuthContext.tsx         # Sessão do usuário e tokens Sanctum
│   └── EnterpriseContext.tsx   # Contexto multi-tenant da empresa ativa
├── services/
│   └── api.ts                  # Cliente Axios configurado para a API
├── src/
│   ├── components/             # Componentes modulares e reutilizáveis
│   │   ├── Button.tsx
│   │   ├── DateInput.tsx
│   │   ├── EnterprisePickerModal.tsx
│   │   ├── Header.tsx
│   │   ├── HeaderSecundary.tsx
│   │   ├── Input.tsx
│   │   ├── MeiThermometer.tsx  # Termômetro visual do limite MEI
│   │   ├── TogglePaymentStatus.tsx
│   │   ├── ToggleRecebido.tsx
│   │   └── ToggleType.tsx
│   ├── theme/
│   │   └── colors.ts           # Paleta de cores centralizada
│   └── utils/
│       └── masks.ts            # Máscaras de CNPJ, Moeda BRL, Data e Referência
├── GEMINI.md                   # Memória técnica persistente do projeto
└── package.json
```

---

## ⚡ Como Executar o Projeto

### Pré-requisitos
* [Node.js](https://nodejs.org/) (versão LTS 18 ou superior)
* [Git](https://git-scm.com/)
* Gerenciador de pacotes: `npm` ou `yarn`
* Dispositivo físico com o app **Expo Go** instalado ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)) ou um emulador Android/iOS configurado.

### 1. Clonar o repositório
```bash
git clone https://github.com/Felipe-Cjesus/mei-app-manager.git
cd mei-app-manager
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar a URL da API
No arquivo [services/api.ts](services/api.ts), ou via variável de ambiente `.env`, configure a URL base da API:

```bash
# Crie um arquivo .env na raiz (opcional)
EXPO_PUBLIC_API_URL=https://sua-api.com/api
```

Ou configure diretamente as constantes em `services/api.ts`:
```typescript
// Desenvolvimento local (usando seu IP de rede local ou túnel ngrok):
export const DEVELOPMENT_BASE_URL = 'http://192.168.1.X:8000/api';

// Produção / Homologação (Render.com):
export const PRODUCTION_BASE_URL = 'https://mei-api.onrender.com/api';
```

### 4. Iniciar o servidor de desenvolvimento
```bash
npx expo start
```

* Para testar no celular, leia o **QR Code** no terminal usando o aplicativo **Expo Go**.
* Para rodar no emulador Android, pressione `a`.
* Para rodar no simulador iOS, pressione `i`.

---

## 🧪 Qualidade de Código e Verificação

Para garantir estabilidade, tipagem estrita e conformidade com as regras do ESLint, execute:

```bash
# Verificação estrita de tipos TypeScript
node ./node_modules/typescript/bin/tsc --noEmit

# Análise estática com ESLint
node ./node_modules/eslint/bin/eslint.js . --ext .js,.jsx,.ts,.tsx
```

---

## 👨‍💻 Autor

Desenvolvido por **Felipe Costa de Jesus**  
* 💼 LinkedIn: [linkedin.com/in/Felipe-Cjesus](https://www.linkedin.com/in/Felipe-Cjesus)  
* 🐙 GitHub: [@Felipe-Cjesus](https://github.com/Felipe-Cjesus)  
* 📧 Contato: `felipecosta.developer@gmail.com`

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).
