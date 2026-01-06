import React from "react";
import LayoutTypeHandler from "./LayoutTypeHandler";
import LayoutTypeHandlerContainer from "./LayoutTypeHandlerContainer";
import CenterColumn from "./CenterColumn";

export default function LayoutTypeHandlerWrapper() {
  return (
    <LayoutTypeHandlerContainer>
      <LayoutTypeHandler CenterColumn={<CenterColumn />} />
    </LayoutTypeHandlerContainer>
  );
}
