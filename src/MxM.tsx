/*
const OLD_SPELLS: Spell[] = [
  { name: "arc", cards: ["damage", "spread", "spread"] },
  { name: "cone", cards: ["damage", "reach", "spread"] },
  { name: "beam", cards: ["damage", "reach", "reach"] },
  { name: "storm", cards: ["damage", "damage", "spread", "spread", "spread"] },
  { name: "blast", cards: ["damage", "spread", "spread", "spread"] },
  { name: "desintegrate", cards: ["damage", "damage", "damage"] },
  { name: "curse", cards: ["damage", "control", "reach"] },
  { name: "curseGroup", cards: ["damage", "control", "spread", "spread"] },

  { name: "heal", cards: ["restore", "restore", "restore"] },
  { name: "healGroup", cards: ["restore", "restore", "spread", "spread"] },
  { name: "regenerate", cards: ["restore", "restore", "reach"] },
  {
    name: "revive",
    cards: ["restore", "restore", "restore", "reach", "reach"],
  },
  { name: "bless", cards: ["restore", "control", "reach"] },
  { name: "pacify", cards: ["restore", "restore", "control", "control"] },
  { name: "purify", cards: ["restore", "control", "reach", "spread"] },
  { name: "leech", cards: ["restore", "restore", "damage", "damage"] },

  { name: "shield", cards: ["control", "control", "control"] },
  { name: "reflect", cards: ["control", "control", "damage", "damage"] },
  { name: "restrain", cards: ["control", "control", "reach", "reach"] },
  { name: "drain", cards: ["control", "damage", "restore"] },
  { name: "hurl", cards: ["control", "damage", "reach", "reach"] },
  { name: "shockwave", cards: ["control", "damage", "spread", "spread"] },
  { name: "blink", cards: ["control", "reach", "reach"] },
  {
    name: "compress",
    cards: ["control", "control", "damage", "damage", "reach"],
  },
];
*/

import { CSSProperties, Fragment } from "react";

const CARD_BASE_TYPES = ["A", "B", "C", "D"] as const;
type CardBaseType = typeof CARD_BASE_TYPES[number];

type CardType = CardBaseType;

type Spell = {
  name: string;
  cards: CardType[];
  points: number;
};

function range(n: number, offset: number = 0) {
  return Array(n)
    .fill(0)
    .map((_, idx) => idx + offset);
}

function split<T>(arr: T[], groupCount: number) {
  console.assert(groupCount > 0);

  const count = arr.length / groupCount;

  return Array(groupCount)
    .fill(0)
    .map((_, idx) => arr.slice(count * idx, count * (idx + 1)));
}

function shuffle<T>(array: T[]) {
  const newArray = [...array];

  let randomIndex: number;
  let currentIndex = newArray.length;

  while (currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex--);
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex],
      newArray[currentIndex],
    ];
  }

  return newArray;
}

function getCombinations<T>(elements: T[], sample: number) {
  console.assert(elements.length >= sample);

  let result: T[][] = [];
  let hasNewElement: boolean;

  const counters = range(sample);

  do {
    hasNewElement = false;

    const newEntry: T[] = [];
    for (let i = 0; i < counters.length; i++) {
      newEntry.push(elements[counters[i]]);
    }
    result.push(newEntry);

    for (let i = counters.length - 1; i >= 0; i--) {
      const distFrom0 = counters.length - 1 - i;

      if (counters[i] < elements.length - 1 - distFrom0) {
        counters[i]++;
        for (let j = 1; j <= distFrom0; j++) {
          counters[i + j] = counters[i] + j;
        }
        hasNewElement = true;
        break;
      }
    }
  } while (hasNewElement);

  return result;
}

function getStartingCards(copyCount: number) {
  return CARD_BASE_TYPES.reduce((arr, current) => {
    for (let i = 0; i < copyCount; i++) arr.push(current);
    return arr;
  }, new Array<CardType>());
}

function getRandomElements<T>(count: number, elements: T[]) {
  const mutableElements = [...elements];

  let res: T[] = [];

  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * mutableElements.length);
    res.push(mutableElements[idx]);
    mutableElements.splice(idx, 1);
  }

  return res;
}

function simulatePlayerRound(
  handCards: CardType[],
  ownCards: CardType[],
  spells: Spell[]
) {
  let res = {
    handCards: [...handCards],
    ownCards: [...ownCards],
  };

  const ownCardsPool = [...ownCards];
  const allSpellCards = spells.map((spell) => spell.cards).flat();
  const missingCards = allSpellCards.filter((card) => {
    const cardInHandIdx = ownCardsPool.indexOf(card);

    if (cardInHandIdx > -1) {
      ownCardsPool.splice(cardInHandIdx, 1);
      return false;
    }

    return true;
  });

  let idx: number = -1;
  for (let card of missingCards) {
    idx = handCards.indexOf(card);
    if (idx > -1) break;
  }

  idx = Math.max(idx, 0);
  res.ownCards.push(handCards[idx]);
  res.handCards.splice(idx, 1);
  return res;
}

function simulateRounds(
  roundCount: number,
  playerCount: number,
  handCards: CardType[][],
  ownCards: CardType[][],
  spells: Spell[][]
) {
  const mutableHandCards = [...handCards];
  const mutableOwnCards = [...ownCards];
  const players = range(playerCount);

  return range(roundCount).map((round) => {
    const roundRes = players.map((player) => {
      const playerRoundRes = simulatePlayerRound(
        mutableHandCards[player],
        mutableOwnCards[player],
        spells[player]
      );

      mutableHandCards[player] = playerRoundRes.handCards;
      mutableOwnCards[player] = playerRoundRes.ownCards;

      return playerRoundRes;
    });

    const handCardsAt0 = [...mutableHandCards[0]];
    players.forEach(
      (player) =>
        (mutableHandCards[player] = [
          ...mutableHandCards[(player + 1) % players.length],
        ])
    );
    mutableHandCards[players.length - 1] = handCardsAt0;

    return roundRes;
  });
}

const BASE_PATTERNS = [
  [1, 1, 1],

  [2, 1],
  [1, 2],

  [3],

  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1],

  [2, 1, 1],
  [1, 2, 1],
  [1, 1, 2],

  [2, 2],

  [3, 1],
  [1, 3],

  // [4],

  [2, 1, 1, 1],
  [1, 2, 1, 1],
  [1, 1, 2, 1],
  [1, 1, 1, 2],

  [2, 2, 1],
  [2, 1, 2],
  [1, 2, 2],

  [3, 1, 1],
  [1, 3, 1],
  [1, 1, 3],

  [3, 2],
  [2, 3],

  // [4, 1],
  // [1, 4],

  // [5],
];

const CARD_BASE_TYPES_AS_RANGE = range(CARD_BASE_TYPES.length);
const BASE_COMBINATIONS = CARD_BASE_TYPES_AS_RANGE.map((x) =>
  getCombinations(CARD_BASE_TYPES_AS_RANGE, x + 1)
);

const SPELLS: Spell[] = BASE_PATTERNS.map((pattern) => {
  const name = [...pattern].sort((a, b) => b - a).join("+");
  const points = pattern.reduce((sum, value) => sum + value * value + value, 0);

  return BASE_COMBINATIONS[pattern.length - 1]
    .map((combination) =>
      combination
        .map((key, idx) =>
          new Array<CardType>(pattern[idx]).fill(CARD_BASE_TYPES[key])
        )
        .flat()
    )
    .map((cards) => ({ name, cards, points }));
}).flat();

const SPELLS_COUNT = Object.keys(SPELLS).length;

const CARD_TYPE_COUNTS = Array.from(
  SPELLS.reduce((res, { cards }) => {
    for (let card of cards) res.set(card, (res.get(card) ?? 0) + 1);
    return res;
  }, new Map<CardType, number>())
);

const CARD_AMOUNT_COUNTS = Array.from(
  SPELLS.reduce((res, { cards }) => {
    res.set(cards.length, (res.get(cards.length) ?? 0) + 1);
    return res;
  }, new Map<number, number>())
).sort((a, b) => a[0] - b[0]);

const CARD_POINT_COUNTS = Array.from(
  SPELLS.reduce((res, { points }) => {
    res.set(points, (res.get(points) ?? 0) + 1);
    return res;
  }, new Map<number, number>())
).sort((a, b) => a[0] - b[0]);

const SPELLS_COUNTS_BY_PATTERN = Array.from(
  SPELLS.reduce((res, { name, cards, points }) => {
    const key = `${name}`;
    const existing = res.get(key);

    res.set(key, {
      count: (existing?.count ?? 0) + 1,
      cardCount: cards.length,
      points,
    });

    return res;
  }, new Map<string, { count: number; cardCount: number; points: number }>())
).sort((a, b) => a[0].localeCompare(b[0]));

const CARD_TYPE_COLOR_MAP: Record<CardType, CSSProperties["backgroundColor"]> =
  {
    A: "aliceblue",
    B: "honeydew",
    C: "floralwhite",
    D: "lavenderblush",
  };

const CARD_COUNT_COLOR_MAP: Record<number, CSSProperties["backgroundColor"]> = {
  3: "honeydew",
  4: "floralwhite",
  5: "lavenderblush",
};

interface CardProps {
  type: CardType;
}

function Card({ type }: CardProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 120 - 2,
        height: 40 - 2,
        border: "1px solid lightgray",
        borderRadius: 5,
        boxShadow: "0 2px 5px gainsboro",
        backgroundColor: CARD_TYPE_COLOR_MAP[type],
        fontSize: 12,
        lineHeight: "20px",
        textTransform: "uppercase",
      }}
    >
      {type}
    </div>
  );
}

const PLAYER_COUNT = 4;
const BASE_CARDS_PER_PLAYER = 4;
const SPELLS_PER_PLAYER = 5;
const ROUND_COUNT = 12;

export function Simulate() {
  const shuffledCards = shuffle(
    getStartingCards(PLAYER_COUNT * BASE_CARDS_PER_PLAYER)
  );
  const draftedSpells = range(PLAYER_COUNT).map((_) =>
    getRandomElements(SPELLS_PER_PLAYER, SPELLS).sort(
      (a, b) => b.points - a.points || a.cards.length - b.cards.length
    )
  );
  const simulatedRounds = simulateRounds(
    ROUND_COUNT,
    PLAYER_COUNT,
    split(shuffledCards, PLAYER_COUNT),
    new Array(PLAYER_COUNT).fill([]),
    draftedSpells
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: 20 }}>
      <h4>{"Spell Counts"}</h4>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div>{`total spells: ${SPELLS_COUNT}`}</div>
        <div>{`symbols: ${CARD_TYPE_COUNTS[0][1]} (each)`}</div>
        <br />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "80px 40px 1fr",
            columnGap: 10,
          }}
        >
          {CARD_AMOUNT_COUNTS.map(([key, value]) => (
            <Fragment key={key}>
              <div>{`${key} cards`}</div>
              <div>{value}</div>
              <div
                style={{
                  backgroundColor: "silver",
                  width: `${(value / SPELLS_COUNT) * 100}%`,
                  height: "20px",
                }}
              />
            </Fragment>
          ))}
        </div>
        <br />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "80px 40px 1fr",
            columnGap: 10,
          }}
        >
          {CARD_POINT_COUNTS.map(([key, value]) => (
            <Fragment key={key}>
              <div>{`${key} points`}</div>
              <div>{value}</div>
              <div
                style={{
                  backgroundColor: "silver",
                  width: `${(value / SPELLS_COUNT) * 100}%`,
                  height: "20px",
                }}
              />
            </Fragment>
          ))}
        </div>
      </div>
      <h4>{"Spell Table"}</h4>
      <table>
        <thead style={{ textAlign: "left" }}>
          <tr>
            <th>{"PATTERN"}</th>
            <th>{"VARIANTS"}</th>
            <th>{"CARDS"}</th>
            <th>{"POINTS"}</th>
            <th>{"POINTS / CARD"}</th>
          </tr>
        </thead>
        <tbody>
          {SPELLS_COUNTS_BY_PATTERN.map(([key, value], idx) => (
            <tr
              key={key}
              style={{
                backgroundColor: idx % 2 === 0 ? "gainsboro" : "white",
              }}
            >
              <td>{key}</td>
              <td>{value.count}</td>
              <td
                style={{
                  backgroundColor: CARD_COUNT_COLOR_MAP[value.cardCount],
                }}
              >
                {value.cardCount}
              </td>
              <td>{value.points}</td>
              <td
                style={{
                  backgroundColor:
                    CARD_COUNT_COLOR_MAP[
                      Math.min(
                        Math.max(
                          7 - Math.floor(value.points / value.cardCount),
                          3
                        ),
                        5
                      )
                    ],
                }}
              >
                {(value.points / value.cardCount).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 20,
        }}
      >
        <div style={{ position: "sticky", top: 0 }}>
          <h4>{"Drafted Spells"}</h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              gap: 20,
            }}
          >
            {draftedSpells.map((player, playerIdx) => (
              <div key={playerIdx}>
                <div>{`player ${playerIdx + 1}`}</div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    gap: 10,
                  }}
                >
                  {player.map((spell, spellIdx) => (
                    <div
                      key={spellIdx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 10,
                        backgroundColor:
                          spellIdx % 2 === 0 ? "gainsboro" : "white",
                      }}
                    >
                      {spell.cards.map((card, cardIdx) => (
                        <Card key={cardIdx} type={card} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4>{"Simulated Rounds"}</h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              gap: 20,
            }}
          >
            {simulatedRounds.map((round, roundIdx) => (
              <div key={roundIdx}>
                <div>{`round ${roundIdx + 1}`}</div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    gap: 10,
                  }}
                >
                  {round.map((player, playerIdx) => (
                    <div key={playerIdx} style={{ marginLeft: 10 }}>
                      <div>{`player ${playerIdx + 1}`}</div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                          gap: 10,
                        }}
                      >
                        {Object.entries(player).map(([key, value]) => (
                          <div key={key} style={{ marginLeft: 10 }}>
                            <div>{key}</div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 10,
                              }}
                            >
                              {value.map((card, cardIdx) => (
                                <Card key={cardIdx} type={card} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
