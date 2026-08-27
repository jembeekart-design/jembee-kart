export interface AIHistoryItem {
  id: string;

  scannerId: string;

  file: string;

  applied: boolean;

  createdAt: Date;
}

const history: AIHistoryItem[] = [];

export function addHistory(
  item: AIHistoryItem
) {
  history.unshift(item);
}

export function getHistory() {
  return history;
}
