import { chakra } from "@chakra-ui/react";

export default function Menu({ color }) {
  return (
    <chakra.svg viewBox="0 0 24 24">
      <rect x="1" y="11" width="22" height="2" fill={color} />
      <rect x="1" y="19" width="22" height="2" fill={color} />
      <rect x="1" y="3" width="22" height="2" fill={color} />
    </chakra.svg>
  );
}
