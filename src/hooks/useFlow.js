import { useContext } from "react";
import { FlowContext } from "../context/flowStore";

export function useFlow() {
  const context = useContext(FlowContext);
  if (!context) throw new Error("useFlow must be used within a FlowProvider");
  return context;
}
