class SetDefaultTakehkQuickActions < ActiveRecord::Migration[7.1]
  def up
    change_column_default :channel_web_widgets, :takehk_quick_actions, Takehk::WebWidgetQuickActions::DEFAULTS
  end

  def down
    change_column_default :channel_web_widgets, :takehk_quick_actions, []
  end
end
