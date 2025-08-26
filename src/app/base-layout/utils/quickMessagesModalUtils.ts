import {
  PriorityLevel,
  quickMessagesHistoryModalPriorityConfig,
} from "../config/quickMessages/quickMessagesHistoryModalConfig";

export const getPriorityColorQuickMessagesConfig = (
  priority: PriorityLevel
) => {
  return quickMessagesHistoryModalPriorityConfig[priority];
};
