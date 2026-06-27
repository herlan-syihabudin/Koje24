import { Suspense } from "react"
import UnsubscribeClient from "./UnsubscribeClient"

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center" }}>⏳ Loading...</p>}>
      <UnsubscribeClient />
    </Suspense>
  )
}
