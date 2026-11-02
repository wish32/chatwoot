# frozen_string_literal: true

# TakeHK Desk AI answers through the account webhook. A managed agent bot is only
# the assignee shown in the conversation, so its own outgoing URL stays unset.
class Takehk::ManagedAgentBot
  MESSAGE = 'TakeHK 使用账户 Webhook'

  def self.managed?(bot)
    config = bot.bot_config
    return false unless config.is_a?(Hash)

    config['takehk_managed'] == true || config[:takehk_managed] == true
  end

  def self.outgoing_url_write?(bot, outgoing_url)
    managed?(bot) && outgoing_url.present?
  end
end
