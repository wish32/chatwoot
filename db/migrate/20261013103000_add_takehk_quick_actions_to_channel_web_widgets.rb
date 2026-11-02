class AddTakehkQuickActionsToChannelWebWidgets < ActiveRecord::Migration[7.1]
  def change
    add_column :channel_web_widgets, :takehk_quick_actions, :jsonb, default: [], null: false
  end
end
