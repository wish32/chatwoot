# frozen_string_literal: true

module Takehk
  # Chatwoot stock greeting runs on the first *incoming* message. TakeHK sends
  # inbox greeting when the visitor opens the chat (direct conversation UX).
  class WebWidgetGreetingOnOpenService
    pattr_initialize [:conversation!, :inbox!]

    def perform
      return unless inbox.web_widget?
      return unless inbox.greeting_enabled?
      return if inbox.greeting_message.blank?
      return if conversation.messages.exists?

      ::MessageTemplates::Template::Greeting.new(conversation: conversation).perform
    end
  end
end
