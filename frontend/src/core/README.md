This directory contains all business logic of our frontend application.

Guidelines:
1. The code in this directory is framework agnostic.
There will be NOTHING in this directory that "smells" react or angular or whatever.
If for whatever reason we chose to change our framework tomorrow, this directory will stay INTACT!

2. We put AS MUCH CODE AS POSSIBLE in this directory.
Bussiness logic here Http requests here. URL Routing here. It is all here.

3. We put AS LESS CODE AS POSSIBLE outside of this directory.
And this code should be dumm and stupid. All important stuff will go into this directory.
The framework directory should only perform rendering and event passing. And when I write event handling,
I mean calling some method inside this directory that will de the actual job.

4. The framework will be notified for changes (so that it re-renders properly) through subjects/subscriptions.
User does something, framework calls some function inside this directory,
we perform that business logic stuff, then we fire the subject, then the framework re-renders and everybody is happy.
