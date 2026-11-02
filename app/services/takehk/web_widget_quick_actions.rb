# frozen_string_literal: true

# Normalizes and checks Website inbox quick-action chips before they are stored.
class Takehk::WebWidgetQuickActions
  MAX_ITEMS = 8
  MAX_ID_LENGTH = 64
  MAX_LABEL_LENGTH = 120
  MAX_MESSAGE_LENGTH = 1000
  SLUG = /\A[a-z0-9]+(?:[_-][a-z0-9]+)*\z/i
  FIELDS = %w[id label_zh label_en message_zh message_en].freeze
  DEFAULTS = [
    {
      'id' => 'incorporate',
      'label_zh' => '註冊公司',
      'label_en' => 'Incorporate',
      'message_zh' => '我想註冊香港公司',
      'message_en' => 'I want to incorporate a Hong Kong company'
    },
    {
      'id' => 'accounting-audit',
      'label_zh' => '會計審計',
      'label_en' => 'Accounting & Audit',
      'message_zh' => '我想了解會計審計',
      'message_en' => 'I want to know about accounting and audit'
    },
    {
      'id' => 'account-opening',
      'label_zh' => '開戶',
      'label_en' => 'Open an account',
      'message_zh' => '我想開立銀行戶口',
      'message_en' => 'I want to open a bank account'
    }
  ].freeze

  def self.default_actions
    DEFAULTS.map(&:dup)
  end

  def self.normalize(value)
    return value unless value.is_a?(Array)

    value.map { |item| normalize_item(item) }
  end

  def self.validate!(record)
    actions = record.takehk_quick_actions
    unless actions.is_a?(Array)
      record.errors.add(:takehk_quick_actions, 'must be an array')
      return
    end

    record.errors.add(:takehk_quick_actions, "cannot include more than #{MAX_ITEMS} items") if actions.length > MAX_ITEMS

    seen = {}
    actions.each_with_index do |item, index|
      validate_item(record, item, index, seen)
    end
  end

  def self.normalize_item(item)
    data = coerce_hash(item)
    return item if data.nil?

    data = data.with_indifferent_access
    FIELDS.index_with { |key| data[key].to_s.strip }
  end
  private_class_method :normalize_item

  def self.coerce_hash(item)
    case item
    when ActionController::Parameters
      item.to_unsafe_h
    when Hash
      item
    end
  end
  private_class_method :coerce_hash

  def self.validate_item(record, item, index, seen)
    position = index + 1
    unless item.is_a?(Hash)
      record.errors.add(:takehk_quick_actions, "item #{position} is invalid")
      return
    end

    validate_id(record, item, position, seen)
    validate_labels(record, item, position)
    validate_messages(record, item, position)
  end
  private_class_method :validate_item

  def self.validate_id(record, item, position, seen)
    id = item['id'].to_s
    if id.blank?
      record.errors.add(:takehk_quick_actions, "item #{position} needs an id")
    elsif id.length > MAX_ID_LENGTH || !SLUG.match?(id)
      record.errors.add(:takehk_quick_actions, "item #{position} id must be a slug")
    elsif seen[id.downcase]
      record.errors.add(:takehk_quick_actions, "item #{position} id is duplicated")
    else
      seen[id.downcase] = true
    end
  end
  private_class_method :validate_id

  def self.validate_labels(record, item, position)
    if item['label_zh'].to_s.blank? && item['label_en'].to_s.blank?
      record.errors.add(:takehk_quick_actions, "item #{position} needs a Chinese or English label")
    end

    %w[label_zh label_en].each do |key|
      next if item[key].to_s.length <= MAX_LABEL_LENGTH

      record.errors.add(:takehk_quick_actions, "item #{position} #{key} is too long")
    end
  end
  private_class_method :validate_labels

  def self.validate_messages(record, item, position)
    %w[message_zh message_en].each do |key|
      next if item[key].to_s.length <= MAX_MESSAGE_LENGTH

      record.errors.add(:takehk_quick_actions, "item #{position} #{key} is too long")
    end
  end
  private_class_method :validate_messages
end
