class AddDirectConversationToChannelWebWidgets < ActiveRecord::Migration[7.1]
  def change
    add_column :channel_web_widgets, :direct_conversation, :boolean, default: true, null: false
  end
end
