import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1766196276669 implements MigrationInterface {
    name = 'InitialSchema1766196276669'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" character varying(36) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "userId" character varying(36) NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" character varying(36) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "name" text NOT NULL, "email" text NOT NULL, "password" text NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comments" ("id" character varying(36) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "content" text NOT NULL, "authorId" character varying(36) NOT NULL, "questionId" character varying(36), "answerId" character varying(36), CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "questions" ("id" character varying(36) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "title" text NOT NULL, "slug" text NOT NULL, "content" text NOT NULL, "authorId" character varying(36) NOT NULL, "bestAnswerId" character varying(36), CONSTRAINT "UQ_a9cd7cd3b1c78e50d8383aa0d79" UNIQUE ("slug"), CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attachments" ("id" character varying(36) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "title" text NOT NULL, "url" text NOT NULL, "questionId" character varying(36), "answerId" character varying(36), CONSTRAINT "PK_5e1f050bcff31e3084a1d662412" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "answers" ("id" character varying(36) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "content" text NOT NULL, "authorId" character varying(36) NOT NULL, "questionId" character varying(36) NOT NULL, "excerpt" text NOT NULL, CONSTRAINT "PK_9c32cec6c71e06da0254f2226c6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "answers_questionId_createdAt_idx" ON "answers" ("questionId", "createdAt") `);
        await queryRunner.query(`CREATE INDEX "answers_createdAt_idx" ON "answers" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "answers_authorId_idx" ON "answers" ("authorId") `);
        await queryRunner.query(`CREATE INDEX "answers_questionId_idx" ON "answers" ("questionId") `);
        await queryRunner.query(`CREATE TABLE "email_validations" ("id" character varying(36) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "email" text NOT NULL, "code" text NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "isVerified" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_27485e6aca206cacf66bbb8ca0a" UNIQUE ("email"), CONSTRAINT "PK_08d80d6eda7f84a47d35cc75131" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_4548cc4a409b8651ec75f70e280" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_8db2a234357898ee18a16f5d409" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_192a303f8641f3eef18568e2f45" FOREIGN KEY ("answerId") REFERENCES "answers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_ca251175a93ed97051be0df6e6f" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attachments" ADD CONSTRAINT "FK_8987a8c08a73aea658b6c421431" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attachments" ADD CONSTRAINT "FK_ee2d70a4e6fe247db63102030f8" FOREIGN KEY ("answerId") REFERENCES "answers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_eb21b7568b66f2fbc1d0f8c0ddd" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_c38697a57844f52584abdb878d7" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_c38697a57844f52584abdb878d7"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_eb21b7568b66f2fbc1d0f8c0ddd"`);
        await queryRunner.query(`ALTER TABLE "attachments" DROP CONSTRAINT "FK_ee2d70a4e6fe247db63102030f8"`);
        await queryRunner.query(`ALTER TABLE "attachments" DROP CONSTRAINT "FK_8987a8c08a73aea658b6c421431"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_ca251175a93ed97051be0df6e6f"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_192a303f8641f3eef18568e2f45"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_8db2a234357898ee18a16f5d409"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_4548cc4a409b8651ec75f70e280"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`);
        await queryRunner.query(`DROP TABLE "email_validations"`);
        await queryRunner.query(`DROP INDEX "public"."answers_questionId_idx"`);
        await queryRunner.query(`DROP INDEX "public"."answers_authorId_idx"`);
        await queryRunner.query(`DROP INDEX "public"."answers_createdAt_idx"`);
        await queryRunner.query(`DROP INDEX "public"."answers_questionId_createdAt_idx"`);
        await queryRunner.query(`DROP TABLE "answers"`);
        await queryRunner.query(`DROP TABLE "attachments"`);
        await queryRunner.query(`DROP TABLE "questions"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    }

}
