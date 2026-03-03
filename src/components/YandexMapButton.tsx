interface MapLinkProps {
  latitude: number;
  longitude: number;
}

export function YandexMapButton({ latitude, longitude }: MapLinkProps) {
  const url = `https://yandex.com/maps/?ll=${longitude},${latitude}&z=16`;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        window.open(url, "_blank");
      }}
      className="p-2 text-gray-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
      aria-label="Open in Yandex Maps"
    >
      <img src="/yandex-map.png" className="w-5 h-5" />
    </button>
  );
}