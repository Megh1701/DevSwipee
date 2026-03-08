import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function startPlatformTour() {
  const driverObj = driver({
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    steps: [
      {
        element: 'body',
        popover: {
          title: 'Welcome to DevSwipee! 🚀',
          description: 'A Tinder-like platform where developers showcase projects, swipe on others\' work, match, and collaborate. Let\'s take a quick tour!',
          side: "center",
          align: 'center'
        }
      },
      {
        element: '#home-nav-link',
        popover: {
          title: '🏠 Home Feed',
          description: 'Browse other developers\' projects. Swipe right if you\'re interested, left to skip. It\'s that simple!',
          side: "right",
        }
      },
      {
        element: '#swipes-nav-link',
        popover: {
          title: '❤️ Your Swipes',
          description: 'See all the projects you\'ve liked. Track their status: interested, accepted, or rejected.',
          side: "right",
        }
      },
      {
        element: '#requests-nav-link',
        popover: {
          title: '⏰ Requests',
          description: 'Other developers who liked YOUR project! Accept to create a match and start chatting.',
          side: "right",
        }
      },
      {
        element: '#messages-nav-link',
        popover: {
          title: '💬 Messages',
          description: 'Chat with developers you\'ve matched with. Discuss projects, collaborate, or just network!',
          side: "right",
        }
      },
      {
        element: '#ats-nav-link',
        popover: {
          title: '📊 ATS Score Dashboard (NEW!)',
          description: 'Your project performance analytics! See how well your projects are performing and get AI-powered improvement suggestions.',
          side: "right",
        }
      },
      {
        element: 'body',
        popover: {
          title: 'Ready to Explore! 🎉',
          description: 'You\'re all set! Start swiping, matching, and building connections. Click "ATS Score" to see your project analytics!',
          side: "center",
          align: 'center'
        }
      }
    ],
    onDestroyStarted: () => {
      driverObj.destroy();
    },
  });

  driverObj.drive();
}

export function startATSTour() {
  const driverObj = driver({
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    steps: [
      {
        element: '#ats-header',
        popover: {
          title: '📊 ATS Score Dashboard',
          description: 'Welcome to your project analytics hub! Here you can see how well your projects are performing.',
          side: "bottom",
        }
      },
      {
        element: '#ats-projects',
        popover: {
          title: '📁 Your Projects',
          description: 'Each card shows a project with its overall ATS score (0-100). Higher scores mean better performance and quality!',
          side: "top",
        }
      },
      {
        element: '#ats-projects',
        popover: {
          title: '🎯 Score Breakdown',
          description: 'Scores combine two factors:\n• Swipe Performance (60%): How users engage with your project\n• Project Quality (40%): AI analysis of description, tech depth, and completeness',
          side: "top",
        }
      },
      {
        element: '#ats-projects',
        popover: {
          title: '📈 Click for Details',
          description: 'Click any project card to see detailed breakdowns, stats, and AI-powered suggestions to improve your score!',
          side: "top",
        }
      },
      {
        element: 'body',
        popover: {
          title: '💡 Pro Tips',
          description: 'To boost your score:\n• Write detailed, clear descriptions (150+ words)\n• Add GitHub and live demo URLs\n• Specify your complete tech stack\n• Keep your project status updated',
          side: "center",
          align: 'center'
        }
      }
    ],
    onDestroyStarted: () => {
      driverObj.destroy();
    },
  });

  driverObj.drive();
}

