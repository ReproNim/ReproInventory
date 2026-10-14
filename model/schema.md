<!-- GENERATED FILE - DO NOT EDIT. Run: python model/generate_from_schema.py -->

# ReproInventory schema: `ReproInventoryEntry`

Source: [`reproinventory_schema.yaml`](reproinventory_schema.yaml) (LinkML).

| Field | Type | Multiple values | Allowed values | Description |
| --- | --- | --- | --- | --- |
| `id` | integer |  |  |  |
| `tag_team` | string | yes |  |  |
| `course_name` | string |  |  |  |
| `url` | string |  |  |  |
| `level` | enum | yes | `Beginner`, `Intermediate`, `Advanced`, `NA` |  |
| `platform` | enum | yes | `Mac`, `Windows`, `Linux`, `Docker`, `Jupyter`, `NA` |  |
| `keywords` | string | yes |  |  |
| `course_length` | enum |  | `<1 hr`, `1-4 hrs`, `1 day`, `1-3 days`, `1 week`, `1+ weeks`, `NA` |  |
| `instruction_medium` | enum | yes | `Hands-on tutorial / notebooks`, `lecture`, `video`, `notes`, `blog post`, `reference`, `slides`, `website`, `outline`, `meta-resource`, `NA` |  |
| `delivery` | enum | yes | `self-paced`, `instructor`, `Hybrid` |  |
| `language` | enum | yes | `English`, `French`, `Spanish`, `Chinese`, `German`, `English, French`, `English, German`, `Other`, `NA` |  |
| `programming_language` | enum | yes | `Python`, `R`, `shell scripting`, `Matlab`, `Git`, `NA` |  |
| `neuroimaging_software` | enum | yes | `AFNI`, `SPM`, `FSL`, `Freesurfer`, `Python`, `Multiple`, `NA` |  |
| `imaging_modality` | enum | yes | `DWI`, `Structural`, `Functional`, `Task-based`, `Resting-State`, `EEG`, `Behavioral`, `MEG`, `MRI`, `NA` |  |
| `open_dataset` | boolean |  |  | Whether the resource uses openly available data. |
| `last_updated` | string |  |  |  |
| `functionality` | string |  |  |  |
| `assessment` | boolean |  |  |  |
| `prerequisite` | string | yes |  |  |
| `source` | string | yes |  |  |
| `description` | string |  |  | A short summary of what the resource covers. |
| `review` | string |  |  |  |
| `exclude_from_repro_inventory` | boolean |  |  |  |
| `alias_links` | string |  |  |  |
| `notes` | string |  |  |  |
| `quadrants` | enum | yes | `information-oriented (reference)`, `understanding-oriented (explanation)`, `learning-oriented (tutorials)`, `problem-oriented (how to guides)`, `NA` |  |
