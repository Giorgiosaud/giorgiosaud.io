export async function GET({params,request}){
    return new Response(JSON.stringify({
        "name": "Giorgiosaud Personal Notebook",
        "short_name": "Giorgiosaud.io",
        "description": "A personal notebook for Giorgiosaud",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#f7f7f7",
        "theme_color": "#f7f7f7",
        "icons": [
        {
            "src": "/favicon.ico",
            "sizes": "16x16",
            "type": "image/ico"
        },
        {
            "src":"/android-icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        }
        ],
        "screenshots" : [
            {
              "src": "https://cdn.giorgiosaud.io/Screenshot%202024-06-04%20at%2010.38.53%E2%80%AFAM.png?&fit=crop&w=1280&h=720&format=webp",
              "sizes": "1280x720",
              "type": "image/webp",
              "form_factor": "wide",
              "label": "Homescreen of Awesome App"
            },
            {
              "src": "https://cdn.giorgiosaud.io/Screenshot%202024-06-04%20at%2010.40.23%E2%80%AFAM.png?&fit=crop&w=1280&h=720&format=webp",
              "sizes": "1280x720",
              "type": "image/webp",
              "form_factor": "wide",
              "label": "List of Awesome Resources available in Awesome App"
            }
          ]
    }
    ));
}