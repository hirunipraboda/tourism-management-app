export function getInitials(name: string): string {
  if (!name) return 'NV';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getRandomColor(id: string): string {
  const colors = [
    'bg-sky-500',
    'bg-teal-500',
    'bg-amber-500',
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-purple-500',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
