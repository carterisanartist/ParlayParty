export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  action: string;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right';
  requiresAction?: boolean;
  nextTrigger?: 'click' | 'auto' | 'socket-event';
  socketEvent?: string;
}

export interface TutorialVideo {
  id: string;
  title: string;
  videoUrl: string;
  duration: number;
  parlays: TutorialParlay[];
}

export interface TutorialParlay {
  id: string;
  playerName: string;
  prediction: string;
  timestamp: number; // When this parlay should trigger
  isCorrect: boolean;
}

export const hostTutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Parlay Party! 🎉',
    description: 'Let\'s learn how to host an epic game night. This tutorial will walk you through all the features.',
    action: 'Click anywhere to continue',
    nextTrigger: 'click'
  },
  {
    id: 'lobby-overview',
    title: 'The Host Lobby',
    description: 'This is your command center. Players join by scanning the QR code or entering the room code.',
    action: 'Wait for players to join',
    target: '.qr-code-container',
    position: 'bottom',
    nextTrigger: 'socket-event',
    socketEvent: 'player:joined'
  },
  {
    id: 'add-videos',
    title: 'Add Videos to Queue',
    description: 'Add YouTube videos, upload your own, or stream from Twitch/Kick. The more variety, the more fun!',
    action: 'Click "Add Video" to add content',
    target: '.add-video-button',
    position: 'left',
    requiresAction: true,
    nextTrigger: 'socket-event',
    socketEvent: 'queue:updated'
  },
  {
    id: 'start-game',
    title: 'Start the Game',
    description: 'Once everyone has joined, start the game. Players will make predictions about what happens in the video.',
    action: 'Click "Start Game" when ready',
    target: '.start-game-button',
    position: 'top',
    requiresAction: true,
    nextTrigger: 'click'
  },
  {
    id: 'parlay-phase',
    title: 'Parlay Entry Phase',
    description: 'Players are now entering their predictions. You can see who\'s ready and who\'s still thinking.',
    action: 'Wait for players to submit parlays',
    nextTrigger: 'socket-event',
    socketEvent: 'parlay:all_locked'
  },
  {
    id: 'reveal-parlays',
    title: 'The Big Reveal',
    description: 'All parlays are revealed! This builds anticipation before the video plays.',
    action: 'Review the predictions',
    nextTrigger: 'auto'
  },
  {
    id: 'video-phase',
    title: 'Watch & Vote',
    description: 'Play the video! Players vote when they see parlays happen. You control playback and can verify events.',
    action: 'Click play to start the video',
    target: '.video-player',
    position: 'top',
    requiresAction: true,
    nextTrigger: 'socket-event',
    socketEvent: 'round:ended'
  },
  {
    id: 'results',
    title: 'Results & Scoring',
    description: 'See who predicted correctly! Points are awarded based on accuracy and timing.',
    action: 'Review the results',
    nextTrigger: 'auto'
  },
  {
    id: 'punishment-wheel',
    title: 'Punishment Wheel',
    description: 'The player with the lowest score faces the wheel of punishment! Other players submit punishment ideas.',
    action: 'Spin the wheel!',
    target: '.spin-button',
    position: 'top',
    requiresAction: true,
    nextTrigger: 'click'
  },
  {
    id: 'advanced-features',
    title: 'Advanced Features',
    description: 'Try Speed Mode for rapid rounds, Team Battles for group competition, or Power-Ups for strategic gameplay!',
    action: 'Explore game modes in the lobby',
    nextTrigger: 'click'
  },
  {
    id: 'tutorial-complete',
    title: 'You\'re Ready to Party! 🎊',
    description: 'You\'ve mastered the basics. Host your first real game and create unforgettable moments!',
    action: 'Exit tutorial',
    nextTrigger: 'click'
  }
];

export const playerTutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Parlay Party! 📱',
    description: 'Get ready to make predictions and compete with friends. Let\'s learn how to play!',
    action: 'Tap to continue',
    nextTrigger: 'click'
  },
  {
    id: 'lobby-wait',
    title: 'Waiting in the Lobby',
    description: 'You\'re in! Wait for the host to start the game. Chat with other players while you wait.',
    action: 'Wait for game to start',
    nextTrigger: 'socket-event',
    socketEvent: 'round:started'
  },
  {
    id: 'make-prediction',
    title: 'Make Your Prediction',
    description: 'Predict something specific that will happen in the video. Be creative but realistic!',
    action: 'Enter your parlay',
    target: '.parlay-input',
    position: 'top',
    requiresAction: true,
    nextTrigger: 'socket-event',
    socketEvent: 'parlay:locked'
  },
  {
    id: 'parlay-locked',
    title: 'Prediction Locked In',
    description: 'Your prediction is set! Wait for others to finish.',
    action: 'Wait for reveal',
    nextTrigger: 'socket-event',
    socketEvent: 'parlay:revealed'
  },
  {
    id: 'watch-video',
    title: 'Watch Carefully!',
    description: 'When you see ANY parlay happen (yours or others\'), tap the button quickly!',
    action: 'Tap when you see parlays happen',
    target: '.vote-button',
    position: 'bottom',
    requiresAction: true,
    nextTrigger: 'socket-event',
    socketEvent: 'round:ended'
  },
  {
    id: 'see-results',
    title: 'Check Your Score',
    description: 'Points are awarded for correct predictions and fast, accurate voting. See how you did!',
    action: 'View results',
    nextTrigger: 'auto'
  },
  {
    id: 'punishment-submit',
    title: 'Submit a Punishment',
    description: 'The lowest scorer spins the wheel! Submit your creative (but reasonable) punishment idea.',
    action: 'Enter punishment idea',
    target: '.punishment-input',
    position: 'top',
    requiresAction: true,
    nextTrigger: 'click'
  },
  {
    id: 'power-ups-intro',
    title: 'Power-Ups Available!',
    description: 'Earn points to buy power-ups: steal points, get hints, block others, and more!',
    action: 'Check the store between rounds',
    nextTrigger: 'click'
  },
  {
    id: 'tutorial-complete',
    title: 'You\'re a Parlay Pro! 🏆',
    description: 'You know the basics! Join a real game and show off your prediction skills.',
    action: 'Exit tutorial',
    nextTrigger: 'click'
  }
];

export const tutorialVideos: TutorialVideo[] = [
  {
    id: 'tutorial-1',
    title: 'Tutorial: Office Pranks Compilation',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll for fun
    duration: 30,
    parlays: [
      {
        id: 'p1',
        playerName: 'Tutorial Bot 1',
        prediction: 'Someone will knock something over',
        timestamp: 8,
        isCorrect: true
      },
      {
        id: 'p2',
        playerName: 'Tutorial Bot 2',
        prediction: 'The music changes dramatically',
        timestamp: 15,
        isCorrect: true
      },
      {
        id: 'p3',
        playerName: 'You',
        prediction: 'Someone dances',
        timestamp: 20,
        isCorrect: true
      }
    ]
  }
];

export const tutorialAchievements = [
  {
    id: 'tutorial-host',
    name: 'Party Starter',
    description: 'Complete the host tutorial',
    icon: '🎉',
    points: 100
  },
  {
    id: 'tutorial-player',
    name: 'Quick Learner',
    description: 'Complete the player tutorial',
    icon: '📚',
    points: 100
  },
  {
    id: 'tutorial-perfect',
    name: 'Tutorial Master',
    description: 'Complete tutorial with perfect score',
    icon: '🏆',
    points: 200
  }
];
