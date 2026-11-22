# 📱 MEI App Manager

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-0.81.4-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo_SDK-54-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Expo Router](https://img.shields.io/badge/Expo_Router-v6-black?style=for-the-badge&logo=expo&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

<p align="center">
  <strong>Sistema inteligente de gestão financeira, fiscal e emissão de notas para Microempreendedores Individuais (MEI) e Contadores Autônomos.</strong>
</p>

</div>

---

## 📌 Sobre o Projeto

O **MEI App Manager** é um aplicativo mobile desenvolvido em **React Native** com **Expo**, projetado para simplificar a rotina financeira e fiscal de quem é MEI ou de contadores autônomos que gerenciam múltiplos clientes.

O aplicativo resolve as principais dores do microempreendedor: controle de receitas e despesas, acompanhamento e histórico de guias DAS, organização de notas fiscais com anexos (PDF/XML), controle em tempo real do faturamento anual (teto de R$ 81.000,00) e alertas inteligentes antes do vencimento de impostos.

> 🔗 **Backend (API REST em Laravel 11):**  
> O aplicativo consome os serviços da API oficial do projeto: [Felipe-Cjesus/mei-api](https://github.com/Felipe-Cjesus/mei-api).

---

## 🚀 Principais Funcionalidades

### 🏢 1. Seletor Global de Empresas (Multi-tenant Reativo)
* **Gestão Multi-Cliente**: Perfeito para o MEI individual ou para contadores autônomos que gerenciam dezenas de empresas.
* **Contexto Ativo**: Troca de cliente em 1 toque através do seletor no topo da aplicação.
* **Persistência Inteligente**: O app memoriza a última empresa visualizada via `AsyncStorage` e recarrega todos os dashboards e listagens reativamente.

### 📊 2. Dashboard Financeiro
* **Métricas em Tempo Real**: Total de receitas recebidas, receitas pendentes, despesas e saldo líquido consolidado.
* **Filtro por Exercício/Ano**: Seleção de ano de referência para acompanhar o histórico financeiro.
* **Controle de NFs**: Quantidade de notas emitidas e faturamento total no período.

### 💰 3. Gestão Financeira Completa (Receitas & Despesas)
* **Receitas**: Cadastro com descrição, valor, data e marcação de status (Recebido vs Pendente).
* **Despesas**: Lançamentos manuais ou via nota fiscal com anexo de comprovantes.
* **Listagens Paginadas**: Busca por descrição, filtros por data e status de pagamento.

### 📄 4. Controle de Guias DAS
* Acompanhamento dos pagamentos mensais da guia DAS (Simples Nacional).
* Monitoramento de status: **Pago**, **Pendente**, **Vencido** e **Isento**.
* Filtros por ano e competência/referência (ex: `05/2025`).

### 📑 5. Módulo de Notas Fiscais
* Registro de notas fiscais emitidas (número, data de emissão, valor e descrição).
* **Upload de Documentos**: Suporte a upload de arquivos **PDF** e **XML** de até 2MB via `DocumentPicker`.
* **Visualização de Anexos**: Acesso direto e abertura do documento da nota fiscal no dispositivo.
* Métricas de faturamento focado exclusivamente em documentos fiscais.

### 🔔 6. Central de Notificações & Alertas Inteligentes
* Alertas preventivos de vencimento da guia DAS (3 dias antes do prazo).
* Avisos automáticos de DAS em atraso.
* Monitoramento do teto de faturamento MEI com avisos em 80%, 100% e estouro de limite.
* Filtros por categoria (Todas, Não lidas, Guia DAS, Limite MEI) e marcação de leitura em lote.

### 👤 7. Perfil e Segurança
* Autenticação segura via tokens Bearer gerenciados pelo **Laravel Sanctum**.
* Armazenamento criptografado de credenciais no dispositivo com `expo-secure-store`.
* Visualização da empresa ativa, atalhos do sistema e fluxo seguro de encerramento de sessão.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
* **Core**: [React Native](https://reactnative.dev/) `0.81.4` & [React](https://react.dev/) `19.1.0`
* **Framework**: [Expo SDK](https://expo.dev/) `54.0.12`
* **Roteamento**: [Expo Router](https://docs.expo.dev/router/introduction/) `v6` (baseado em arquivos)
* **Tipagem**: [TypeScript](https://www.typescriptlang.org/) `~5.9.2`
* **Requisições HTTP**: [Axios](https://axios-http.com/) com interceptors de autorização
* **Armazenamento Local**:
  * `expo-secure-store`: Armazenamento seguro de tokens JWT/Sanctum
  * `@react-native-async-storage/async-storage`: Persistência de preferências e empresa ativa
* **Manipulação de Datas**: [date-fns](https://date-fns.org/) `v4`
* **Manipulação de Arquivos**: `expo-document-picker` e `expo-linking`
* **Feedback Visual**: `react-native-toast-message` e `@expo/vector-icons`

### Backend Integrado
* **Linguagem & Framework**: PHP 8.2+ / [Laravel 11](https://laravel.com/)
* **Autenticação**: Laravel Sanctum (Personal Access Tokens)
* **Banco de Dados**: MySQL

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
│   │   ├── index.tsx           # Home / Dashboard financeiro
│   │   ├── Finance.tsx         # Hub do gerenciador financeiro
│   │   ├── Invoice.tsx         # Módulo de notas fiscais
│   │   └── Chart.tsx           # Gráficos e relatórios
│   ├── das/                    # Fluxo de Guias DAS (create, list)
│   ├── expense/                # Fluxo de Despesas (create, list)
│   ├── income/                 # Fluxo de Receitas (create, list)
│   ├── Account.tsx             # Perfil do usuário e configurações
│   ├── Enterprise.tsx          # Gestão de empresas e clientes
│   ├── Notification.tsx        # Central de notificações e alertas
│   ├── Sidebar.tsx             # Menu lateral deslizante
│   └── _layout.tsx             # Layout raiz com Providers e AuthGate
├── assets/                     # Imagens, logos e ícones
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
│   │   ├── TogglePaymentStatus.tsx
│   │   ├── ToggleRecebido.tsx
│   │   └── ToggleType.tsx
│   └── theme/
│       └── colors.ts           # Paleta de cores centralizada
├── GEMINI.md                   # Contexto técnico persistente do projeto
└── package.json
```

---

## ⚡ Como Executar o Projeto

### Pré-requisitos
* [Node.js](https://nodejs.org/) (versão LTS recomendada: 18 ou superior)
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
No arquivo [services/api.ts](services/api.ts), aponte para a URL da sua API Laravel (local ou em produção):

```typescript
// Exemplo para desenvolvimento local usando o IP da sua máquina:
const DEVELOPMENT_BASE_URL = 'http://192.168.1.X:8000/api';

// Ou túnel/produção:
const PRODUCTION_BASE_URL = 'https://sua-api.com/api';
```

### 4. Iniciar o servidor de desenvolvimento
```bash
npx expo start
```

* Para testar no celular, leia o **QR Code** gerado no terminal usando o aplicativo **Expo Go**.
* Para rodar no emulador Android, pressione `a`.
* Para rodar no simulador iOS, pressione `i`.

---

## 🧪 Qualidade de Código e Testes

Para garantir estabilidade e ausência de erros de tipagem e formatação, execute:

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
