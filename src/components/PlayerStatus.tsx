import type { GameState } from '../types';
import { SUIT_SYMBOLS, WEAPON_NAMES } from '../utils/constants';
import './PlayerStatus.css';

interface PlayerStatusProps {
  gameState: GameState;
}

export function PlayerStatus({ gameState }: PlayerStatusProps) {
  const { hp, maxHp, weapon, lastMonsterSlain } = gameState;
  const hpPercentage = (hp / maxHp) * 100;

  const getHpColorClass = () => {
    if (hpPercentage > 60) return 'player-status__hp-fill--high';
    if (hpPercentage > 30) return 'player-status__hp-fill--medium';
    return 'player-status__hp-fill--low';
  };

  const weaponName = weapon ? WEAPON_NAMES[weapon.rank] : null;

  // Degradation bar: 14 = Ace (max possible monster)
  const maxMonsterValue = 14;
  const degradationPercent = lastMonsterSlain !== null
    ? (lastMonsterSlain / maxMonsterValue) * 100
    : 100;

  const getDegradationClass = () => {
    if (lastMonsterSlain === null) return '';
    if (degradationPercent > 60) return 'player-status__degrade-fill--good';
    if (degradationPercent > 30) return 'player-status__degrade-fill--warn';
    return 'player-status__degrade-fill--critical';
  };

  return (
    <div className="player-status">
      <div className="player-status__section">
        <div className="player-status__hp">
          <span className="player-status__label">Health</span>
          <div className="player-status__hp-bar">
            <div
              className={`player-status__hp-fill ${getHpColorClass()}`}
              style={{ width: `${hpPercentage}%` }}
            />
            <span className="player-status__hp-text">
              {hp} / {maxHp}
            </span>
          </div>
        </div>
      </div>

      <div className="player-status__section">
        <div className="player-status__weapon">
          <span className="player-status__label">Weapon</span>
          {weapon ? (
            <>
              <div className="player-status__weapon-info">
                <span className="player-status__weapon-card">
                  {weaponName || `${weapon.rank}${SUIT_SYMBOLS[weapon.suit]}`}
                </span>
                <span className="player-status__weapon-strength">
                  {weapon.value} ATK
                </span>
              </div>
              {lastMonsterSlain !== null && (
                <div className="player-status__degradation">
                  <span className="player-status__degrade-label">
                    Fights ≤ {lastMonsterSlain} only
                  </span>
                  <div className="player-status__degrade-bar">
                    <div
                      className={`player-status__degrade-fill ${getDegradationClass()}`}
                      style={{ width: `${degradationPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <span className="player-status__weapon-none">Bare hands</span>
          )}
        </div>
      </div>
    </div>
  );
}
