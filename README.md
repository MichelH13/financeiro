# 💸 FinFlow · Sistema de Controle de Gastos

Um sistema pessoal de controle financeiro feito com **HTML, CSS e JavaScript puro**, sem dependências externas. Dados salvos no navegador via `localStorage`.

## ✨ Funcionalidades

- **Lançamentos** de receitas e despesas com descrição, valor, data e categoria
- **Navegação por mês** — visualize qualquer período
- **Resumo em cards**: total de receitas, despesas, saldo e taxa de poupança
- **Gráfico dos últimos 6 meses** (receitas vs despesas)
- **Breakdown por categoria** com barras de progresso
- **Busca e filtros**: por texto, categoria e ordenação
- **Paginação** da lista de lançamentos
- **Dados persistidos** no `localStorage` (nenhum backend necessário)
- Dados de exemplo pré-carregados na primeira visita

## 🚀 Como hospedar no GitHub Pages

1. **Crie um repositório** no GitHub (ex: `finflow`)
2. **Faça upload** do arquivo `index.html`
3. Vá em **Settings → Pages**
4. Em **Source**, selecione `Deploy from a branch`
5. Escolha a branch `main` e a pasta `/ (root)`
6. Clique em **Save**

Após alguns minutos, seu site estará disponível em:
```
https://seu-usuario.github.io/finflow/
```

## 📁 Estrutura

```
finflow/
└── index.html   ← arquivo único, tudo incluso
```

## 🛠️ Tecnologias

- HTML5 semântico
- CSS3 com variáveis customizadas e modo escuro automático
- JavaScript ES6+ (sem frameworks)
- Google Fonts: DM Sans + DM Serif Display
- localStorage para persistência dos dados

## 📄 Licença

MIT — use à vontade!
