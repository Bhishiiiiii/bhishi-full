// Formatting and cryptographic simulation helpers

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatShortINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} Lakh`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}k`;
  }
  return `₹${amount}`;
}

export function truncateHash(hash?: string, chars = 6): string {
  if (!hash) return '';
  if (hash.length <= chars * 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

// Generate realistic simulated SHA-256 and Transaction Hashes
export function generateSimulatedHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const salt1 = '7a4f9b2c3d1e8a0f5e6d2b4c1a9f3e7b';
  const salt2 = '0c8d4e2f1a9b3c5e7d8f2a1b4c6e9d0a';
  return `0x${hex}${salt1.slice(0, 16)}${salt2.slice(0, 16)}`.slice(0, 66);
}

export function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let res = '0x';
  for (let i = 0; i < 64; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}
