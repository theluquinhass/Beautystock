-- === BEAUTYSTOCK: SISTEMA DE AUDITORIA ===
-- Limpa tentativas anteriores caso existam
DROP TABLE IF EXISTS public.audit_logs;

CREATE TABLE public.audit_logs (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id     UUID,
    action      TEXT NOT NULL,
    details     JSONB DEFAULT '{}',
    ip_address  INET,
    user_agent  TEXT,
    status      TEXT NOT NULL DEFAULT 'success'
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_status ON public.audit_logs(status) WHERE status != 'success';

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
