import { supabase } from '@/integrations/supabase/client';

export interface StarterTaskTemplate {
  type: string;
  title: string;
  description: string;
  priority: number;
  steps_json: Array<{
    id: string;
    title: string;
    description?: string;
    link?: string;
    completed: boolean;
  }>;
}

export const STARTER_TASKS: StarterTaskTemplate[] = [
  {
    type: 'inventory',
    title: 'Complete your identity inventory',
    description: 'Add your emails, usernames, and accounts so we can monitor for exposures.',
    priority: 1,
    steps_json: [
      {
        id: 'add-primary-email',
        title: 'Add your primary email address',
        description: 'This is the email you use most often for accounts.',
        completed: false
      },
      {
        id: 'add-secondary-emails',
        title: 'Add any secondary email addresses',
        description: 'Include work emails, old emails, or aliases.',
        completed: false
      },
      {
        id: 'add-usernames',
        title: 'Add your common usernames',
        description: 'Social media handles, gaming tags, forum names.',
        completed: false
      },
      {
        id: 'add-accounts',
        title: 'Add your important accounts',
        description: 'Banking, social media, shopping sites you use.',
        completed: false
      }
    ]
  },
  {
    type: 'security',
    title: 'Enable a password manager',
    description: 'A password manager is the foundation of good digital hygiene.',
    priority: 2,
    steps_json: [
      {
        id: 'choose-manager',
        title: 'Choose a password manager',
        description: 'Popular options: 1Password, Bitwarden, or Apple/Google built-in.',
        link: 'https://www.nytimes.com/wirecutter/reviews/best-password-managers/',
        completed: false
      },
      {
        id: 'install-manager',
        title: 'Install on all your devices',
        description: 'Browser extension + mobile app for seamless access.',
        completed: false
      },
      {
        id: 'migrate-passwords',
        title: 'Start migrating saved passwords',
        description: 'Import from browser or manually add as you log in.',
        completed: false
      }
    ]
  },
  {
    type: 'security',
    title: 'Enable 2FA on critical accounts',
    description: 'Two-factor authentication prevents unauthorized access even if passwords leak.',
    priority: 3,
    steps_json: [
      {
        id: '2fa-email',
        title: 'Enable 2FA on your primary email',
        description: 'Your email is the gateway to all password resets.',
        completed: false
      },
      {
        id: '2fa-banking',
        title: 'Enable 2FA on banking/financial accounts',
        description: 'Protect your money with an extra layer.',
        completed: false
      },
      {
        id: '2fa-social',
        title: 'Enable 2FA on social media',
        description: 'Prevent account takeovers on Facebook, Twitter, etc.',
        completed: false
      }
    ]
  },
  {
    type: 'privacy',
    title: 'Review social media privacy settings',
    description: 'Limit what strangers can see about you online.',
    priority: 4,
    steps_json: [
      {
        id: 'facebook-privacy',
        title: 'Review Facebook privacy settings',
        link: 'https://www.facebook.com/settings?tab=privacy',
        completed: false
      },
      {
        id: 'instagram-privacy',
        title: 'Review Instagram privacy settings',
        description: 'Consider making your account private.',
        completed: false
      },
      {
        id: 'linkedin-privacy',
        title: 'Review LinkedIn visibility settings',
        link: 'https://www.linkedin.com/psettings/visibility',
        completed: false
      },
      {
        id: 'google-privacy',
        title: 'Review Google privacy dashboard',
        link: 'https://myaccount.google.com/privacycheckup',
        completed: false
      }
    ]
  },
  {
    type: 'broker',
    title: 'Start data broker opt-outs',
    description: 'Remove your personal info from people-search sites.',
    priority: 5,
    steps_json: [
      {
        id: 'learn-brokers',
        title: 'Learn about data brokers',
        description: 'Understand how your data ends up on these sites.',
        completed: false
      },
      {
        id: 'visit-brokers-page',
        title: 'Visit the Brokers page to start opt-outs',
        description: 'We provide templates and tracking for each site.',
        completed: false
      }
    ]
  }
];

export async function createStarterTasks(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const tasksToInsert = STARTER_TASKS.map(task => ({
      user_id: userId,
      type: task.type,
      title: task.title,
      description: task.description,
      priority: task.priority,
      steps_json: task.steps_json,
      status: 'pending'
    }));

    const { error } = await supabase
      .from('tasks')
      .insert(tasksToInsert);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Failed to create starter tasks:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
