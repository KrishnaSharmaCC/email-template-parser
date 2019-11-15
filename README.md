# email-template-parser
This parser acts like a templating enegine i.e. we can modularize the html components and include them in other html files as required. Once it is fed to the parser, it would generate the final html file which would have:
1. All the included sub components,
2. Inlined styles so as to be supported by all the mail clients
3. Prettified final code.

# Getting started

e.g: Let's say we have a `sample.html` file and a `child.html` which the `sample.html` imports inside it.
1.  The way to include it properly for the parser is by placing all the reusable components inside the `src/html/components` folder and the actual parent files in the `src/html` folder.
2. Then, we include the child components in the parent component with the code `${include ./components/child.html}$` in the `sample.html` file (Note: `${include }$` is case-sensitive and the include statement should be closed properly with a '$'
3. Feed the `sample.html` file to parser and you are good to go 🎉

# How-To
Firing up the parser is pretty simple:
1. Open a terminal and clone this repo.
2. Run `npm start` to fire up the parser. For the first time users, it would install few dependencies that this parser needs and you are ready to go.

# Feeding the input
1. There are three directories inside the `src` folder namely `html`, `stylesheet` & `output`.
     - `html` - All the input html files should be placed here. We should use the files placed here as an input to the parser.
     - `stylesheet` - The stylesheet that is used by all the components (main & sub) should be placed here. Aas of now, the parser only suupports a single global stylesheet.
     - `output` - This is the folder where the parsed files will be placed into.
2. Once you start the parser, you will be prompted to enter a file name(relative path to the cloned directory). NOTE: You can also add multiple files for batch conversions.
3. Hit Enter.. And it's done. If successful, your parsed file will be placed inside `src/output` directory.
