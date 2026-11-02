export const isTakehkManagedBot = bot => bot?.bot_config?.takehk_managed === true;

export const takehkWebhookUrl = bot => bot?.bot_config?.webhook_url || '';
