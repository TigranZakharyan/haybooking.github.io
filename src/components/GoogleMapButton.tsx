interface MapLinkProps {
  latitude: number;
  longitude: number;
}

export function GoogleMapButton({ latitude, longitude }: MapLinkProps) {
  const url = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        window.open(url, "_blank");
      }}
      className="p-2 text-gray-600 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
      aria-label="Open in Yandex Maps"
    >
      <img src="/google-map.png" className="w-5 h-5" />
    </button>
  );
}