export async function GET({ params, request }) {
  return new Response(
    JSON.stringify({
      id: "mynotebook/v1",
      name: "Giorgiosaud Personal Notebook",
      orientation:"natural",
      short_name: "Giorgiosaud.io",
      description: "A personal notebook for Giorgiosaud",
      start_url: "/",
      display: "minimal-ui",
      display_override: ["fullscreen", "standalone"],
      background_color: "#f1f5f9",
      theme_color: "#f7f7f7",
      icons: [
        {
          src: "/favicon.ico",
          sizes: "16x16",
          type: "image/ico",
        },
      ],
      screenshots: [
        {
          src: "https://res.cloudinary.com/giorgiosaud/image/upload/v1738025420/blog/mobile_screenshot_x1nr2x.png",
          sizes: "1280x720",
          type: "image/webp",
          form_factor: "narrow",
          label: "Homescreen of Awesome App",
        },
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
