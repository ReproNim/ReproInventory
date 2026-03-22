# ReproInventory - Claude Instructions

## Project Overview

ReproInventory is a web application for browsing neuroimaging and reproducibility training materials. It is part of the ReproNim project. Users can search and filter a catalog of training resources by level, platform, format, programming language, neuroimaging software, and more.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (built on Radix UI primitives)
- **Icons:** lucide-react
- **Data:** Static JSON file served from `frontend/public/data/reproinventory_data.json`
- **Model/Schema:** YAML-based schema in `model/`, with Python scripts to generate JSON
- **Deploy:** GitHub Pages via GitHub Actions (pushes to `main` auto-deploy)

## Directory Structure

```
frontend/               # Main React app
  src/
    components/         # Custom components (e.g. Footer, EditMaterialDialog, AddMaterialDialog)
    components/ui/      # shadcn/ui primitives (accordion, badge, button, card, etc.)
    types/              # TypeScript types generated from the YAML schema
    training-materials-browser.tsx  # Main browser/filter UI
    App.tsx             # Root component
  public/
    data/
      reproinventory_data.json  # The training materials dataset

model/                  # Schema and data source of truth
  model.yaml            # LinkML schema definition
  reproinventory_data.yaml     # Raw training data
  reproinventory_schema.yaml   # Schema
  generate_reproinventory_data.py  # Generates JSON from YAML
  convert_yaml_to_json.py

SimpleViewer/           # Legacy Python/Flask viewer (archived, do not modify)
```

## Development Commands

All commands run from the `frontend/` directory:

```bash
npm run dev       # Start local dev server
npm run build     # TypeScript check + Vite build
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

## Data Model

The data schema is defined in `model/model.yaml` (LinkML). TypeScript types in `frontend/src/types/reproinventory.ts` are generated from this schema. Key fields on `ReproInventoryEntry`:

- `id`, `course_name`, `url`, `review`, `notes`, `keywords`
- `level`, `platform`, `course_length`, `instruction_medium`, `delivery`
- `language`, `programming_language`, `neuroimaging_software`, `imaging_modality`
- `open_dataset`, `assessment`, `quadrants`, `tag_team`

Enum values are strict — always use values that match the schema.

## Code Conventions

- Use the types from `frontend/src/types/reproinventory.ts` for all data model types; do not redefine them locally (note: `AddMaterialDialog.tsx` currently duplicates types — prefer importing from the shared types file in new code).
- Use `@/` path alias for imports (e.g. `@/components/ui/button`).
- UI primitives live in `frontend/src/components/ui/` — use these rather than raw HTML elements.
- Custom components go in `frontend/src/components/`.
- The dataset is fetched at runtime from `/ReproInventory/data/reproinventory_data.json` (the GitHub Pages base path).

## Deployment

- Pushing to `main` triggers GitHub Actions which builds the frontend and deploys to GitHub Pages.
- The Vite base path is set for GitHub Pages — keep this in mind when referencing public assets.
- Do not push broken builds to `main`.

## What to Avoid

- Do not modify files in `SimpleViewer/` — it is a legacy viewer and not actively used.
- Do not change enum values without also updating `model/model.yaml` and regenerating types.
- Do not hardcode data that belongs in `reproinventory_data.json` or the YAML source.
- Do not add dependencies without good reason — the stack is intentionally minimal.
