# TakeHK: new Website channels default to inbox name/avatar for template (greeting) messages.
# feature_flags 7 = attachments + emoji_picker + end_conversation
# + 8 (bit 4) = use_inbox_avatar_for_bot → 15
class DefaultUseInboxAvatarForBot < ActiveRecord::Migration[7.1]
  def up
    change_column_default :channel_web_widgets, :feature_flags, from: 7, to: 15
  end

  def down
    change_column_default :channel_web_widgets, :feature_flags, from: 15, to: 7
  end
end
