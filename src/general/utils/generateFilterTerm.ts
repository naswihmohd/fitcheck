import type { SortOption } from "../components/SortingInput";


function generateFilterTerm(sortBy: SortOption, searchQuery: string | null): string {
  return `${sortBy} ${searchQuery ? `AND ${searchQuery}` : ''}`;
}

export default generateFilterTerm;