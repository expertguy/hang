// utils/linkedinAuth.js
export const getLinkedInAuthURL = () => {
  const rootUrl = 'https://www.linkedin.com/oauth/v2/authorization';
  const options = {
    response_type: 'code',
    client_id: '78sesyxj1s0vyl',
    // redirect_uri: 'https://hang-steel.vercel.app/',
    // redirect_uri: 'http://localhost:3000/',
    redirect_uri: 'https://app.hangnetwork.com/',
    scope: 'openid profile email', // Adjust scopes as needed
    state: Math.random().toString(36).substring(7), // CSRF protection
  };
  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
};