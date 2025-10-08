import React from "react";

export default async function page({ params }) {
  const { id } = await params;
  return <div>page not intercepted, id of post: {id}</div>;
}
