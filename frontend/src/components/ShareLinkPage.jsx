import React from "react";
import { useParams } from "react-router-dom";
import LinkPage from "./LinkPage";

export default function ShareLinkPage() {
  const { linkId } = useParams();
  return <LinkPage linkId={linkId} />;
}
