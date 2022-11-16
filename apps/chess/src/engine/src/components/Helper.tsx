import { useHelper } from "@react-three/drei";

export function Helper({ helper, entity, ...props }) {
  useHelper(
    {
      get current() {
        return entity();
      },
    },
    helper
  );
  return null;
}
