import {
  PriorityLevel,
  quickMessagesHistoryModalPriorityConfig,
  quickMessagesHistoryModalStatusConfig,
  StatusLevel,
} from "../config/quickMessages/quickMessagesHistoryModalConfig";

export const getStatusBadge = (status: StatusLevel) => {
  return quickMessagesHistoryModalStatusConfig[status];
};

export const getPriorityConfig = (priority: PriorityLevel) => {
  return quickMessagesHistoryModalPriorityConfig[priority];
};
