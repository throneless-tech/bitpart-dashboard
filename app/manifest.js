export default function manifest() {
  return {
    name: "Bitpart",
    short_name: "A dashboard for interfacing with Bitpart.",
    description:
      "Bitpart is a messaging tool designed for human rights organizations, activists, journalists and human rights defenders working in repressive political environments at risk of surveillance.",
    start_url: "/",
    display: "standalone",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
