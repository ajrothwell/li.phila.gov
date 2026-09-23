import { onMounted, onUnmounted, ref, type Ref } from 'vue'

/** Same breakpoints as the mobile overrides in App.vue's <style>; keep them in sync. */
export const mobileMediaQuery = '(max-width: 768px), (max-width: 1064px) and (max-height: 600px)'

export function useIsMobile(): Ref<boolean> {
  const mql = matchMedia(mobileMediaQuery)

  const isMobile = ref(mql.matches)

  function updateIsMobile(e: MediaQueryListEvent) {
    isMobile.value = e.matches
  }

  onMounted(() => {
    mql.addEventListener('change', updateIsMobile)
  })

  onUnmounted(() => {
    mql.removeEventListener('change', updateIsMobile)
  })

  return isMobile
}
