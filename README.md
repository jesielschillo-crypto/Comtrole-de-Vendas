# Sincronização em nuvem

Para compartilhar usuários, produtos, clientes, vendas e perfil entre aparelhos:

1. Crie um projeto no Supabase.
2. Execute `supabase/schema.sql` no SQL Editor do projeto.
3. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Reinicie o servidor Vite.

Quando a tabela estiver vazia, o app publica os dados locais existentes como migração inicial. Depois disso, cada gravação atualiza o estado na nuvem e um novo aparelho carrega esse estado antes de abrir o sistema.

O schema atual usa acesso público para acompanhar o login local existente. Para produção, configure Supabase Auth e políticas por usuário/empresa antes de expor dados reais.
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f3b12e81-d7f9-409b-be35-d46e6b92cd89

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
