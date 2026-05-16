# TODO: Persistir mensagens do chat da transmissão (Modo Ambiente / Watchparty)

> Nota criada em 12/05/2026. Implementar em uma nova conversa, não nesta.

## Contexto

Hoje as mensagens do chat da transmissão (modo ambiente, YouTube watchparty) **não são persistidas no banco de dados**. Elas vivem apenas no cache do Django:

- Função: `_save_room_ambience_chat` em `playgether-api/chat/consumers.py`
- Chave de cache: `room_ambience_chat:{room.slug}`
- Backend de cache:
  - Sem `REDIS_URL`: `LocMemCache` (memória do processo, perde tudo no restart)
  - Com `REDIS_URL`: Redis (cache, não armazenamento durável)
- Limite: máximo 200 mensagens por transmissão (`messages[-200:]`); as mais antigas são descartadas automaticamente.

Para comparação, **existem** modelos persistidos para outros chats:

- `chat/models.py::GroupMessage` — mensagens do chat principal da sala
- `room_events/models.py::RoomEventMessage` — mensagens do chat dos eventos

## Por que devemos persistir

1. **Moderação e compliance.** Se um usuário denunciar uma mensagem com discurso de ódio
   ou ameaça depois que o cache rotacionar (ou após restart do servidor), não há como
   recuperar a evidência. Precisamos do registro durável para banir com base em prova.
2. **LGPD / obrigações legais.** Em caso de processo ou ordem judicial, podemos ser
   obrigados a preservar comunicações. Cache não atende a esse requisito.
3. **Features futuras.** Replay da watchparty, busca em histórico, estatísticas de
   engajamento, transcrição/sumário por IA, etc.
4. **Custo é baixo.** Uma tabela análoga ao `RoomEventMessage` resolve, com índice
   composto `(room_id, -created_at)` para paginação eficiente.

## Design proposto

### Modelo

`playgether-api/chat/models.py` (novo modelo):

```python
class RoomAmbienceMessage(models.Model):
    room = models.ForeignKey(
        ChatGroup,
        related_name="ambience_messages",
        on_delete=models.CASCADE,
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="ambience_messages",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Null para mensagens de sistema.",
    )
    body = models.CharField(max_length=500)
    is_system = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    # Moderação (soft-delete para preservar evidência)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="ambience_messages_deleted",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    deletion_reason = models.CharField(max_length=200, blank=True)

    # Snapshot do video em que a mensagem foi enviada (debug e replay)
    video_id_at_send = models.CharField(max_length=20, blank=True)
    position_sec_at_send = models.FloatField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["room", "-created_at"]),
        ]
        ordering = ["-created_at"]
```

### Fluxo no consumer

`playgether-api/chat/consumers.py` em `_handle_room_ambience` action `send_message`:

1. Continuar gravando no cache (latência baixa para broadcast em tempo real).
2. Em paralelo (`database_sync_to_async` se assíncrono, ou síncrono mesmo), criar a
   linha em `RoomAmbienceMessage` — não bloquear o broadcast.
3. O `id` enviado no payload do WebSocket pode passar a ser o PK do banco (em vez do
   contador in-memory `next_id`), garantindo unicidade global e referenciabilidade.

### Endpoint REST de histórico

`playgether-api/chat/views.py` — adicionar ao `ChatGroupView`:

```python
@action(detail=True, methods=["get"], url_path="ambience-messages")
def ambience_messages(self, request, slug=None):
    """Paginação cursor-based (mais recentes primeiro) do histórico do chat da transmissão."""
    room = self.get_object()
    qs = RoomAmbienceMessage.objects.filter(
        room=room,
        deleted_at__isnull=True,
    ).select_related("author", "author__profile")
    paginator = DefaultChatRoomPagination()
    page = paginator.paginate_queryset(qs, request)
    serializer = RoomAmbienceMessageSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)
```

### Endpoint de moderação (admin)

`@action(detail=True, methods=["delete"], url_path="ambience-messages/(?P<msg_id>[0-9]+)")`
para soft-delete por moderador, gravando `deleted_at`, `deleted_by`, `deletion_reason`.

### Política de retenção

Configurável via setting `AMBIENCE_CHAT_RETENTION_DAYS` (default: `None` = mantém para
sempre). Se definido, criar um management command `purge_ambience_messages` rodado
periodicamente (cron / Celery beat) que faz hard delete de mensagens já com soft-delete
e mais antigas que N dias.

### Frontend

`playgether-web/src/components/pages/rooms/RoomAmbiencePanel.tsx`:

- Carregar histórico via REST no mount do componente (antes de receber o snapshot via WS),
  para que o usuário veja mensagens antigas mesmo após restart do servidor.
- Merge entre histórico REST + mensagens recebidas via WS (deduplicar por `id`).

### Migração de dados

Nenhuma — começamos do zero. As mensagens atualmente em cache não precisam migrar.

## Checklist de implementação

- [ ] Criar modelo `RoomAmbienceMessage`
- [ ] Migration
- [ ] Serializer `RoomAmbienceMessageSerializer`
- [ ] Gravação no banco dentro de `_handle_room_ambience` action `send_message`
- [ ] Endpoint REST `GET /api/v1/chatrooms/{slug}/ambience-messages/`
- [ ] Endpoint admin de soft-delete
- [ ] Frontend: chamar histórico no mount + merge com WS
- [ ] Setting `AMBIENCE_CHAT_RETENTION_DAYS` + management command opcional
- [ ] Testes: criação, paginação, soft-delete, autorização (apenas owner/moderador deleta)
- [ ] Documentar no `schema.yml`

## Pontos abertos para decidir antes

- Mensagens de sistema (troca de vídeo, encerramento, etc.) devem ser persistidas
  também? Eu acho que sim, ajuda no replay/auditoria.
- Quem pode moderar/deletar? Apenas o `room.owner`, ou também o host atual da
  transmissão? Sugestão: `room.owner` e `host_user_id` da transmissão ativa.
- Em caso de banimento, queremos preservar o `author` mesmo após delete da conta?
  O `on_delete=SET_NULL` que sugeri já cobre isso — a mensagem sobrevive mas o autor
  vira `None`. Talvez precise denormalizar `author_username_snapshot` para que
  banimentos retroativos não percam o nome.
