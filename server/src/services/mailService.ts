import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendInvitationAcceptedEmail({
  organizerEmail,
  organizerUsername,
  activityName,
  participantUsername,
}: InvitationAcceptedEmail) {
  const response = await resend.emails.send({
    from: "TeamUp <noreply@linkrefine.com>",
    to: organizerEmail,
    subject: `${participantUsername} a accepté votre invitation`,
    html: `
      <h2>Bonne nouvelle, ${organizerUsername} !</h2>
      <p><strong>${participantUsername}</strong> a accepté votre invitation pour l'activité <strong>${activityName}</strong>.</p>
      <p>Rendez-vous sur TeamUp pour voir les détails.</p>
    `,
  });

  return response;
}

export default { sendInvitationAcceptedEmail };
