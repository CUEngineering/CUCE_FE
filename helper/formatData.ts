import { format } from "date-fns";
import type { Registrar, FormattedRegistrar } from "~/types/format";
import type { Invitee, FormattedInvitee } from "~/types/format";

export function getRegistrarStatus(
  isSuspended: boolean,
  isDeactivated: boolean
): string {
  if (isDeactivated) return "Deactivated";
  if (isSuspended) return "Suspended";
  return "Active";
}

export function formatRegistrars(
  rawRegistrars: Registrar[]
): FormattedRegistrar[] {
  return rawRegistrars.map((r) => ({
    name: `${r.first_name} ${r.last_name}`,
    email: r.email,
    avatar:
      r.profile_picture || "https://randomuser.me/api/portraits/men/44.jpg",
    status: getRegistrarStatus(r.is_suspended, r.is_deactivated),
    enrollRequests: r.stats?.totalEnrollments || 0,
    approvals: r.stats?.approvedEnrollments || 0,
    denials: r.stats?.rejectedEnrollments || 0,
  }));
}

export function formatInvitees(rawInvites: Invitee[]): FormattedInvitee[] {
  return rawInvites
    .filter((invite) => invite.user_type === "REGISTRAR")
    .map((invite) => ({
      email: invite.email,
      date: format(new Date(invite.created_at), "do MMM, yyyy"),
    }));
}
