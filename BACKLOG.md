# Documento de Backlog - TechPança E-Commerce

**Data:** 30/09/2026, 11h36
**Versão:** Primeira rodada de ajustes e correções.

## Regras de Execução
1. Não aceitar "Vibe Coding", exigindo sempre este documento de backlog.
2. Confirmar esquema do banco de dados e garantir que todas as operações respeitem o esquema do Supabase.
3. Registrar e armazenar no repositório um relatório de resultado deste backlog (`RELATORIO_RESULTADO_BACKLOG.md`).

## Itens do Backlog

### Item 1: Máscaras nos campos de telefone e CPF no cadastro de clientes
- **Descrição:** Aplicar máscaras de CPF (`000.000.000-00`) e Telefone (`(00) 90000-0000` / `(00) 0000-0000`) dinamicamente enquanto o usuário digita nos formulários de cadastro.
- **Armazenamento:** No Supabase, armazenar apenas os dígitos numéricos limpos (sem pontuação).

### Item 2: Campo cadastrar clientes na área do administrador
- **Descrição:** Adicionar botão "+ Novo Cliente" e modal de formulário na aba "Clientes" do Painel Admin para permitir o cadastro manual de clientes pelos administradores.

### Item 3: Mudar o nome do produto quando atualizado
- **Descrição:** Garantir que a edição e atualização do nome de um produto reflita imediatamente na tabela admin, vitrine da loja, página de detalhes e carrinho.

### Item 4: Ajustar campo para promoções (Erro ao salvar RLS 401)
- **Descrição:** Tratar o erro de política RLS (`42501`) do Supabase no salvamento de promoções sem travar a aplicação, utilizando fallback com sincronização de memória/armazenamento local.

### Item 6: Senha para acessar a área do administrador
- **Descrição:** Proteger o acesso ao Painel Admin exigindo validação de senha (`admin123`) com modal de autenticação.

### Item 7: Ajustar o modo noturno
- **Descrição:** Corrigir os botões de alternância de tema (Dark/Light mode) para funcionarem corretamente e garantir boa visibilidade em ambos os temas.

### Item 8: Campo novo produto produzindo erro RLS 401
- **Descrição:** Tratar o erro de política RLS (`42501`) do Supabase na criação de novos produtos sem travar a aplicação, utilizando fallback com sincronização de memória/armazenamento local.
