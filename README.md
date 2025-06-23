# ReproInventory
A repo for developing the ReproNim inventory of training resources.

# Background
**ReproNim** has developed a lot of [training resources](https://www.repronim.org/teach.html). 
The **[INCF-ReproNim Fellows](https://www.repronim.org/fellowship.html)** have developed a lot of [training resources](https://www.repronim.org/fellows-resources) including a [Training Tool-kit](https://drive.google.com/drive/u/0/folders/1_qLgvQAI_71768_45gMBb7n4DpsY7Wil).
The community (neuroimaging and beyond) have developed a lot of training resources. When a user is faced with the 
desire to 'teach' a topic, how do they navigate all this content to find (or adapt, as needed) the right resources 
to start from?

We seek to create a ***ReproNim Inventory of Training Resources*** to help find what's out there so that users can more efficiently 
identify, reuse and adapt existing resources instead of always starting from scratch.

## Similar Inventories Efforts
We know of a number of existing resources that have attempted to do parts of this. These include (but are not limited to):
* [ReproRehabDB](https://reprorehabdb.usc.edu/)
* [LearnNeuroimaging/Hitchhacker's guide to the brain](https://learn-neuroimaging.github.io/hitchhackers_guide_brain/)
* [NITRC Training Resource Query](https://www.nitrc.org/search/?type_of_search=group&q=training)
* [BrainHack School Training Modules](https://school-brainhack.github.io/modules/)
* [INCF Training Space](https://training.incf.org/)
* [Neuroimaging Carpentry](https://conp-pcno-training.github.io/neuroimaging-carpentry/)
  * [Software Carpentry](https://www.software-carpentry.org/)
* And many more! (add your faviorites here!)


## Other specific Resources we should make sure are included
Want other specific resources included, add them here (or file an issue)

# What do we need to do?
* Review ***existing*** inventories
* Expand ***content***
  * For each resource, what do we want to know about it?
    * Identify the training resource 'schema' that we want to use

* Adopt a ***front end*** (how the content is displayed) and associated ***back end*** to store the information
  * What do we really want to see?
     * Search: by topic tag (i.e. git), by format (i.e. hands-on tutorial), by level (i.e. first-timers), by duration (i.e. 3 hour), etc. 
  * Do any of the existing platforms already do this?
     * Which comes closest? 

     
# Our Training Resource Description Model

Our current model (v_0.0.1) is expressed in YAML [here](model/model.yaml). A more human-readable version of that model is [here](model/model.md).


# Project development (OHBM Hackathon)

OHBM 2025 - [project-ohbm-hackathon here](https://github.com/ohbm/hackathon2025/issues/7)

# Developer Documentation

## Frontend

Example figure from the frontend (on 'dummy' data):
![image](pics/ExampleViewer.png)

### Build dependencies

- nodejs

  You can install from https://nodejs.org/en/download/

### Local development

- Get the project source code

  ```bash
  git clone https://github.com/ReproNim/ReproInventory.git
  ```

- Install dependencies

```bash
cd frontend
npm install
```

- Now run the app by running

```bash
npm run dev
```
