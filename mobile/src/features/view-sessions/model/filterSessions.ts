import type { SessionFilterValue, SessionListItem } from "./types"

export function filterSessions(
  sessions: SessionListItem[],
  activeFilter: SessionFilterValue,
) {
  if (activeFilter === "all") {
    return sessions
  }

  return sessions.filter((session) => session.bodyParts.includes(activeFilter))
}
