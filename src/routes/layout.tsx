import { Snackbar } from '@/components/ui/Snackbar'
import { MessageContext } from '@/hooks/message'
import {
  Slot,
  component$,
  useContextProvider,
  useStore,
} from '@builder.io/qwik'
import type { RequestHandler } from '@builder.io/qwik-city'
import '@fontsource/kanit/400.css'
import '@fontsource/kanit/500.css'

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  })
}

export default component$(() => {
  const message = useStore<{
    content: string | null
    severity: 'success' | 'error'
  }>({ content: null, severity: 'success' })
  useContextProvider(MessageContext, message)

  return (
    <>
      <Snackbar />
      <Slot />
    </>
  )
})
