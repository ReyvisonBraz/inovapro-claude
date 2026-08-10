# Comparativo com SaaS similares e proposta de melhorias — INOVA PRO

> Criado em 2026-08-10 a partir da análise dos principais concorrentes de gestão de assistência técnica (OS) no Brasil.
> Objetivo: identificar gaps competitivos e propor melhorias priorizadas, amarradas ao roadmap `2026-07-04-plano-melhorias-geral.md`.

---

## 1. Referências de mercado avaliadas

| SaaS | Posicionamento | Diferenciais comuns |
|------|----------------|---------------------|
| **Ordemfy** | OS + PDV + estoque + financeiro + fiscal, feito só para assistência | Checklist de entrada/saída, assinatura, fotos, QR Code, marketplace, garantia |
| **Tech OS** | OS digital enxuto, foco em notificação automática | **Notificações automáticas via WhatsApp/e-mail** a cada mudança de status, checklist, fotos, assinatura digital, dashboard de receita |
| **AssistênciaPro** | Gestão completa em nuvem | Histórico do equipamento, baixa automática de estoque na OS, orçamento com aprovação, controle de permissões por perfil |
| **Técnica Sistemas** | OS para celular/informática | Painel técnico/gerencial, DRE, PDV/caixa, dashboard no celular |
| **GestãoClick / 77Gestão** | ERP com módulo de OS | Tipos e status configuráveis, equipamento vinculado, **comissão de técnicos**, **contratos recorrentes**, emissão fiscal |
| **Tecniko** | OS + técnicos + campo | App para técnicos, assinatura digital, **localização/geolocalização**, IA p/ resumir atendimentos |

**Padrão do mercado 2026 (o que "todo concorrente forte já tem"):** checklist de entrada/saída, fotos na OS, assinatura digital, notificação automática de status ao cliente (WhatsApp), garantia com controle de retorno, baixa de estoque ligada à OS, dashboard gerencial, acesso mobile (celular/tablet), controle de permissões por perfil.

---

## 2. O que o INOVA PRO já cobre (fortes)

- OS com status configuráveis e prioridades, filtros, modos **grid/list** (grid agora fixo como default).
- Rastreio público de OS por QR Code / link (`/api/public/os/:token`).
- Notificação de status via WhatsApp (disparo manual em status-chave: Concluído, Pronto, Aguardando Autorização/Aprovação) e lembrete de pagamento (`lib/whatsappUtils`, link wa.me).
- Informática (estoque)/financeiro integrados, contas a receber, transações.
- Relatórios, export, impressão/preview de OS e recibo.
- IA para gerar texto (`POST /api/ai/generate`).
- Segurança e integridade maduras: JWT curto + refresh, rate-limit, CORS, lock otimista `version`, atomicidade em financeiro/estoque, ConflictModal, idempotency, audit log, cifragem de credenciais.
- Autosave de rascunho + restauração após conflito/queda de conexão.

---

## 3. Proposta de melhorias (priorizadas)

> Esforço (S/M/L) é estimativa relativa. Itens já previstos no roadmap vêm com a referência.

### 🔴 Alto valor competitivo (diferenciais que concorrentes usam como argumento de venda)

**M1. Checklist de entrada/saída do equipamento** — o item que mais protege a assistência e todo concorrente forte tem.
- Modelo `ServiceOrder.checklistIn` / `checklistOut` (Json) com itens configuráveis (estado visual, acessórios, senha, série/patrimônio) por tipo de OS.
- Preencher na abertura e na entrega; exibir no preview/impressão e no rastreio público.
- Esforço M.

**M2. Notificação automática de status via WhatsApp (API, não link)** — hoje é wa.me manual; concorrentes enviam sozinhos a cada mudança.
- Usar a integração SendPulse já existente (o `sendPulseClientSecret` já está cifrado e configurado) para disparar em **todo** status-chave, não só em 4.
- Toggle por status em Configurações; template configurável; fila/retry + registro do envio no audit log.
- Esforço M. Custo por mensagem — avaliar volumetria antes.

**M3. Garantia com controle de retorno** — hoje garantia é campo de texto livre.
- Modelo `Warranty` (OS, item serviço/peça, data, validade) + alerta de vencimento e flag "retorno em garantia" na OS.
- Esforço S–M.

**M4. Baixa automática de estoque ao fechar/salvar OS** — já previsto no roadmap Fase 1.4 (decisão de produto pendente).
- Ao salvar OS com `partsUsed`, dar baixa atômica (`decrement` com guarda) na mesma `$transaction`, reaproveitando `PATCH /api/inventory/:id/stock`.
- Decidir o ponto de baixa (orçamento NÃO baixa; aprovação/fechamento baixa) — evita negativo em OS paradas.
- Esforço M.

### 🟡 Forte apelo operacional

**M5. Assinatura digital** — laudos e autorizações de orçamento assinados pelo cliente (canvas/touch → dataURL → Supabase Storage).
- Esforço M.

**M6. Dashboard gerencial de assistência** — funil por status, tempo médio de reparo, pendências paradas, produção por técnico e OS por prioridade. Base motriz já existe em `stats.ts`.
- Esforço M.

**M7. Alertas de baixo estoque** — campo `minStock` em `InventoryItem` + badge/aviso; notificação opcional.
- Esforço S.

**M8. App mobile / responsividade tablet** — já no roadmap Fase 5.3 (pendente). Priorizar tela de OS e dashboard no smartphone, para atendimento no balcão/bancada.
- Esforço L.

**M9. Permissões por perfil mais granulares** — existe `User.permissions` (Json) e roles; expandir para papéis balcão/técnico/gestão com escopo por módulo (ex.: técnico só altera status, não exclui OS).
- Esforço M.

**M10. Disponibilizar o rastreio público como área do cliente** — além do QR Code atual, painel com histórico de OS, garantias, recibo e situação do orçamento (aceitar/rejeitar orçamento online).
- Esforço M.

### 🟢 Menor / estratégico (depende de visão de produto)

- **M11. Tipos de OS configuráveis por fluxo** — hoje status configuráveis; adicionar tipo (reparo, garantia, manutenção, instalação) para relatórios e comissão.
- **M12. Comissão automática de técnicos** por tipo/valor da OS (concorrentes com múltiplos técnicos oferecem).
- **M13. Contratos recorrentes / faturamento automático** (manutenção preventiva mensal) — típico de ERP; validar demanda real antes.
- **M14. PDV leve no balcão** (venda de acessórios/películas ligada ao estoque) — o financeiro já existe, falta o fluxo de venda no balcão.
- **M15. Emissão fiscal (NF-e/NFC-e/NFS-e)** — esforço alto e dependente de certificado; só faz sentido com demanda confirmada.
- **M16. Real-time / multi-usuário e presença** — já delineado no roadmap Fase 3.1/3.3 (Supabase Realtime); hoje a base (ConflictModal, version) já está pronta, falta só assinar canais.

---

## 4. Recomendação de sequência

1. **M1 + M4** — proteção jurídica e estoque correto (impacto operacional imediato).
2. **M7 + M6** — baixo custo, alto retorno de gestão.
3. **M2** — depois de validar custo/template (é o argumento de venda #1 dos concorrentes).
4. **M3 + M5 + M10** — em seguida, fecham o ciclo de atendimento ao cliente.
5. **M8** — contínuo, junto à Fase 5.3 do roadmap.
6. M9/M11–M16 — conforme demanda/equipe.

**Gap mais crítico hoje:** M1 (checklist) e M4 (baixa de estoque) — ambos cobrados pelos concorrentes como "feito para assistência", e nenhum dos dois existe ainda no INOVA PRO. São o diferencial de maior esforço-por-valor para fechar mercado.