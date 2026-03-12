export interface PlaybookStep {
  id: string;
  title: string;
  description: string;
  link?: string;
  linkLabel?: string;
}

export interface Playbook {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  steps: PlaybookStep[];
}

export const CONTAINMENT_PLAYBOOKS: Playbook[] = [
  {
    id: 'email-compromise',
    title: 'Email Account Compromise',
    description: 'Step-by-step guidance when your email account may have been accessed without authorization.',
    icon: 'Mail',
    steps: [
      {
        id: 'ec-1',
        title: 'Change your email password immediately',
        description: 'Use a strong, unique password that you haven\'t used elsewhere. If you can\'t log in, use the provider\'s account recovery process.',
      },
      {
        id: 'ec-2',
        title: 'Review and revoke active sessions',
        description: 'Most email providers show active sessions or recent sign-ins. End any sessions you don\'t recognize.',
      },
      {
        id: 'ec-3',
        title: 'Enable or update multi-factor authentication',
        description: 'Add an authenticator app or security key if not already enabled. Avoid SMS-only if possible.',
        link: '/inventory',
        linkLabel: 'Review recovery method',
      },
      {
        id: 'ec-4',
        title: 'Check forwarding rules and filters',
        description: 'Unauthorized forwarding rules can silently redirect your email. Remove any you didn\'t create.',
      },
      {
        id: 'ec-5',
        title: 'Review connected apps and permissions',
        description: 'Revoke access for any third-party apps you don\'t recognize or no longer use.',
      },
      {
        id: 'ec-6',
        title: 'Update recovery email and phone',
        description: 'Ensure your recovery options point to accounts and numbers you still control.',
        link: '/inventory',
        linkLabel: 'Update recovery info',
      },
      {
        id: 'ec-7',
        title: 'Notify contacts if needed',
        description: 'If the compromise may have been used to send messages on your behalf, inform relevant contacts.',
      },
    ],
  },
  {
    id: 'sim-swap',
    title: 'SIM Swap / Phone Takeover',
    description: 'Guidance for responding when your phone number may have been transferred without your consent.',
    icon: 'Smartphone',
    steps: [
      {
        id: 'ss-1',
        title: 'Contact your carrier immediately',
        description: 'Report the unauthorized transfer and request the number be returned to your account. Ask about adding a port-out PIN.',
      },
      {
        id: 'ss-2',
        title: 'Change passwords on SMS-linked accounts',
        description: 'Prioritize email, banking, and any accounts that use SMS for login or recovery.',
      },
      {
        id: 'ss-3',
        title: 'Switch recovery methods away from SMS',
        description: 'Move critical accounts to authenticator apps or security keys where possible.',
        link: '/inventory',
        linkLabel: 'Update recovery method',
      },
      {
        id: 'ss-4',
        title: 'Review recent account activity',
        description: 'Check email, financial accounts, and social media for unauthorized access during the window of exposure.',
      },
      {
        id: 'ss-5',
        title: 'Add carrier security measures',
        description: 'Request a port-out PIN, account freeze, or additional verification requirement from your carrier.',
      },
      {
        id: 'ss-6',
        title: 'Document the incident',
        description: 'Record the timeline, carrier interactions, and any unauthorized activity observed. This may be needed for dispute resolution.',
      },
    ],
  },
  {
    id: 'social-hijack',
    title: 'Social Account Hijack',
    description: 'Structured response when a social media or public-facing account may be under someone else\'s control.',
    icon: 'Users',
    steps: [
      {
        id: 'sh-1',
        title: 'Attempt account recovery',
        description: 'Use the platform\'s official recovery process. Most platforms offer identity verification for locked-out accounts.',
      },
      {
        id: 'sh-2',
        title: 'Change the password if you still have access',
        description: 'Use a strong, unique password. Enable multi-factor authentication immediately.',
      },
      {
        id: 'sh-3',
        title: 'Revoke third-party app connections',
        description: 'Remove any connected apps or services you don\'t recognize.',
      },
      {
        id: 'sh-4',
        title: 'Review and revert unauthorized changes',
        description: 'Check profile information, email address, phone number, and privacy settings for unauthorized modifications.',
      },
      {
        id: 'sh-5',
        title: 'Report the compromise to the platform',
        description: 'Use the platform\'s dedicated compromised account reporting channel.',
      },
      {
        id: 'sh-6',
        title: 'Notify your network',
        description: 'If the account was used to post or message others, let your contacts know through another channel.',
      },
    ],
  },
  {
    id: 'identity-theft',
    title: 'Identity Theft Response',
    description: 'Guidance for responding when personal identity information may be used fraudulently.',
    icon: 'ShieldAlert',
    steps: [
      {
        id: 'it-1',
        title: 'Place a fraud alert or credit freeze',
        description: 'Contact one of the three credit bureaus (Equifax, Experian, TransUnion) to place a fraud alert. Consider a credit freeze for stronger control.',
      },
      {
        id: 'it-2',
        title: 'Review credit reports',
        description: 'Request free credit reports and review for accounts or inquiries you don\'t recognize.',
      },
      {
        id: 'it-3',
        title: 'File a report with the FTC',
        description: 'Visit IdentityTheft.gov to create an official recovery plan and get pre-filled letters for creditors.',
      },
      {
        id: 'it-4',
        title: 'File a police report if applicable',
        description: 'A police report may be required by creditors to resolve fraudulent accounts.',
      },
      {
        id: 'it-5',
        title: 'Notify affected financial institutions',
        description: 'Contact banks, credit card companies, and other financial institutions where fraud occurred.',
      },
      {
        id: 'it-6',
        title: 'Change passwords and secure accounts',
        description: 'Update passwords on email, financial, and government service accounts. Enable multi-factor authentication.',
        link: '/tasks',
        linkLabel: 'View related tasks',
      },
      {
        id: 'it-7',
        title: 'Set up ongoing review cadence',
        description: 'Plan regular credit report checks and account reviews until the situation is fully resolved.',
      },
    ],
  },
  {
    id: 'domain-compromise',
    title: 'Domain Compromise',
    description: 'Containment steps when a domain you own may have been accessed or transferred without authorization.',
    icon: 'Globe',
    steps: [
      {
        id: 'dc-1',
        title: 'Log into your domain registrar',
        description: 'Verify you still have access. If not, initiate the registrar\'s account recovery process immediately.',
      },
      {
        id: 'dc-2',
        title: 'Enable registrar lock (transfer lock)',
        description: 'Prevent unauthorized domain transfers by enabling the registrar\'s domain lock feature.',
      },
      {
        id: 'dc-3',
        title: 'Change registrar account password and enable MFA',
        description: 'Secure the registrar account with a strong password and multi-factor authentication.',
      },
      {
        id: 'dc-4',
        title: 'Review DNS records',
        description: 'Check for unauthorized changes to A records, MX records, CNAME records, and nameservers.',
      },
      {
        id: 'dc-5',
        title: 'Check WHOIS privacy settings',
        description: 'Ensure WHOIS privacy is enabled and contact information hasn\'t been changed.',
        link: '/inventory',
        linkLabel: 'Review domain inventory',
      },
      {
        id: 'dc-6',
        title: 'Contact the registrar for assistance',
        description: 'If unauthorized transfers occurred, contact the registrar\'s abuse team and begin the dispute process.',
      },
    ],
  },
];
