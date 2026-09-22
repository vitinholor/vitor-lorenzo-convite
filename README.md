# Convite Vitor Lorenzo — 1 ano

Primeira versão funcional do convite digital.

## O que já existe

- Convite responsivo para celular usando a arte enviada.
- Botões para confirmar presença ou informar ausência.
- Nome do convidado.
- Quantidade de acompanhantes quando a resposta é SIM.
- Banco de dados SQLite para guardar as respostas.
- Painel administrativo em `/admin.html`.
- Login separado para o painel.
- Pesquisa, contadores e exclusão de respostas.

## Rodar no computador

1. Instale Node.js 20+.
2. Abra o terminal nesta pasta.
3. Rode `npm install`.
4. Copie `.env.example` para `.env`.
5. Altere `ADMIN_PASSWORD` e `SESSION_SECRET`.
6. Rode `npm start`.
7. Abra `http://localhost:3000`.
8. O painel fica em `http://localhost:3000/admin.html`.

## Para publicar na internet

O projeto precisa ser hospedado em um serviço que execute Node.js e mantenha o banco SQLite em disco persistente. Antes de publicar, defina uma senha forte no `.env`, use HTTPS e troque o armazenamento de sessão por um store persistente se o serviço reiniciar com frequência.

## Próxima etapa

A interface pode ser refinada para ficar ainda mais próxima da arte, e o sistema pode receber:
- botão "Como chegar" com mapa;
- confirmação por convidado/família;
- limite ou lista de acompanhantes;
- exportação para Excel;
- QR Code;
- mensagem pronta para WhatsApp;
- opção de alterar a resposta.
