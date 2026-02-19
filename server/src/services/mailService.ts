import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendInvitationEmail(mailData: MailData) {
  const response = await resend.emails.send({
    from: "TeamUp <noreply@linkrefine.com>",
    to: mailData.participant_email,
    subject: `${mailData.organizer_username} vous a invité à son activité !`,
    html: `
        <h2>Bonne nouvelle, ${mailData.participant_username} !</h2>
        <p><strong>${mailData.organizer_username}</strong> vous a invité à son activité <strong>${mailData.name}</strong>, le ${mailData.playing_at} à ${mailData.playing_time} au ${mailData.address} ${mailData.zip_code} ${mailData.city}.</p>
        <p>Pour plus d'informations, rendez-vous sur TeamUp.</p>
        <p>Veuillez vous rendre sur l'application afin de confirmer ou non votre présence. </p>
        <p>À bientôt !</p>
        <p>L'équipe TeamUp</p>
      `,
  });
  return response;
}

async function sendRequestEmail(mailData: MailData) {
  if (mailData.auto_validation) {
    const response = await resend.emails.send({
      from: "TeamUp <noreply@linkrefine.com>",
      to: mailData.organizer_email,
      subject: `${mailData.participant_username} a réservé une place à votre activité`,
      html: `
        <h2>Bonne nouvelle, ${mailData.organizer_username} !</h2>
        <p><strong>${mailData.participant_username}</strong> participera à votre activité <strong>${mailData.name}</strong>, le ${mailData.playing_at} à ${mailData.playing_time}.</p>
        <p>À bientôt !</p>
        <p>L'équipe TeamUp</p>
      `,
    });
    return response;
  }

  if (!mailData.auto_validation) {
    const response = await resend.emails.send({
      from: "TeamUp <noreply@linkrefine.com>",
      to: mailData.organizer_email,
      subject: `${mailData.participant_username} a fait une demande de réservation pour votre activité`,
      html: `
        <h2>Bonne nouvelle, ${mailData.organizer_username} !</h2>
        <p><strong>${mailData.participant_username}</strong> souhaite participer à votre activité <strong>${mailData.name}</strong>, le ${mailData.playing_at} à ${mailData.playing_time}.</p>
        <p>Veuillez vous rendre sur l'application pour accepter ou non sa demande. </p>
        <p>À bientôt !</p>
        <p>L'équipe TeamUp</p>
      `,
    });
    return response;
  }
}

async function sendAnswerInvitationEmail(mailData: MailData, status: string) {
  if (status === "accepted") {
    const response = await resend.emails.send({
      from: "TeamUp <noreply@linkrefine.com>",
      to: mailData.organizer_email,
      subject: `${mailData.participant_username} a accepté votre invitation`,
      html: `
        <h2>Bonne nouvelle, ${mailData.organizer_username} !</h2>
        <p><strong>${mailData.participant_username}</strong> a accepté votre invitation pour l'activité <strong>${mailData.name}</strong>, le ${mailData.playing_at} à ${mailData.playing_time}.</p>
        <p>À bientôt !</p>
        <p>L'équipe TeamUp</p>
      `,
    });

    return response;
  }

  if (status === "refused") {
    const response = await resend.emails.send({
      from: "TeamUp <noreply@linkrefine.com>",
      to: mailData.organizer_email,
      subject: `${mailData.participant_username} a réfusé votre invitation`,
      html: `
        <h2>Mauvaise nouvelle, ${mailData.organizer_username} !</h2>
        <p><strong>${mailData.participant_username}</strong> a refusé votre invitation pour l'activité <strong>${mailData.name}</strong>, le ${mailData.playing_at} à ${mailData.playing_time}.</p>
        <p>À bientôt !</p>
        <p>L'équipe TeamUp</p>
      `,
    });
    return response;
  }
}

async function sendAnswerRequestEmail(mailData: MailData, status: string) {
  if (status === "accepted") {
    const response = await resend.emails.send({
      from: "TeamUp <noreply@linkrefine.com>",
      to: mailData.participant_email,
      subject: `${mailData.organizer_username} a accepté votre demande`,
      html: `
        <h2>Bonne nouvelle, ${mailData.participant_username} !</h2>
        <p><strong>${mailData.organizer_username}</strong> a accepté votre demande pour l'activité <strong>${mailData.name}</strong>, le ${mailData.playing_at} à ${mailData.playing_time} au ${mailData.address} ${mailData.zip_code} ${mailData.city}.</p>
        <p>Pour plus d'informations, rendez-vous sur TeamUp.</p>
        <p>À bientôt !</p>
        <p>L'équipe TeamUp</p>
      `,
    });
    return response;
  }

  if (status === "refused") {
    const response = await resend.emails.send({
      from: "TeamUp <noreply@linkrefine.com>",
      to: mailData.participant_email,
      subject: `${mailData.organizer_username} a réfusé votre demande`,
      html: `
        <h2>Mauvaise nouvelle, ${mailData.participant_username} !</h2>
        <p><strong>${mailData.organizer_username}</strong> a refusé votre demande pour l'activité <strong>${mailData.name}</strong>, le ${mailData.playing_at} à ${mailData.playing_time}.</p>
        <p>Rendez-vous sur TeamUp, pour rechercher une nouvelle activité.</p>
        <p>À bientôt !</p>
        <p>L'équipe TeamUp</p>
      `,
    });
    return response;
  }
}

export default {
  sendInvitationEmail,
  sendRequestEmail,
  sendAnswerInvitationEmail,
  sendAnswerRequestEmail,
};
