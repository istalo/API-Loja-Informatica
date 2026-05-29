import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"

const router = Router()

const itemVendaSchema = z.object({
    vendaId: z.number().int().positive(),
    produtoId: z.number().int().positive(),
    quantidade: z.number().int().positive()
})

router.get("/", async (req, res) => {
  try {
    const itensVenda = await prisma.itensVenda.findMany()
    res.status(200).json(itensVenda)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {
    const valida = itemVendaSchema.safeParse(req.body)
    
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { vendaId, produtoId, quantidade } = valida.data

    try {
        const produto = await prisma.produto.findUnique({
            where: { id: produtoId }
        })

        if (!produto) return res.status(404).json({ erro: "Produto não encontrado" })
        if (produto.estoque < quantidade) return res.status(400).json({ erro: "Estoque insuficiente" })

        const precoUnid = produto.preco
        const subtotal = Number(precoUnid) * quantidade

        const [novoItem, vendaAtualizada] = await prisma.$transaction([
            prisma.itensVenda.create({
                data: {
                    vendaId,
                    produtoId,
                    quantidade,
                    precoUnid
                }
            }),
            prisma.produto.update({
                where: { id: produtoId },
                data: {
                    estoque: { decrement: quantidade }
                }
            }),
            prisma.venda.update({
                where: { id: vendaId },
                data: {
                    total: { increment: subtotal }
                }
            })
        ])

        res.status(201).json({ novoItem, vendaDetalhes: vendaAtualizada })

    } catch (error) {
        console.error(error)
        res.status(500).json({ erro: "Erro ao adicionar item à venda." })
    }
})

export default router