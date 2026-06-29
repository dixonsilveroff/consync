export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

export function distanceToPolylineMetres(
  point: { lat: number; lng: number },
  polyline: { lat: number; lng: number }[]
): number {
  if (polyline.length === 0) return Infinity;
  if (polyline.length === 1) return getDistanceMeters(point.lat, point.lng, polyline[0].lat, polyline[0].lng);

  let minDistance = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const a = polyline[i];
    const b = polyline[i + 1];

    const d13 = getDistanceMeters(a.lat, a.lng, point.lat, point.lng);
    const d23 = getDistanceMeters(b.lat, b.lng, point.lat, point.lng);
    const d12 = getDistanceMeters(a.lat, a.lng, b.lat, b.lng);

    if (d12 === 0) {
      minDistance = Math.min(minDistance, d13);
      continue;
    }

    const s = (d12 + d13 + d23) / 2;
    const area = Math.sqrt(Math.max(0, s * (s - d12) * (s - d13) * (s - d23)));
    const h = (2 * area) / d12;

    const angle1 = Math.acos(Math.max(-1, Math.min(1, (d12*d12 + d13*d13 - d23*d23) / (2 * d12 * d13))));
    const angle2 = Math.acos(Math.max(-1, Math.min(1, (d12*d12 + d23*d23 - d13*d13) / (2 * d12 * d23))));

    let distToSegment;
    if (angle1 >= Math.PI / 2) {
      distToSegment = d13;
    } else if (angle2 >= Math.PI / 2) {
      distToSegment = d23;
    } else {
      distToSegment = h;
    }

    minDistance = Math.min(minDistance, distToSegment);
  }
  return minDistance;
}
