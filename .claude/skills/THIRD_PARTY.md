# Third-party skills

The skills below are copied unchanged from [mattpocock/skills](https://github.com/mattpocock/skills) at commit `b0618bc436ad893b3c5e84e55fba86586d34a404` (2026-10-08), under the MIT License reproduced at the end of this file.

| Skill | Upstream path |
| --- | --- |
| `codebase-design` | `skills/engineering/codebase-design/` |
| `diagnosing-bugs` | `skills/engineering/diagnosing-bugs/` |
| `domain-modeling` | `skills/engineering/domain-modeling/` |
| `grill-with-docs` | `skills/engineering/grill-with-docs/` |
| `improve-codebase-architecture` | `skills/engineering/improve-codebase-architecture/` |
| `grilling` | `skills/productivity/grilling/` |

To update one, copy the folder again from a newer commit and change the commit above. Local changes belong in this repository's own rules or skills, not in these copies, so an update never overwrites them.

## Know before you use: the architecture report loads remote scripts

`improve-codebase-architecture` writes its report as an HTML file in the temp
folder and opens it in the browser. The page loads Tailwind from
`cdn.tailwindcss.com` and Mermaid 11 from `cdn.jsdelivr.net` (Mermaid in `loose`
mode), and it holds your project's file names and architecture notes. Whoever
controls either CDN could read that page, and so could hostile text in your own
repository, such as a file name or a note the agent writes into the page without
escaping it (Mermaid's loose mode also renders HTML inside diagrams). It holds
no secrets unless you put them there; use the skill knowingly. The copy stays
unchanged, as above.

## License

```text
MIT License

Copyright (c) 2026 Matt Pocock

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
