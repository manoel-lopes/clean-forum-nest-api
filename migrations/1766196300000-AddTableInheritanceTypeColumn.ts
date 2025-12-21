import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTableInheritanceTypeColumn1766196300000 implements MigrationInterface {
    name = 'AddTableInheritanceTypeColumn1766196300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" ADD "type" character varying NOT NULL DEFAULT 'question'`);
        await queryRunner.query(`ALTER TABLE "attachments" ADD "type" character varying NOT NULL DEFAULT 'question'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attachments" DROP COLUMN "type"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "type"`);
    }

}
