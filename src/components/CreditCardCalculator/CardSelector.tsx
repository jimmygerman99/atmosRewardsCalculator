import { CARDS } from '../../data/cards';

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function CardSelector({ selectedIds, onChange }: Props) {
  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Select Your Card(s)</h2>
      <div className="flex flex-wrap gap-3">
        {CARDS.map((card) => {
          const selected = selectedIds.includes(card.id);
          return (
            <button
              key={card.id}
              onClick={() => toggle(card.id)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors cursor-pointer ${
                selected
                  ? 'bg-blue-950 border-blue-950 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-900/40'
              }`}
            >
              {card.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
