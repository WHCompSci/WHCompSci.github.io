// add new projects to the projects array. 
// use firstname last initial
const projects = [
    {
        name: "Neural Network",
        href: "/projects/neural-networks/index.html",
        authors: [
            "Charlie P",
            "Oleksandr P",
            "Tanner K"
        ]
    },

    {
        name: "Schooldle",
        href: "/projects/schooldle/index.html",
        authors: [
            "Nick S",
            "Tanner K"
        ]
    },
    {
        name: "Othello",
        href: "/projects/othello/index.html",
        authors: [
            "Alex S",
            "Nick S"
        ]
    },
    {
        name: "Othello AI",
        href: "/projects/othello-ai/index.html",
        authors: [
            "Alex S",
            "Tanner K"
        ]
    },
    {
        name: "Sokoban",
        href: "/projects/sokoban/index.html",
        authors: [
            "Franco G",
            "Tanner K"
        ]
    },
    {

        name: "Flappy Bird",
        href: "/projects/flappy-bird/index.html",
        authors: [
            "Siena K",
            "Tanner K"
        ]

    },
    {
        name: "Penguin Game",
        href: "/projects/penguin-game/index.html",
        authors: [
            "Nick S",
        ]
    },
    {
        
        name: "Color Wars",
        href: "/projects/color-wars/index.html",
        authors: [
            "Alex S",
            "Tanner K"
        ]

    },
    {
        
        name: "Brownian Trees",
        href: "/projects/dla-simulation/index.html",
        authors: [
            "Tanner K"
        ]
        
    },
    {
        name: "Wrestling Calculator",
        href: "/projects/wrestling/index.html",
        authors: [
            "Johnathan C",
            "Tanner K"
        ]
    },
    {
        name: "Text Formatter",
        href: "/projects/text-formatter/index.html",
        authors: [
            "Cecilia O",
            "Tanner K"
        ]
    },

]

const container = document.querySelector("#card-list")
const card = (project) => 
`<a href="${project.href}" class="card" >
    <div class="card-content">
        <h3 class="card-heading">${project.name}</h3>
        ${project.authors ? "<div class=\"authors-subheading\">Creators</div>" : ""}
        ${project.authors.map(a => `<span class="author">${a}</span>`).join(" ")}
    </div>
</a>`


container.innerHTML += projects.map(card).join(" ")
