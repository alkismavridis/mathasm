# Instructions on installing the app.


### 1. git clone
Once you have cloned the repository, open the app with intellij.
**Definition: lets call the directory that you downloaded the project PROJECT_ROOT**.
Inside the PROJECT_ROOT you should seedirectories such us **frontend**, **ProgrammerPlace**, **src** etc...

For my linux machine, for example, the PROJECT_ROOT is /home/alkis/IdeaProjects/mathasm


### 2. install dependencies
Install the maven dependencies (intellij should pop up a dialog on the bottom-right of your screen).

Next step is to install the npm dependencies. If intellij does not do that automatically, you can just open a terminal
(from intellij or some external one), cd to PROJECT_ROOT/frontend and run:
- npm install


### 3. FileSystem.
MathAsm will will need a couple of files to exist in your file system, in order for it to run.
For keeping things neat and clean, will will limit the whole MathAsm filesystem under one directory.
Lets name this **APP_ROOT**.

For my linux machine, for example, the PROJECT_ROOT is /home/alkis/data/MathAsm


### 3.1 The configuration file
This is the most important one. It must be a json file that holds all the configuration of the app.
The both linux and windows configuration examples lie on this directory (linuxConfig.json and winConfig.json).

The configuration file can be wherever on your pc. The app will find it though a java option that must de provided:
-DmathAsmConfigFile="APP_ROOT/config1.json".

Please note that APP_ROOT is just an alias.
In my system, for example this is:

-DmathAsmConfigFile="/home/alkis/data/MathAsm/config1.json"

You have to change this configuration, and replace APP_ROOT with the directory of your preference.
The json file name is also freely chosen. Just put the configuration file name that really exists on your system.

If you run the application though intellij, you can edit this configuration by opening editConfigurations, go to spring runner
and add the VM options field.

The configuration file has at the moment the following properties:
- dbUri: the directory where the database lies. Yes, DB is just a directory for our application. You can choose this directory being wherever you whish.
   It is just has to exists. MathAsm will create a ton of files inside it. Deleting this directories