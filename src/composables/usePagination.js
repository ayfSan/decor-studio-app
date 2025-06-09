import { ref, computed, watch } from "vue";

export default function usePagination(sourceData, options = {}) {
  const { itemsPerPage = 10 } = options;

  const currentPage = ref(1);

  const totalPages = computed(() => {
    return Math.ceil(sourceData.value.length / itemsPerPage);
  });

  const paginatedItems = computed(() => {
    if (!sourceData.value) return [];
    const startIndex = (currentPage.value - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sourceData.value.slice(startIndex, endIndex);
  });

  // Watch for changes in source data to reset pagination
  watch(sourceData, () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value || 1;
    }
  });

  function nextPage() {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  }

  function prevPage() {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  }

  function goToPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= totalPages.value) {
      currentPage.value = pageNumber;
    }
  }

  const displayedPages = computed(() => {
    const total = totalPages.value;
    const current = currentPage.value;
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    if (total <= 1) {
      return [];
    }

    range.push(1);
    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(total - 1, current + delta);
      i++
    ) {
      range.push(i);
    }
    if (total > 1) {
      range.push(total);
    }

    const uniqueSortedRange = [...new Set(range)].sort((a, b) => a - b);

    uniqueSortedRange.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  });

  return {
    paginatedItems,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    displayedPages,
  };
}
