# TrainingProductsSchema

**Description:** A schema for tagged training products

## Classes

### TrainingProduct

**Description:** A training product with various attributes

#### Attributes

- **ID**
  - **Description:** ID
  - **Range:** string

- **Tag_Team**
  - **Description:** Tag Team
  - **Range:** string

- **Course_Name**
  - **Description:** Course Name
  - **Range:** string

- **URL**
  - **Description:** URL
  - **Range:** string

- **Level**
  - **Description:** Level
  - **Range:** Level_enum
  - **Options:**
    - Beginner
    - Intermediate
    - Advanced
    - NA

- **Platform**
  - **Description:** Platform
  - **Range:** Platform_enum
  - **Options:**
    - Mac
    - Windows
    - Linux
    - Docker
    - Jupyter
    - NA

- **Keywords**
  - **Description:** Keywords
  - **Range:** string

- **Course_Length**
  - **Description:** Course Length
  - **Range:** Course_Length_enum
  - **Options:**
    - <1 hr
    - 1-4 hrs
    - 1 day
    - 1-3 days
    - 1 week
    - 1+ weeks
    - NA

- **Instruction_Medium**
  - **Description:** Instruction Medium
  - **Range:** Content_format_enum
  - **Options:**
    - Hands-on tutorial / notebooks
    - lecture
    - video
    - notes
    - blog post
    - reference
    - slides
    - website
    - outline
    - meta-resource
    - Hybrid
    - NA

- **Delivery**
  - **Description:** Delivery
  - **Range:** Delivery_enum
  - **Options:**
    - self-paced
    - instructor
    - Discussion needed
    - NA

- **Language**
  - **Description:** Language
  - **Range:** Language_enum
  - **Options:**
    - English
    - French
    - Spanish
    - Chinese
    - Other
    - German
    - NA

- **Programming_Language**
  - **Description:** Programming Language
  - **Range:** Programming_language_enum
  - **Options:**
    - Python
    - R
    - shell scripting
    - Matlab
    - Git
    - NA

- **Neuroimaging_Software**
  - **Description:** Neuroimaging Software
  - **Range:** Neuroimaging_Software_enum
  - **Options:**
    - AFNI
    - SPM
    - FSL
    - Freesurfer
    - NA

- **Imaging_Modality**
  - **Description:** Imaging Modality
  - **Range:** Imaging_Modality_enum
  - **Options:**
    - DWI
    - Structural
    - Functional
    - Task-based
    - Resting-State
    - EEG
    - Behavioral
    - MEG
    - MRI
    - NA

- **Open_Dataset**
  - **Description:** Open Dataset
  - **Range:** Open_dataset_enum
  - **Options:**
    - Yes
    - No
    - NA

- **Last_Updated**
  - **Description:** Last Updated
  - **Range:** string

- **Functionality**
  - **Description:** Functionality
  - **Range:** string

- **Assessment**
  - **Description:** Assessment
  - **Range:** Assessment_enum
  - **Options:**
    - Yes
    - No
    - NA

- **Prerequisite**
  - **Description:** Prerequisite
  - **Range:** string

- **Source**
  - **Description:** Source
  - **Range:** string

- **Review**
  - **Description:** Review
  - **Range:** string

- **Exclude_from_ReproInventory**
  - **Description:** Exclude from ReproInventory
  - **Range:** Exclude_from_ReproInventory_enum
  - **Options:**
    - Yes
    - No
    - NA

- **Alias_Links**
  - **Description:** Alias Links
  - **Range:** string

- **Notes**
  - **Description:** Notes
  - **Range:** string

- **Quadrants**
  - **Description:** Quadrants
  - **Range:** Quadrants_enum
  - **Options:**
    - information-oriented (reference)
    - understanding-oriented (explanation)
    - learning-oriented (tutorials)
    - problem-oriented (how to guides)
    - NA
