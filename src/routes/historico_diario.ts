import { prisma } from "../../lib/prisma"
import { Router } from "express"

const router = Router()

router.get("/", async (req, res) => {
  try {
    const historico = await prisma.historicoDiario.findMany({
      orderBy: { dataFechamento: 'desc' }
    })
    res.status(200).json(historico)
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar histórico diário" })
  }
})

export default router
