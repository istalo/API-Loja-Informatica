import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"
import { TipoPag } from "../../generated/prisma/enums";

const router = Router()

export const vendaSchema = z.object({
    clienteId: z.number().int().positive('ID do cliente deve ser um número positivo'),
    produtoId: z.number().int().positive('ID do produto deve ser um número positivo'),
    quantidade: z.number().int().positive('Quantidade deve ser um número positivo'),
    formaPag: z.enum(TipoPag)
})

router.get("/", async (req, res) => {
    try {
        const vendas = await prisma.venda.findMany({
            include: { cliente: true, produto: true }
        })
        res.status(200).json(vendas)
    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

router.post("/", async (req, res) => {
    const valida = vendaSchema.safeParse(req.body)

    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { clienteId, produtoId, quantidade, formaPag } = valida.data

    try {
        const cliente = await prisma.cliente.findUnique({
            where: { id: clienteId }
        })
        if (!cliente) {
            res.status(404).json({ erro: 'Cliente não cadastrado' })
            return
        }

        const produto = await prisma.produto.findUnique({
            where: { id: produtoId }
        })
        if (!produto) {
            res.status(404).json({ erro: 'Produto não cadastrado' })
            return
        }
        if (produto.estoque < quantidade) {
            res.status(400).json({ erro: 'Estoque insuficiente' })
            return
        }

        const valorTotal = Number(produto.preco) * quantidade

        // Obter data de hoje (sem horas, para usar no HistoricoDiario)
        const hoje = new Date()
        const dataHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())

        // Fazer tudo em uma transação para garantir que não haja falhas parciais
        const [venda, produtoAtualizado, historico] = await prisma.$transaction([
            prisma.venda.create({ 
                data: { 
                    clienteId, 
                    produtoId, 
                    quantidade, 
                    formaPag, 
                    total: valorTotal 
                }
            }),
            prisma.produto.update({
                where: { id: produtoId },
                data: { estoque: { decrement: quantidade } }
            }),
            prisma.historicoDiario.upsert({
                where: { dataFechamento: dataHoje },
                update: {
                    totalReais: { increment: valorTotal },
                    qtdVendas: { increment: 1 }
                },
                create: {
                    dataFechamento: dataHoje,
                    totalReais: valorTotal,
                    qtdVendas: 1
                }
            })
        ])
        
        res.status(201).json({ venda, produtoAtualizado, historico });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao realizar a compra." });
    }
})
router.delete("/:id", async (req, res) => {
    const { id } = req.params

    try {
        const vendaExcluida = await prisma.venda.findUnique({
            where: { id: Number(id) }
        })

        if (!vendaExcluida) {
            res.status(404).json({ erro: "Venda não encontrada." });
            return;
        }

        // Se uma venda for excluída, devemos estornar o produto para o estoque
        const hoje = new Date(vendaExcluida.data.getFullYear(), vendaExcluida.data.getMonth(), vendaExcluida.data.getDate())

        const [venda] = await prisma.$transaction([
            prisma.venda.delete({ where: { id: Number(id)} }),
            prisma.produto.update({
                where: { id: vendaExcluida.produtoId },
                data: { estoque: { increment: vendaExcluida.quantidade } }
            }),
            prisma.historicoDiario.updateMany({
                where: { dataFechamento: hoje },
                data: {
                    totalReais: { decrement: vendaExcluida.total },
                    qtdVendas: { decrement: 1 }
                }
            })
        ])

        res.status(200).json(venda)
    } catch (error) {
        res.status(500).json({ erro: "Erro interno do servidor" })
    }
})

router.delete("/:id", async (req, res) => {
    const { id } = req.params

    try {
        const vendaExcluida = await prisma.venda.findUnique({
            where: { id: Number(id) }
        })

        if (!vendaExcluida) {
            res.status(404).json({ erro: "Venda não encontrada." });
            return;
        }

        // Se uma venda for excluída, devemos estornar o produto para o estoque
        const hoje = new Date(vendaExcluida.data.getFullYear(), vendaExcluida.data.getMonth(), vendaExcluida.data.getDate())

        const [venda] = await prisma.$transaction([
            prisma.venda.delete({ where: { id: Number(id)} }),
            prisma.produto.update({
                where: { id: vendaExcluida.produtoId },
                data: { estoque: { increment: vendaExcluida.quantidade } }
            }),
            prisma.historicoDiario.updateMany({
                where: { dataFechamento: hoje },
                data: {
                    totalReais: { decrement: vendaExcluida.total },
                    qtdVendas: { decrement: 1 }
                }
            })
        ])

        res.status(200).json(venda)
    } catch (error) {
        res.status(500).json({ erro: "Erro interno do servidor" })
    }
})

export default router
