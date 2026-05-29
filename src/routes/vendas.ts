import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"
import { TipoPag } from "../../generated/prisma/enums"
import nodemailer from "nodemailer"

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

        const hoje = new Date()
        const dataHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())

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
        
        enviaEmailCompra(cliente, produto, venda);

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

function gerarReciboHTML(clienteNome: string, produtoNome: string, precoUnitario: number, quantidade: number, total: number, formaPag: string, data: Date) {
  const dataFormatada = data.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  return `
    <html>
    <body style="font-family: Helvetica, Arial, sans-serif;">
      <h2>InfoSul - Confirmação de Compra</h2>
      <p>Olá, <strong>${clienteNome}</strong>!</p>
      <p>Obrigado por comprar conosco. Abaixo estão os detalhes da sua compra:</p>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <thead style="background-color: rgb(195, 191, 191);">
          <tr>
            <th>Data da Compra</th>
            <th>Produto</th>
            <th>Qtd</th>
            <th>Valor Unit.</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${dataFormatada}</td>
            <td>${produtoNome}</td>
            <td style="text-align: center;">${quantidade}</td>
            <td style="text-align: right;">R$ ${Number(precoUnitario).toLocaleString("pt-br", { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right;">R$ ${Number(total).toLocaleString("pt-br", { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>
      <p><strong>Forma de Pagamento:</strong> ${formaPag}</p>
      <br>
      <p>Atenciosamente,<br>Equipe InfoSul.</p>
    </body>
    </html>
  `;
}

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAILTRAP_EMAIL,
    pass: process.env.MAILTRAP_SENHA
  },
});

async function enviaEmailCompra(cliente: any, produto: any, venda: any) {
  const mensagem = gerarReciboHTML(
    cliente.nome,
    produto.nome,
    Number(produto.preco),
    venda.quantidade,
    Number(venda.total),
    venda.formaPag,
    venda.data
  );

  try {
    const info = await transporter.sendMail({
      from: 'Loja InfoSul <vendas@infosul.com.br>',
      to: cliente.email,
      subject: "Confirmação de Compra - InfoSul",
      text: `Olá ${cliente.nome}, confirmação da compra de ${venda.quantidade}x ${produto.nome} no valor de R$ ${venda.total}.`,
      html: mensagem, // HTML body
    });
    console.log("Email enviado:", info.messageId);
  } catch (error) {
    console.error("Erro ao enviar email:", error);
  }
}

export default router
