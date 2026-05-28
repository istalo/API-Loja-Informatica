import { prisma } from "../lib/prisma";
import { type Prisma } from "../generated/prisma/client"

const produtos: Prisma.ProdutoCreateInput[] = [
    {
        nome: "Mouse Gamer",
        estoque: 50,
        categoria: "Periféricos",
        preco: 199.99,
        descricao: "Mouse com alta precisão e iluminação RGB"
    },
    {
        nome: "Teclado Mecânico",
        estoque: 35,
        categoria: "Periféricos",
        preco: 349.90,
        descricao: "Teclado mecânico com switches azuis, design compacto e anti-ghosting"
    },
    {
        nome: "Headset Gamer 7.1",
        estoque: 20,
        categoria: "Áudio",
        preco: 289.50,
        descricao: "Fones de ouvido com som surround 7.1, microfone com cancelamento de ruído e espumas confortáveis"
    },
    {
        nome: "Monitor Gamer 24\" 144Hz",
        estoque: 15,
        categoria: "Monitores",
        preco: 1299.00,
        descricao: "Monitor Full HD de 24 polegadas com taxa de atualização de 144Hz e tempo de resposta de 1ms"
    },
    {
        nome: "Placa de Vídeo RTX 4060",
        estoque: 8,
        categoria: "Hardware",
        preco: 2499.99,
        descricao: "Placa de vídeo com 8GB GDDR6, suporte a Ray Tracing e DLSS 3"
    },
    {
        nome: "SSD NVMe 1TB",
        estoque: 60,
        categoria: "Armazenamento",
        preco: 459.90,
        descricao: "Armazenamento ultrarrápido com velocidade de leitura de até 3500MB/s"
    },
    {
        nome: "Memória RAM 16GB DDR4",
        estoque: 45,
        categoria: "Hardware",
        preco: 229.90,
        descricao: "Módulo de memória de 16GB com frequência de 3200MHz e dissipador de calor"
    },
    {
        nome: "Cadeira Gamer Ergonômica",
        estoque: 10,
        categoria: "Móveis",
        preco: 899.00,
        descricao: "Cadeira com ajuste de altura, inclinação de 180 graus e almofadas para lombar e pescoço"
    },
    {
        nome: "Mousepad Extra Grande",
        estoque: 100,
        categoria: "Acessórios",
        preco: 89.90,
        descricao: "Mousepad tamanho 90x40cm com bordas costuradas e base emborrachada"
    },
    {
        nome: "Processador Ryzen 7 5700X",
        estoque: 12,
        categoria: "Hardware",
        preco: 1349.00,
        descricao: "Processador de 8 núcleos e 16 threads, excelente para jogos e produtividade"
    }
]

async function main() {
    try {
        await prisma.produto.createMany({ data: produtos })
        console.log(`${produtos.length} Produtos Cadastrados...`)
    } catch (error) {
        console.error("Erro nas Inclusões (Seeds):", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

await main()
