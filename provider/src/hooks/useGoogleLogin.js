import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getGoogleTicket, startGoogleLogin } from '../api/auth';
import { googleReturnUrl, readGoogleTicketId, waitForGoogleTicket } from '../utils/googleAuth';

export const useGoogleLogin = ({
  role,
  allowCreate = false,
  returnPath,
  persistSession,
  onError,
  wrongRoleMessage,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    const ticketId = readGoogleTicketId(location.search);
    if (!ticketId) {
      return undefined;
    }

    let cancelled = false;
    const finishGoogle = async () => {
      setGoogleBusy(true);
      try {
        const ticket = await waitForGoogleTicket(getGoogleTicket, ticketId);
        if (cancelled) {
          return;
        }
        if (ticket.status === 'ready' && ticket.token && ticket.user) {
          if (ticket.user.role !== role) {
            onError(wrongRoleMessage);
            navigate(location.pathname, { replace: true });
            return;
          }
          persistSession(ticket.token, ticket.user);
          navigate('/', { replace: true });
          return;
        }
        onError(ticket.message || 'Google sign-in failed. Try again.');
        navigate(location.pathname, { replace: true });
      } catch (error) {
        if (!cancelled) {
          onError(error.message || 'Google sign-in failed. Try again.');
          navigate(location.pathname, { replace: true });
        }
      } finally {
        setGoogleBusy(false);
      }
    };

    void finishGoogle();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.search, navigate, onError, persistSession, role, wrongRoleMessage]);

  const start = async () => {
    setGoogleBusy(true);
    try {
      const startResult = await startGoogleLogin({
        role,
        allowCreate,
        returnTo: googleReturnUrl(returnPath),
      });
      window.location.assign(startResult.authUrl);
    } catch (error) {
      onError(error.message || 'Google sign-in failed. Try again.');
      setGoogleBusy(false);
    }
  };

  return { googleBusy, startGoogle: start };
};
