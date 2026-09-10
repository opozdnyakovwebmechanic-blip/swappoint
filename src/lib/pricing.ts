const categoryBase: Record<string, number> = {
  "Платья": 10,
  "Верхняя одежда": 16,
  "Брюки и юбки": 9,
  "Рубашки и блузы": 8,
  "Трикотаж": 9,
  "Обувь": 14,
  "Сумки": 14,
  "Аксессуары": 6,
};

const brandBonus: Record<string, number> = { BASE: 0, MID: 3, PREMIUM: 7 };
const conditionMultiplier: Record<string, number> = {
  "Как новое": 1.2,
  "Отличное": 1,
  "Хорошее": 0.8,
};

export function calculatePoints(input: { category: string; brandTier?: string; condition: string; material: string }) {
  const base = categoryBase[input.category] ?? 8;
  const tier = brandBonus[input.brandTier ?? "BASE"] ?? 0;
  const materialBonus = /шерсть|шелк|кожа|лен|кашемир/i.test(input.material) ? 2 : 0;
  const multiplier = conditionMultiplier[input.condition] ?? 1;
  const points = Math.max(3, Math.min(35, Math.round((base + tier + materialBonus) * multiplier)));
  return {
    points,
    note: `Категория: ${base} · бренд: +${tier} · материал: +${materialBonus} · состояние: ${input.condition}`,
  };
}
