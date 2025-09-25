---
selfHealing: Your value here
---
// import { FieldCustomAction } from '@frontmatter/extensibility';

// (async () => {
//   // Retrieve the front matter of the current content
//   const frontMatter = FieldCustomAction.getArguments();
//   return console.log(frontMatter);
//   // Write your logic here to create the field value
//   const generateRandomConsonants = () => {
//     const consonants = 'bcdfghjklmnpqrstvwxyz';
//     let result = '';
//     for (let i = 0; i < 6; i++) {
//       result += consonants.charAt(Math.floor(Math.random() * consonants.length));
//     }
//     return result;
//   }
//   const generateSelfHealing = (title) => {
//     if (!title) return generateRandomConsonants().toUpperCase();
//         return title
//             .toLowerCase()
//             .split(" ")
//             .map(word => word.replace(/[^bcdfghjklmnpqrstvwxyz]/g, '').substring(0, 6))
//             .join("").toUpperCase();
//     }

//   // Update the field with the new value
//   FieldAction.update(generateSelfHealing(title));
// })();

import { FieldAction } from '@frontmatter/extensibility';

(async () => {
  // Retrieve the front matter of the current content
  const { frontMatter } = FieldAction.getArguments();

  // Write your logic here to create the field value
  const value = frontMatter;

  // Update the field with the new value
  FieldAction.update(value);
})();