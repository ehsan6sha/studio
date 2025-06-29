
export interface StoryContent {
  type: 'image' | 'video';
  url: string;
  duration?: number; // in seconds
  header: string;
  text: string;
  aiHint?: string;
}

export interface Story {
  id: string;
  username: string; // This is the "category name"
  avatar: string; // This is the "thumbnail image"
  avatarAiHint?: string;
  content: StoryContent[];
}

// This data would normally come from Firebase Datastore
const storiesData: Story[] = [
  {
    id: 'user1',
    username: 'RavanHamrah',
    avatar: 'https://placehold.co/100x100.png?text=RH',
    avatarAiHint: 'logo abstract',
    content: [
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'nature calm', header: 'Welcome!', text: 'Discover daily tips for mental wellness.', duration: 7 },
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'meditation calm', header: 'Mindfulness', text: 'Take 5 minutes to breathe deeply.', duration: 5 },
    ],
  },
  {
    id: 'user2',
    username: 'Dr. Ahmadi',
    avatar: 'https://placehold.co/100x100.png?text=DA',
    avatarAiHint: 'professional portrait',
    content: [
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'psychology book', header: 'Cognitive Biases', text: 'Learn how your thoughts can trick you. Today, we look at confirmation bias.', duration: 8 },
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'journal writing', header: 'Journaling Tip', text: 'Try writing down three things you are grateful for each day.', duration: 6 },
      { type: 'video', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', header: 'Neuroplasticity', text: 'Your brain can change and adapt, no matter your age.', duration: 10 },
    ],
  },
  {
    id: 'user3',
    username: 'HealthyHabits',
    avatar: 'https://placehold.co/100x100.png?text=HH',
    avatarAiHint: 'healthy food',
    content: [
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'running shoes', header: 'Move Your Body', text: 'Even a 15-minute walk can boost your mood.', duration: 5 },
    ],
  },
  {
    id: 'user4',
    username: 'SleepWell',
    avatar: 'https://placehold.co/100x100.png?text=SW',
    avatarAiHint: 'moon stars',
    content: [
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'bedroom night', header: 'Sleep Hygiene', text: 'Avoid screens for at least an hour before bed for better sleep quality.', duration: 7 },
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'cup tea', header: 'Herbal Tea', text: 'Chamomile tea can help you relax before sleeping.', duration: 5 },
    ],
  },
   {
    id: 'user5',
    username: 'MindfulEats',
    avatar: 'https://placehold.co/100x100.png?text=ME',
    avatarAiHint: 'vegetables fruits',
    content: [
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'healthy food', header: 'Eat Mindfully', text: 'Pay attention to the food you eat and enjoy every bite.', duration: 6 },
    ],
  },
  {
    id: 'user6',
    username: 'SocialConnect',
    avatar: 'https://placehold.co/100x100.png?text=SC',
    avatarAiHint: 'friends talking',
    content: [
      { type: 'image', url: 'https://placehold.co/1080x1920.png', aiHint: 'people community', header: 'Connect with Others', text: 'Reach out to a friend or family member today.', duration: 5 },
    ],
  },
];

// This function simulates fetching from a database.
export const fetchStories = (): Promise<Story[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(storiesData);
    }, 1000); // Simulate 1 second network delay
  });
};
