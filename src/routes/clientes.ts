import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"

const router = Router()

const clienteSchema = z.object({
    nome: z.string()
      .min(3, 'Nome deve possuir no mínimo com 3 caracteres')
      .max(40, 'Nome deve ter no máximo 40 caracteres'),
    email: z.email(),
    telefone: z.string().optional(),
    endereco: z.string()
      .min(3, 'Endereço deve possuir no mínimo com 3 caracteres')
      .max(100, 'Endereço deve ter no máximo 100 caracteres'),
})

router.get("/", async (req, res) => {
    try {
        const clientes = await prisma.cliente.findMany()
        res.status(200).json(clientes)
    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor" })
    }
})

router.post("/", async (req, res) => {
    const valida = clienteSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { nome, email, telefone, endereco} = valida.data

    try {
        const cliente = await prisma.cliente.create({
            data: { nome, email, telefone, endereco }
        })
        res.status(201).json(cliente)
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.put("/:id", async (req, res) => {
    const { id } = req.params

    const valida = clienteSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { nome, email, telefone, endereco } = valida.data

    try {
        const cliente = await prisma.cliente.update({
            where: { id: Number(id) },
            data: { nome, email, telefone, endereco }
        })
        res.status(200).json(cliente)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.delete("/:id", async (req, res) => {
    const { id } = req.params
    
    try {
        const cliente = await prisma.cliente.delete({
            where: { id: Number(id) }
        })
        res.status(200).json(cliente)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

export default router