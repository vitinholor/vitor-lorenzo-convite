# Convite Vitor Lorenzo — 1 ano

Convite digital do aniversário de 1 ano do Vitor Lorenzo.

## Informações

- Data: 27/12/2026
- Horário: 14:30
- Local: Rua Barão do Rio Branco, 23 — Pontal, Ilhéus - BA

## Recursos

- Convite adaptado para celular.
- Arte oficial do convite.
- Confirmação de presença.
- Opção de informar ausência.
- Nome do convidado.
- Quantidade de acompanhantes.
- Banco de dados PostgreSQL.
- Painel administrativo protegido por login.
- Consulta das confirmações.
- Contagem de confirmados e ausentes.
- Exclusão de respostas pelo painel administrativo.

## Estrutura

- `public/` — arquivos do convite e painel.
- `server.js` — servidor da aplicação.
- `package.json` — dependências do projeto.

## Configuração

O projeto utiliza variáveis de ambiente para configurar o banco de dados, o acesso administrativo e a sessão.

Variáveis necessárias:

- `DATABASE_URL`
- `ADMIN_USER`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `PORT`

## Publicação

O projeto pode ser hospedado em um serviço compatível com Node.js e PostgreSQL.

O banco de dados deve ser configurado por meio da variável `DATABASE_URL`.

## Painel administrativo

O painel administrativo permite consultar as respostas de presença e acompanhar:

- Confirmados;
- Ausentes;
- Quantidade de acompanhantes;
- Lista de convidados.

O acesso é protegido por usuário e senha.
