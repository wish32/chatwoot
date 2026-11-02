# frozen_string_literal: true

# One Chatwoot message can carry several attachments. TakeHK keeps that shape
# and only caps how many files arrive in a single send.
class Takehk::AttachmentBatch
  MAX_ITEMS = 9

  def self.limit(attachments)
    Array(attachments).first(MAX_ITEMS)
  end
end
