CREATE TABLE "categorias" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(120) NOT NULL,
	CONSTRAINT "categorias_nome_unique" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE "produtos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(120) NOT NULL,
	"preco_centavos" integer NOT NULL,
	"categoria_id" integer NOT NULL,
	CONSTRAINT "produtos_preco_positivo" CHECK ("produtos"."preco_centavos" > 0)
);
--> statement-breakpoint
CREATE TABLE "itens_venda" (
	"venda_id" integer NOT NULL,
	"produto_id" integer NOT NULL,
	"quantidade" integer NOT NULL,
	"preco_unitario_centavos" integer NOT NULL,
	CONSTRAINT "itens_venda_venda_id_produto_id_pk" PRIMARY KEY("venda_id","produto_id"),
	CONSTRAINT "itens_venda_quantidade_positiva" CHECK ("itens_venda"."quantidade" > 0),
	CONSTRAINT "itens_venda_preco_positivo" CHECK ("itens_venda"."preco_unitario_centavos" > 0)
);
--> statement-breakpoint
CREATE TABLE "vendas" (
	"id" serial PRIMARY KEY NOT NULL,
	"total_centavos" integer NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vendas_total_positivo" CHECK ("vendas"."total_centavos" > 0)
);
--> statement-breakpoint
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itens_venda" ADD CONSTRAINT "itens_venda_venda_id_vendas_id_fk" FOREIGN KEY ("venda_id") REFERENCES "public"."vendas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itens_venda" ADD CONSTRAINT "itens_venda_produto_id_produtos_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "produtos_categoria_id_idx" ON "produtos" USING btree ("categoria_id");--> statement-breakpoint
CREATE INDEX "itens_venda_produto_id_idx" ON "itens_venda" USING btree ("produto_id");