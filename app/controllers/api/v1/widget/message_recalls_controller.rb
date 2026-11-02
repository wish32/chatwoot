class Api::V1::Widget::MessageRecallsController < Api::V1::Widget::BaseController
  def create
    return head :not_found if conversation.nil?

    message = conversation.messages.find(params[:id])
    return head :forbidden unless own_incoming_message?(message)
    return head :ok if message.content_attributes['recalled']
    return head :unprocessable_entity unless message.created_at >= 10.minutes.ago

    recall(message)
    head :ok
  end

  private

  def own_incoming_message?(message)
    message.incoming? && message.sender_type == 'Contact' && message.sender_id == @contact.id
  end

  def recall(message)
    message.update!(
      content: I18n.t('conversations.messages.recalled'),
      content_type: :text,
      content_attributes: message.content_attributes.merge('recalled' => true)
    )
    message.attachments.destroy_all
  end
end
