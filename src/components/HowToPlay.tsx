import './HowToPlay.css';

interface HowToPlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowToPlay({ isOpen, onClose }: HowToPlayProps) {
  if (!isOpen) return null;

  return (
    <div className="how-to-play" onClick={onClose}>
      <div className="how-to-play__content" onClick={(e) => e.stopPropagation()}>
        <button className="how-to-play__close" onClick={onClose}>
          ✕
        </button>

        <h2 className="how-to-play__title">How to Play Scoundrel</h2>

        <div className="how-to-play__section">
          <h3>🎯 Goal</h3>
          <p>Survive the dungeon by clearing all 44 cards. Your score is your remaining HP!</p>
        </div>

        <div className="how-to-play__section">
          <h3>🃏 Card Types (44 cards)</h3>
          <div className="how-to-play__cards">
            <div className="how-to-play__card-type how-to-play__card-type--monster">
              <span className="how-to-play__card-icon">👹</span>
              <div>
                <strong>Monsters</strong> (26 cards: all ♠♣)
                <p>All Clubs & Spades. Damage = card value (J=11, Q=12, K=13, A=14)</p>
              </div>
            </div>
            <div className="how-to-play__card-type how-to-play__card-type--weapon">
              <span className="how-to-play__card-icon">🗡️</span>
              <div>
                <strong>Weapons</strong> (9 cards: 2-10 ♦)
                <p>Diamonds 2-10. Attack power = card value. Must equip if picked up.</p>
              </div>
            </div>
            <div className="how-to-play__card-type how-to-play__card-type--potion">
              <span className="how-to-play__card-icon">❤️</span>
              <div>
                <strong>Potions</strong> (9 cards: 2-10 ♥)
                <p>Hearts 2-10. Heal HP = card value. Only 1 per turn!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="how-to-play__section">
          <h3>⚔️ Combat</h3>
          <ul>
            <li><strong>Barehanded:</strong> Take full monster damage</li>
            <li><strong>With weapon:</strong> Damage = Monster - Weapon (min 0)</li>
            <li><strong>Weapon limit:</strong> After killing a monster, weapon can only fight monsters ≤ that value</li>
          </ul>
        </div>

        <div className="how-to-play__section">
          <h3>🚪 Rooms</h3>
          <ul>
            <li>Each room has 4 cards</li>
            <li>You must face <strong>3 of 4 cards</strong> - leave 1 for next room</li>
            <li>You may <strong>Avoid</strong> a room (put all 4 at bottom of deck)</li>
            <li>Cannot avoid two rooms in a row!</li>
          </ul>
        </div>

        <div className="how-to-play__section">
          <h3>📊 Scoring</h3>
          <ul>
            <li><strong>Win:</strong> Score = remaining HP</li>
            <li><strong>Bonus:</strong> If HP is 20 and last card was a potion, add potion value!</li>
            <li><strong>Lose:</strong> Score = HP minus all remaining monster values (negative)</li>
          </ul>
        </div>

        <div className="how-to-play__section">
          <h3>💡 Tips</h3>
          <ul>
            <li>Manage your weapon carefully - once degraded, it can't kill stronger monsters</li>
            <li>Sometimes fight barehanded to preserve weapon for bigger threats</li>
            <li>Save your potion for when you need it - only 1 per turn!</li>
            <li>Avoiding rooms puts cards at the BOTTOM - you'll see them again</li>
          </ul>
        </div>

        <button className="how-to-play__got-it" onClick={onClose}>
          Got it! Let's play
        </button>
      </div>
    </div>
  );
}
