import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"
import { TipoPag } from "../../generated/prisma/enums";

const router = Router()

export const vendaSchema = z.object({
    clienteId: z.number().int()
      .positive('ID do cliente deve ser um número positivo'),
    formaPag: z.enum(TipoPag),
    total: z.number()
      .positive('Total da venda deve ser um número positivo'),
})

router.get("/", async (req, res) => {
    try {
        const vendas = await prisma.venda.findMany({
            include: { cliente: true }
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

    const { clienteId, formaPag, total } = valida.data

    const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId }
    })

    if (!cliente) {
        res.status(404).json({ erro: 'Cliente não cadastrado' })
        return
    }

    try {
        const venda = await prisma.venda.create({ 
            data: { clienteId, formaPag, total }
        });
        
        res.status(201).json(venda);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao criar a venda." });
    }
})

router.delete("/:id", async (req, res) => {
    const { id } = req.params

    try {
        const vendaExcluida = await prisma.venda.findUnique(
            { where: { id: Number(id)} }
        )

    if (!vendaExcluida) {
        res.status(404).json({ erro: "Venda não encontrada." });
        return;
      }
        const [venda,cliente] = await prisma.$transaction([
            prisma.venda.delete({ where: { id: Number(id)} }),
            prisma.cliente.update({
              data: { saldo: { decrement: vendaExcluida?.total }},
              where: { id: vendaExcluida?.clienteId }
           })
        ])

        res.status(200).json({venda: venda, cliente})
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

export default router