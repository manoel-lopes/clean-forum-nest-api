import { MigrationInterface, QueryRunner } from "typeorm";

export class AddParentIdCheckConstraints1766196400000 implements MigrationInterface {
    name = 'AddParentIdCheckConstraints1766196400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "comments" ADD CONSTRAINT "CHK_comment_parent_id" CHECK (
                (type = 'question' AND "questionId" IS NOT NULL AND "answerId" IS NULL) OR
                (type = 'answer' AND "answerId" IS NOT NULL AND "questionId" IS NULL)
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "attachments" ADD CONSTRAINT "CHK_attachment_parent_id" CHECK (
                (type = 'question' AND "questionId" IS NOT NULL AND "answerId" IS NULL) OR
                (type = 'answer' AND "answerId" IS NOT NULL AND "questionId" IS NULL)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attachments" DROP CONSTRAINT "CHK_attachment_parent_id"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "CHK_comment_parent_id"`);
    }

}
