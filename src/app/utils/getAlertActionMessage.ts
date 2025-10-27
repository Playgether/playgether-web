import React from "react";
import { alertActionMessageConfig } from "../feed/config/alertActionMessage";

export const getAlertActionMessage = (action: string) => {
  return alertActionMessageConfig[action];
};
