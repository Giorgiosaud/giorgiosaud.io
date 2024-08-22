export async function GET({ params, request }) {
  return new Response(
    JSON.stringify({
      name: "Giorgiosaud Personal Notebook",
      short_name: "Giorgiosaud.io",
      description: "A personal notebook for Giorgiosaud",
      start_url: "/",
      display: "standalone",
      background_color: "#f7f7f7",
      theme_color: "#f7f7f7",
      icons: [
        {
          src: "/favicon.ico",
          sizes: "16x16",
          type: "image/ico",
        },
        {
          src: "/android-icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
      ],
      screenshots: [
        {
          src: "https://res.cloudinary.com/giorgiosaud/image/upload/v1718219196/blog/home-screenshot_fjnul6?_a=DATAdtIIZAA0",
          sizes: "1280x720",
          type: "image/webp",
          form_factor: "wide",
          label: "Homescreen of Awesome App",
        },
        {
          src: "https://res.cloudinary.com/giorgiosaud/image/upload/blog/notebook-screenshot_cispy7?_a=DATAdtIIZAA0",
          sizes: "1280x720",
          type: "image/webp",
          form_factor: "wide",
          label: "List of Awesome Resources available in Awesome App",
        },
      ],
    }),
  );
}
