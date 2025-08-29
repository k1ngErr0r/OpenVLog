import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, Step } from 'react-joyride';

const steps: Step[] = [
  { target: 'body', placement: 'center', content: 'Welcome to OpenVLog! Let\'s take a quick tour.' },
  { target: '[data-tour="dashboard-table"]', content: 'This table lists recent vulnerabilities.' },
  { target: '[data-tour="add-vuln-btn"]', content: 'Create a new vulnerability here.' },
  { target: '[data-tour="users-nav"]', content: 'Admins can manage users here.' },
  { target: 'body', placement: 'center', content: 'All done! You can restart this tour from the command palette.' },
];

export function OnboardingTour() {
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('onboardingCompleted')) setRun(true);
  }, []);

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === 'finished' || status === 'skipped') {
      localStorage.setItem('onboardingCompleted', 'true');
      setRun(false);
    }
  };

  if (!run) return null;
  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      styles={{ options: { zIndex: 10000 } }}
      callback={handleCallback}
    />
  );
}