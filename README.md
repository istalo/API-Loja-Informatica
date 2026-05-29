# API de Vendas Loja de Informática

## :technologist: Descrição

Uma API para uma loja de informática que lista as vendas, clientes, produtos e histórico diário de vendas.

---

## :mag_right: Funcionalidades

1. Lista de Produtos: função para listar produtos a venda, com nome, estoque, preço, categoria e opcionalmente descrição.

2. Lista de Vendas: função para realizar a venda de um ou mais produtos para um cliente.

3. Lista de Clientes: função para listar os clientes dessa loja, um cliente deve possuir nome, email e endereço, sendo seu número de telefone opcional.

4. Lista de Histórico: função para listar o fechamento de vendas que a loja teve durante o decorrer de um dia.

---

## :memo: Pré-Requisitos
- Node.js e Prisma

### Instalação das Dependências

Abra o terminal e digite o comando:

```bash
npm i
```

Ele irá instalar as dependências do node, após, crie um arquivo .env com o template:

```bash
DATABASE_URL="mysql://username:password@:3306/loja_informatica"
DATABASE_USER=""
DATABASE_PASSWORD=""
DATABASE_NAME="loja_informatica"
DATABASE_HOST="localhost"
DATABASE_PORT=3306

MAILTRAP_EMAIL=""
MAILTRAP_SENHA=""
```

Em seguida, gere a lista com o prisma:

```bash
npx prisma generate
```

(Opcional) Use o arquivo seed.ts para popular a lista de produtos:

```bash
npx prisma seed db
```

Por fim, rode o servidor:

```bash
npm run dev
```

---

## :nerd_face: Autor

Ítalo Valente

Desenvolvimento de Serviços e APIs (Senac RS)
