import { Leva } from "leva"

export function EditorPanels() {
  return (
    <Leva
      theme={{
        space: {
          rowGap: "2px",
          md: "10px"
        },
        sizes: {
          titleBarHeight: "28px"
        }
      }}
    />
  )
}
