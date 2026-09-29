export default function streakMessage(n) {
  if (n <= 0) return 'Check in today to start your streak.';
  if (n <= 2) return 'Great start! Keep going.';
  if (n <= 6) return "You're building momentum!";
  if (n <= 13) return 'One week strong! 🔥';
  if (n <= 29) return "You're becoming unstoppable!";
  return 'Legendary consistency! 🏆';
}
