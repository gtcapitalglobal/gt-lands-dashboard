# 🚀 Guia de Deploy no Netlify - GT Lands Dashboard

## ✅ Repositório GitHub Criado

**URL do Repositório**: https://github.com/gtcapitalglobal/gt-lands-dashboard

Todos os arquivos foram enviados com sucesso para o GitHub! 🎉

---

## 📋 Passos para Deploy no Netlify

### 1️⃣ Acessar Netlify

Acesse: https://app.netlify.com

### 2️⃣ Criar Novo Site

1. Clique no botão **"Add new site"** (canto superior direito)
2. Selecione **"Import an existing project"**

### 3️⃣ Conectar GitHub

1. Escolha **"Deploy with GitHub"**
2. Se solicitado, autorize o Netlify a acessar sua conta GitHub
3. Na lista de repositórios, procure por **"gt-lands-dashboard"**
4. Clique no repositório para selecioná-lo

### 4️⃣ Configurar Build Settings

**Configure exatamente assim:**

```
Site name: gt-lands-dashboard (ou escolha outro nome)
Branch to deploy: main
Build command: (DEIXE VAZIO)
Publish directory: / (ou deixe vazio)
```

**IMPORTANTE**: 
- ❌ NÃO preencha o "Build command"
- ❌ NÃO preencha o "Publish directory" (ou coloque apenas `/`)
- ✅ Este é um site estático HTML puro, não precisa de build

### 5️⃣ Deploy!

1. Clique em **"Deploy [nome-do-site]"**
2. Aguarde 1-2 minutos enquanto o Netlify faz o deploy
3. Você verá um log de deploy em tempo real

### 6️⃣ Acessar Seu Dashboard

Após o deploy finalizar, você verá:

```
✅ Site is live!
🌐 https://[seu-site].netlify.app
```

Clique no link para acessar seu GT Lands Dashboard! 🎊

---

## 🎨 Personalizar Domínio (Opcional)

### Opção 1: Mudar o Subdomínio Netlify

1. Vá em **"Site settings"** → **"Site details"**
2. Clique em **"Change site name"**
3. Digite um novo nome (ex: `gtlands`, `gt-dashboard`, etc.)
4. Seu site ficará: `https://[novo-nome].netlify.app`

### Opção 2: Adicionar Domínio Customizado

1. Vá em **"Site settings"** → **"Domain management"**
2. Clique em **"Add custom domain"**
3. Digite seu domínio (ex: `dashboard.gtcapital.com`)
4. Siga as instruções para configurar DNS

---

## 🔍 Verificar Funcionalidades

Após o deploy, teste:

1. ✅ **Página inicial carrega** (deve redirecionar automaticamente)
2. ✅ **Logo GT Lands aparece** no topo
3. ✅ **Botão IPP funciona** (importar CSV)
4. ✅ **Mapa carrega** (Leaflet)
5. ✅ **Filtros funcionam**
6. ✅ **Botão "Realizar Pesquisas" funciona**
7. ✅ **TELA 2 abre** com carrossel de imagens
8. ✅ **Imagens do Google Maps carregam** (Street View e Satellite)
9. ✅ **11 ferramentas de análise funcionam**

---

## 🔑 APIs Já Configuradas

Todas as APIs já estão configuradas no código:

- ✅ **Google Maps API Key**: AIzaSyBr4UtMOvkhX6LxYOw89zjBkOYNO-_ykag
- ✅ **OpenAI API Key**: sk-proj-rzIFImT0HD5YsEUyBZzK...
- ✅ **RapidAPI Key**: 3eff6f411msh25829339707ed3fp167b43jsn832e9dd3f20d

**Não é necessário configurar variáveis de ambiente no Netlify!**

---

## 📊 Monitorar Uso das APIs

### Google Maps API
- Acesse: https://console.cloud.google.com/apis/dashboard
- Monitore requisições (limite grátis: 28.000/mês)

### OpenAI API
- Acesse: https://platform.openai.com/usage
- Monitore custos (~$5-20/mês esperado)

### RapidAPI
- Acesse: https://rapidapi.com/developer/billing
- Monitore uso do plano BASIC (gratuito)

---

## 🐛 Troubleshooting

### Problema: Site não carrega
**Solução**: Verifique se o "Publish directory" está vazio ou configurado como `/`

### Problema: Imagens do Google Maps não aparecem
**Solução**: 
1. Verifique se a API Key está ativa no Google Cloud Console
2. Confirme que Street View Static API e Maps Static API estão habilitadas

### Problema: Análises de IA não funcionam
**Solução**: Verifique se há créditos na conta OpenAI

### Problema: Erro 404 ao acessar o site
**Solução**: O deploy pode levar 1-2 minutos. Aguarde e recarregue a página.

---

## 🔄 Atualizações Futuras

Para atualizar o dashboard:

1. Faça alterações nos arquivos localmente
2. Commit e push para o GitHub:
   ```bash
   git add .
   git commit -m "Descrição da mudança"
   git push
   ```
3. O Netlify detecta automaticamente e faz redeploy!

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs de deploy no Netlify
2. Teste o dashboard localmente abrindo `dashboard-v20-simple.html` no navegador
3. Verifique o console do navegador (F12) para erros JavaScript

---

## 🎉 Pronto!

Seu GT Lands Dashboard está pronto para uso profissional! 

**Próximos passos sugeridos:**
1. Compartilhe o link com sua equipe
2. Teste com dados reais de Parcel Fair
3. Monitore o uso das APIs
4. Considere adicionar domínio customizado

**Bom trabalho!** 🏆

---

© 2024 GT Capital Global

