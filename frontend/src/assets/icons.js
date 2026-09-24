// Single source of truth for every piece of Daily Streak artwork.
import coin from './icons/VEs_Coin.webp';
import flame from './icons/Flame.webp';
import day4 from './icons/Day-4.webp';
import day5 from './icons/Day-5.webp';
import day7 from './icons/Day-7.webp';
import exclusive from './icons/Exclusive-reward.webp';
import bigger from './icons/Bigger_Streak.webp';
import stay from './icons/Stay_Active.webp';
import trust from './icons/Trust.webp';
import topLeft from './icons/Top_Left.webp';
import topRight from './icons/Top_right.webp';
import mobileHero from './icons/Mobile_Hero.webp';

export const ICONS = { coin, flame, day4, day5, day7, exclusive, bigger, stay, trust, topLeft, topRight, mobileHero };

// Picks the artwork for a reward card from the backend's assetType (coin |
// gift-card | crown). Gift cards use the Day 4 gift-box art on day 4 and the
// plain Amazon card art otherwise.
export function getRewardIcon(card) {
  switch (card?.reward?.assetType) {
    case 'crown': return ICONS.day7;
    case 'gift-card': return card.day === 4 ? ICONS.day4 : ICONS.day5;
    default: return ICONS.coin;
  }
}
