# ReproInventory frontend

The web interface for browsing the ReproInventory, a static React +
TypeScript + Vite site deployed to GitHub Pages
(https://repronim.org/ReproInventory/).

## Development

```bash
npm install
npm run dev       # local dev server
npm run lint      # ESLint
npm run build     # type-check and production build
```

## Where things come from

- **Data:** `public/data/reproinventory_data.json` is generated from
  `model/reproinventory_data.yaml`. Do not edit it by hand; edit the YAML and run
  `python model/convert_yaml_to_json.py`.
- **Types and filter options:** `src/types/reproinventory.ts` is generated from the
  LinkML schema `model/reproinventory_schema.yaml`. Do not edit it by hand; change
  the schema and run `python model/generate_from_schema.py`.

CI fails if either generated file is out of date.
