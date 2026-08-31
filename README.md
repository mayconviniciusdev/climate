# 🌤️ Climate
Projeto de estudo desenvolvido com **HTML**, **CSS** e **TypeScript**, com foco em criar um painel meteorológico moderno e responsivo para consultar o clima de qualquer cidade. A interface exibe dados atuais e a previsão dos próximos dias com o uso de uma API de clima em tempo real.
- Acesse aqui: [Climate](https://mayconviniciusdev.github.io/climate/)
- Desenvolvido por: [maicoding.](https://www.linkedin.com/in/mayconviniciusdev/)

### 📌 Objetivo do projeto
Este projeto foi desenvolvido com foco em praticar: **consumo de APIs REST**, **uso de async/await**, **manipulação do DOM**, **tratamento de erros**, **tipagem com TypeScript**, **organização de módulos**, **atualização dinâmica de dados** e **aplicação de responsividade**.

### 🚀 Funcionalidades
- 🔍 Busca do clima por nome da cidade.  
- 🌡️ Exibição da temperatura atual e da sensação térmica.  
- 💧 Umidade do ar e probabilidade de precipitação.  
- 💨 Velocidade e direção do vento.  
- 🖼️ Descrição e ícone dinâmico conforme as condições climáticas.  
- 📅 Previsão dos próximos 7 dias com temperatura máxima, mínima e chance de chuva.  
- ⏳ Estados de carregamento, vazio e resultado com feedback visual.  
- 📱 Layout totalmente responsivo e adaptável para diferentes telas.  
- 🧹 Limpeza automática das informações ao limpar o campo de busca ou quando a cidade não é encontrada.

### 🛠 Tecnologias utilizadas
- HTML5  
- CSS3  
- TypeScript  
- Vite  
- Open-Meteo API  

```
📂 Estrutura do projeto:
  /climate
  │
  ├── .github/
  │   └── workflows/
  │       └── deploy.yml
  ├── .gitignore
  ├── index.html
  ├── package-lock.json
  ├── package.json
  ├── README.md
  ├── tsconfig.json
  ├── vite.config.js
  ├── public/
  │   └── .nojekyll
  └── src/
      ├── main.ts
      ├── style.css
      ├── services/
      │   └── openMeteo.ts
      ├── types/
      │   └── weather.ts
      └── utils/
          ├── weatherCode.ts
          └── windDirection.ts
```