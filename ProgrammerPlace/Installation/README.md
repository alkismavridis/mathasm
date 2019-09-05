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
-DmathAsmDataDir="APP_ROOT/".

Please note that APP_ROOT is just an alias.
In my system, for example this is:

-DmathAsmDataDir="/home/alkis/data/MathAsm/production"

You have to change this configuration, and replace APP_ROOT with the directory of your preference.
The json file name is also freely chosen. Just put the configuration file name that really exists on your system.

If you run the application though intellij, you can edit this configuration by opening editConfigurations, go to spring runner
and add the VM options field.

The configuration file has at the moment the following properties:
- **dbUri**: the directory where the database lies. Yes, DB is just a directory for our application. You can choose this directory being wherever you wish.
   It is just has to exists. MathAsm will create a ton of files inside it. Deleting this directories
- **rootUserPassword**: When the application finds an empty database, a root user will be created. This will be its password.
- **defaultLanguage**: the code of the default app's language, such as "en" or "de".


### 3.2 The DB directory.
This is the directory URI specified by the configuration's dbUri.
There is no naming convention of location for that. Use any dir you like.
But in order to keep things neat and clean, we strongly suggest that the DB directory lies under the **APP_ROOT**
that we talked about before.

The directory has to exists. For the first time that you will run the application, an empty directory is enough.
After running the app, you will see a ton of files being created there. Those hold all the information for the database.

- If you want to "drop" your whole DB, stop the app, empty out this directory and start again.
- If you want to start the app with a second database, but leave the "original" on intact, stop the app,
    create a second directory and update the json configuration file to point to the second DB dir. Run the app, and
    the second will be used. The original one will not be affected in any way. Revert to the original using the same steps.
    
### 4. Unit Tests files:
It is a good idea that unit tests will have their own configuration file and their own DB directory.
Fell free to create a testConfig.json and a test_db directory for it. This way, your real DB will never be affected
by running unit tests. Evil stuff will happen if you try to use the same DB directory for unit tests and production.


### 5. Summary:
My file system looks like that:
APP_ROOT
- config.json
- testConfig.json
- db/
  - (empty in the begining, a lot of stuff once the app runs)
- test_db/
  - (empty in the begining, a lot of stuff once the unit tests run)


Please note that config.json has **dbUri:APP_ROOT/db**,
but the testConfig.json has **dbUri:APP_ROOT/test_db**



### 6. Production build
To generate the jars go to project root folder and run
- mvn clean
- mvn -Dmaven.test.skip=true package

This will produce the target folder and some .jars in it.
The application is in target/mathasm-0.0.1-SNAPSHOT.jar

Run the app:
- java -jar -DmathAsmDataDir="/home/alkis/data/MathAsm/production"
