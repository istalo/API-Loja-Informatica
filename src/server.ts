import express from 'express'
const app = express()
const port = 3000

import routesClientes from "./routes/clientes"
import routesProdutos from "./routes/produtos"
// import routesVendas from "./routes/vendas"
// import routesItensVenda from "./routes/itens_venda"

app.use(express.json())

app.use("/clientes", routesClientes)
app.use("/produtos", routesProdutos)
// app.use("/itens_venda", routesItensVenda)
// app.use("/vendas", routesVendas)

app.get('/', (req, res) => {
  res.send('Sistema de Controle de Estoque - InfoSul')
})

app.listen(port, () => {
  console.log(`Servidor Rodando na Porta: ${port}`)
})
