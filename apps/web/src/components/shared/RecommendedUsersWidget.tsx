import { useState } from "react";
import { readSession } from "../../types/user";
import RecommendedUsers from "../profile/RecommendedUsers";

export default function RecommendedUsersWidget() {
  const [userId] = useState(() => readSession()?.id ?? null);

  if (!userId) return null;

  return <RecommendedUsers userId={userId} />;
}
