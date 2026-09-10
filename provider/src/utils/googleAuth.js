export const googleReturnUrl = (path = '/login') => `${window.location.origin}${path}`;

export const readGoogleTicketId = (search) => {
  const params = new URLSearchParams(search);
  return String(params.get('google_ticket') || '').trim();
};

export const waitForGoogleTicket = async (
  fetchTicket,
  ticketId,
  { attempts = 20, delayMs = 400 } = {}
) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const ticket = await fetchTicket(ticketId);
    if (ticket.status !== 'pending') {
      return ticket;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, delayMs);
    });
  }
  return { status: 'expired', message: 'Google sign-in expired. Try again.' };
};
