# Move Block Types

Status: draft.

This document is the source of truth for Move block types in the public Move Protocol draft.

## Block Shape

Every block must be a JSON object with a `type` string.

Every interactive block should include an `id` string so response data can be keyed back to the block.

Any block may include:

| Field | Meaning |
| --- | --- |
| `id` | Stable block id. Required when response data needs to refer to this block. |
| `type` | Block type. Required. |
| `required` | Boolean marker for human input requirements. |

Receivers must ignore unknown fields.

Renderers should tolerate unknown block types.

## Content Blocks

| Type | Required fields | Optional fields |
| --- | --- | --- |
| `text` | `content` |  |
| `image` | `ref` | `caption`, `alt` |
| `video` | `ref` | `caption` |
| `audio` | `ref` | `caption` |
| `code` | `content` | `language` |
| `file` | `ref`, `filename` |  |
| `data` | `rows` | `headers` |
| `terminal` | `content` |  |
| `copyable` | `content` | `label` |

Validation rules:

- `data.rows` must be an array of arrays of strings.
- `data.headers`, when present, must be an array of strings.

## Input Blocks

| Type | Required fields | Optional fields |
| --- | --- | --- |
| `choice` | `question`, `options` | `default_option` |
| `multi_choice` | `question`, `options` | `default_options` |
| `freeform` | `question` | `placeholder` |
| `numeric` | `question` | `min`, `max`, `step` |
| `toggle` | `question` | `default_value` |
| `ranking` | `question`, `items` |  |
| `confirmation` | `message` | `confirm_label`, `cancel_label` |
| `date` | `question` | `default_value`, `min_date`, `max_date` |
| `file_upload` | `question` | `accept` |
| `color` | `question` | `default_value` |
| `secret` | `question` | `placeholder` |
| `rating` | `question` | `max`, `default_option` |
| `native_view` | `id` |  |

Validation rules:

- `choice.options` and `multi_choice.options` must be arrays of strings.
- `choice.default_option` must be an integer when present.
- `multi_choice.default_options` must be an array of integers when present.
- `numeric.min`, `numeric.max`, and `numeric.step` must be numbers when present.
- `toggle.default_value` must be a boolean when present.
- `ranking.items` must be an array of strings.
- `file_upload.accept`, when present, must be an array of strings.
- `rating.max` and `rating.default_option`, when present, must be integers.

## Reference Blocks

| Type | Required fields | Optional fields |
| --- | --- | --- |
| `url` | `href` | `label`, `description` |
| `file_path` | `path` | `exists` |
| `graph_node` | `node_type`, `node_id` |  |
| `location` | `lat`, `lng` | `label` |
| `datetime` | `iso` | `label` |
| `person` | `name` | `role`, `avatar` |
| `snippet` | `path`, `content` | `start_line`, `end_line`, `language`, `highlights` |
| `excerpt` | `content`, `source` | `source_url`, `highlights` |

Validation rules:

- `location.lat` and `location.lng` must be numbers.
- `snippet.start_line` and `snippet.end_line` must be integers when present.

## Delta Blocks

| Type | Required fields | Optional fields |
| --- | --- | --- |
| `diff` | `before`, `after` | `filename`, `language` |
| `before_after` | `before`, `after` | `label` |
| `side_by_side` | `left`, `right` | `left_label`, `right_label` |
| `timeline` | `events` |  |

Validation rules:

- `timeline.events` must be an array.

## Signal Blocks

| Type | Required fields | Optional fields |
| --- | --- | --- |
| `warning` | `message` |  |
| `alert` | `message` | `severity` |
| `progress` | `value` | `max`, `label` |
| `urgency` | `level` | `message` |
| `expiration` | `expires_at` | `message` |
| `section` | `children`, `label` | `collapsible`, `collapsed`, `condition` |
| `executable` | `label` | `description`, `command`, `condition`, `shell`, `working_directory`, `timeout_seconds`, `strategy`, `approve_children`, `children` |

Validation rules:

- `progress.value` is required and must be a number.
- `progress.max` must be a number when present.
- `section.children` must be an array of blocks.
- `section.collapsible` and `section.collapsed` must be booleans when present.
- `section.condition.block_id` is required when `condition` is present.
- `section.condition.operator` must be one of `eq`, `neq`, `contains`, `not_contains`.
- `section.condition.value` is required when `condition` is present.
- `executable.timeout_seconds` must be a positive integer no greater than `600` when present.
- `executable` may have `command` or `children`, but not both.
- `executable.strategy` is allowed only when `children` is present and must be `sequence` or `parallel`.
- `executable.approve_children` is allowed only when `children` is present and must be `auto`, `yes`, or `no`.
- `executable.children` must be an array of blocks when present.

## Unknown Blocks

Unknown block types are allowed for forward compatibility.

A validator may warn on unknown block types. A renderer should show an unsupported-block fallback or ignore the block if it cannot render it safely.
