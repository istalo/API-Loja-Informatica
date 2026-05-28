/*
  Warnings:

  - You are about to drop the `itens_venda` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `itens_venda` DROP FOREIGN KEY `itens_venda_produtoId_fkey`;

-- DropForeignKey
ALTER TABLE `itens_venda` DROP FOREIGN KEY `itens_venda_vendaId_fkey`;

-- DropTable
DROP TABLE `itens_venda`;

-- CreateTable
CREATE TABLE `itens_vendas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vendaId` INTEGER NOT NULL,
    `produtoId` INTEGER NOT NULL,
    `quantidade` SMALLINT NOT NULL,
    `precoUnid` DECIMAL(9, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `itens_vendas` ADD CONSTRAINT `itens_vendas_vendaId_fkey` FOREIGN KEY (`vendaId`) REFERENCES `vendas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_vendas` ADD CONSTRAINT `itens_vendas_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `produtos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
