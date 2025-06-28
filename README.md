 # 👨‍💻 Languages and Tools:
![React Native](https://img.shields.io/badge/-React%20Native-%23282C34?style=flat-square&logo=react)
![JavaScript](https://img.shields.io/badge/-JavaScript-%23F7DF1C?style=flat-square&logo=javascript&logoColor=000000&labelColor=%23F7DF1C&color=%23FFCE5A)
![ReactJS](https://img.shields.io/badge/-ReactJS-%23282C34?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/-TypeScript-%23282C34?style=flat-square&logo=typescript&logoColor=007bcd)
![Nodejs](https://img.shields.io/badge/-Nodejs-black?style=flat-square&logo=Node.js)
![HTML5](https://img.shields.io/badge/-HTML5-%23E44D27?style=flat-square&logo=html5&logoColor=ffffff)
![CSS3](https://img.shields.io/badge/-CSS3-%231572B6?style=flat-square&logo=css3)
![Git](https://img.shields.io/badge/-git-black?style=flat-square&logo=Git)
![NPM](https://img.shields.io/badge/NPM-9.x-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)
<br>![Status](https://img.shields.io/badge/status-Em%20Desenvolvimento-yellow.svg)

# 📱 MEI App Manager (React Native)

Sistema de gerenciamento para **Microempreendedor Individual (MEI)**.  
Este repositório contém o frontend da aplicação, desenvolvido em **React Native**, com foco na organização de notas fiscais, receitas, despesas, controle de pagamento da guia DAS e notificações automatizadas.

## 📚 Objetivos do Projeto

🔹app-crossplatform-mobile com **Expo**, consumindo a API Laravel para gerenciamento de MEI.

## 🚀 **Tecnologias** 

  - Expo SDK 56 + React Native 0.79  
  - React Navigation via **Expo Router**  
  - Autenticação por token com **Laravel Sanctum**  
  - `expo-secure-store` (mobile) + fallback `localStorage` (web)  
  - Axios para chamadas HTTP  
  - Componentes feitos do zero: `Input`, `TextView`, `Button`

---
## 🗺️ Roadmap

## 🛠️ O que já foi implementado

1. **Login**  
   - Tela estilizada com campos: email e senha  
   - Lógica de autenticação via `/login`  
   - Armazena `token` e `user` com SecureStore/LocalStorage  
   - Redireciona ao sucesso; mensagens de erro estão funcionando

2. **Persistência de sessão**  
   - Ao abrir o app, validamos o token salvo  
   - Se válido, mantemos `user` logado

3. **Registro (sign-up)**  
   - Tela estilizada com campos: nome, email, senha e confirmação  
   - Lógica de chamada ao endpoint `/register`  
   - Mensagem de sucesso e redirecionamento à tela de login

4. **Navegação com acesso controlado**  
   - `_layout.tsx` usando `AuthProvider` e `useAuth()`  
   - Se não autenticado, só acessa login ou registro  
   - Se autenticado, libera o restante do app

---

## 🚧 Próximas implementações

### 🔐 Autenticação e usuários  
- Logout com remoção de token/storage e redirecionamento  
- Endpoint `/me` para recarregar dados do usuário ao reabrir o app

### 🗓️ Dashboard e recursos MEI  
- Tela de dashboard com dados da API via `/...`  
- Listagem e gestão de itens específicos para MEI (ex: vendas, despesas, relatórios)

### 🔄 Refresh token  
- Se usar tokens expiráveis, adicionar lógica para renovação automática

### 🧪 Melhorias UX  
- Feedback visual nas telas de login/cadastro (ex: validação inline, loaders)  
- Mensagens refinadas baseadas em resposta do servidor

### 🎨 Estilo e tema  
- Criação de paleta de cores e fonte personalizada  
- Experiência homogênea entre telas: Login, Registro, Dashboard, etc.

---

## ⚙️ Estrutura de pastas
```bash
/app
├─ /(auth)/
│ ├─ login.tsx
│ └─ register.tsx
├─ _layout.tsx
└─ index.tsx ← (Dashboard/home futura)
src/components
├─ Button.tsx
├─ Input.tsx
└─ TextView.tsx
/contexts
└─ AuthContext.tsx
/services
└─ api.ts ← axios com baseURL da API Laravel
   ```
---

## 🚀 Como executar

1. Clone o repositório
   ```bash
   git clone https://github.com/seu-usuario/mei-manager-api.git
   ```

2. Instale deps:
   ```bash
   npm install
   ```

   ```bash
   npm install
   npm install react-native-modal-dropdown react-native-ui-lib react-native-paper react-native-vector-icons react-native-linear-gradient lodash react-native-webview @react-native-async-storage/async-storage @react-navigation/native-stack @react-navigation/bottom-tabs @react-navigation/native @react-navigation/drawer
   npx expo install react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens
   ```

3. Inicie o app
   ```bash
   npx expo start
   ```
---
## 🧑‍💻 Autor

Projeto desenvolvido por **[Felipe Costa de Jesus]** — [LinkedIn](https://www.linkedin.com/in/Felipe-Cjesus)  
Contato: felipecosta.developer@gmail.com
---