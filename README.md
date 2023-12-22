# Warren Hills Computer Science Website

- This is a website where students in Mr. Detrick's Honors Advanced Topics CS class can post projects.

- The website is hosted at [whcompsci.github.io](https://whcompsci.github.io/).

## How to add a project to the site

1. Create a Github account if you haven't already. (You should use your personal email and not the school email becuase the school email is deleted after you graduate)
2. Install [Git](https://git-scm.com/downloads) if it isn't already installed. (check by typing `git --version` in the command line, if it says "command not found" then you need to install it)
3. Download [VSCode](https://code.visualstudio.com/download) if it isn't already installed.

4. Clone the repository to your computer. You can do this by clicking the green "Code" button on the top right of the repository page and copying the link. Then, in VSCode, press `Ctrl+Shift+P` and type in "Git: Clone" and paste the link. Then, choose a location to save the repository.
   - Tip: make a folder for all your repositories so you can find them easily.
5. Open VSCode and open the folder you just cloned. (File -> Open Folder or `Ctrl+Shift+O`)

6. Create a new branch. You can do this by pressing `Ctrl+Shift+P` and typing in "Git: Create Branch" and then typing in a name for your branch. I'd recommend using your name. You can use this branch for all your changes.

7. Before you do anything else, make sure you're on your branch. You can do this by pressing `Ctrl+Shift+P` and typing in "Git: Checkout to" and then typing in your branch name. You can also see what branch you're on in the bottom left of your screen. It's also a good idea to pull from the repository before you make any changes. You can do this by pressing `Ctrl+Shift+P` and typing in "Git: Pull".

8. Create a new folder in the `projects` folder. Name it whatever you want your project to be called.

9. If you've never written HTML before, I'd recommend looking at [this tutorial](https://www.tutorialspoint.com/html/index.htm) to get a basic understanding of how it works. You can also look at the other projects in the `projects` folder to see how they work.

10. Create an `index.html` file in your project folder. This is the file that will be displayed when someone goes to your project.

11. Add your project to the `index.html` file in the root folder (not in a folder). You can do this by adding a new `<a>` tag to the list of projects. The `<a>` tag should look like this:

```html
<a href="projects/your-project-folder-name/index.html">Your Project Name</a>
```

12. To save, press `Ctrl+S`. I would recommend turning on autosave so you don't have to do this every time you make a change. You can do this by going to File -> Preferences -> Settings and searching for "Auto Save". Then, click "Auto Save" and choose "After delay".

Make sure to replace `your-project-folder-name` with the name of your project folder and `Your Project Name` with the name of your project.

Congratulations! You've added your project to the site! Now you can add whatever you want to your project folder. You can add images, CSS files, Javascript files, etc.

- Tip: If you add other files to your project folder, add a `src` folder to your project folder and put all your files other than `index.html` in there. You can also add an `img` folder for images. This will make it easier to find your files.

An example project folder structure:

```
your-project-folder-name
├── index.html
├── img
│   └── image.png
└── src
    ├── style.css
    └── script.js
```

## How to commit your changes

Committing your changes is how you save your changes to the repository. You can do this by pressing `Ctrl+Shift+G` or clicking the "Source Control" button on the left side of your screen. Then, type in a commit message and press the checkmark button. Then, press the three dots button and click "Push". This will push your changes to your branch on the repository.

- Tip: You have to put in a commit message or it won't work. If you don't know what to put, just put "Update" or something like that.

## How to see your website

So you've added your project to the site, but how do you see what it looks like?

All you have to do is open your `index.html` file in your file explorer. It should open in your browser and you should be able to see your project.

This works, but it's annoying. You have to open your file explorer every time you want to test your project- and you have to reload it every time you want to change the site. Luckily, there's a better way.

1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension for VSCode. You can do this by pressing `Ctrl+Shift+X` and searching for "Live Server". Then, click "Install".
2. Open your project folder in VSCode. Then, right click on the `index.html` file and click "Open with Live Server". This should open your project in your browser. (Or there should be a button in the bottom right of your screen that says "Go Live". Click that.)

Now, whenever you make a change to your project, it should automatically reload in your browser. This makes it much easier to test your project.

## How to submit your project

When you're done with your project, or whenever you want your changes to be on the public site, you can submit a pull request. This will merge your branch with the main branch.

Login to GitHub with the whcompsci account.

1. Go to the repository page and click the "Pull requests" tab.

2. Click "New pull request".

3. Click "compare across forks".

4. Then, change the "head repository" to your repository and the "head branch" to your branch.

5. Then, click "Create pull request".

6. Type in a title and description for your pull request and click "Create pull request".

7. Then, click "Merge pull request" and "Confirm merge". This will merge your branch with the main branch.

8. If your project is done, you can delete your branch. You can do this by going to the "Branches" tab and clicking the trash can next to your branch.

## How to update your project

Whenever you want to update your project, you can just make changes to your project folder and commit them. Then, submit a pull request to merge your branch with the main branch.

## Javascript and CSS

So far, we've only talked about HTML. But you can also use Javascript and CSS in your projects.

### Javascript

- [Javascript](https://www.w3schools.com/js/default.asp) is a programming language that runs in your browser. 
- Despite the name, it's pretty different from Java. 
- You can use it to make your website interactive. You can use it to make buttons do things, make animations, etc.
- Once you are comfortable with Javascript, I'd recommend learning [JQuery](https://www.w3schools.com/jquery/). It shortens your code and makes it easier to use Javascript.

### CSS

- [CSS](https://www.w3schools.com/css/default.asp) is a language that lets you style your website. You can use it to change the color of text, change the size of text, change the background color of your website, etc.

  - Tip: Once you've learned CSS and used it for a few projects, learn [Tailwind](https://tailwindcss.com/), a CSS framework. It makes it much easier to style your website and for me, it's much more fun to use than regular CSS.

To Start, I'd recommend learning the basics of HTML, CSS, and Javascript. Then, you can start using them in your projects. You can also look at the other projects in the `projects` folder to see how they use HTML, CSS, and Javascript.
