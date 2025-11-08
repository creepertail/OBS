import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBookTables1762584580047 implements MigrationInterface {
    name = 'CreateBookTables1762584580047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 建立 book 表
        await queryRunner.query(`CREATE TABLE \`book\` (\`bookID\` varchar(36) NOT NULL, \`ISBN\` char(13) NOT NULL, \`Name\` varchar(100) NOT NULL, \`Status\` int NOT NULL DEFAULT '0', \`ProductDescription\` varchar(500) NOT NULL, \`InventoryQuantity\` int NOT NULL DEFAULT '0', \`Price\` int NOT NULL DEFAULT '0', \`Author\` varchar(200) NOT NULL, \`Publisher\` varchar(50) NOT NULL, \`MerchantID\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`bookID\`)) ENGINE=InnoDB`);

        // 建立 book_images 表
        await queryRunner.query(`CREATE TABLE \`book_images\` (\`imageID\` varchar(36) NOT NULL, \`imageUrl\` varchar(500) NOT NULL, \`displayOrder\` int NOT NULL DEFAULT '0', \`isCover\` tinyint NOT NULL DEFAULT 0, \`bookID\` varchar(36) NOT NULL, PRIMARY KEY (\`imageID\`)) ENGINE=InnoDB`);

        // 建立外鍵約束
        await queryRunner.query(`ALTER TABLE \`book_images\` ADD CONSTRAINT \`FK_40fcd2d035e736be671f57f3cfd\` FOREIGN KEY (\`bookID\`) REFERENCES \`book\`(\`bookID\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 刪除外鍵約束
        await queryRunner.query(`ALTER TABLE \`book_images\` DROP FOREIGN KEY \`FK_40fcd2d035e736be671f57f3cfd\``);

        // 刪除 book_images 表
        await queryRunner.query(`DROP TABLE \`book_images\``);

        // 刪除 book 表
        await queryRunner.query(`DROP TABLE \`book\``);
    }

}
